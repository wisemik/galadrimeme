import asyncio
from typing import Any, List

import os
import openai
import logging

from dotenv import load_dotenv
from openai import OpenAI
from datetime import datetime, timedelta
from tqdm import tqdm
from newsapi import NewsApiClient
from newsapi.newsapi_exception import NewsAPIException
from utils.source_id import SOURCE_ID, CATEGORIES, LANGUAGES, COUNTRIES
import json

from aiogram.types import FSInputFile
from aiogram import Bot, Dispatcher, types
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.filters.command import Command
from aiogram import F

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("debug.log"),
        logging.StreamHandler()
    ]
)

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
news_client = NewsApiClient(api_key=os.getenv("NEWS_API_KEY"))
openai.api_key = os.getenv("OPENAI_API_KEY")
session = AiohttpSession()
bot = Bot(token=os.getenv("TELEGRAM_BOT_TOKEN"))
dp = Dispatcher()
BOT_HI_MESSAGE = (
    "🤖 Welcome to Galadrimeme Bot 💪😎👌\n\n"
)


@dp.message(Command("start"))
async def command_start(message: types.Message):
    print("Received /start command")
    await message.reply(BOT_HI_MESSAGE)


@dp.message(F.text)
async def handle_text(message: types.Message) -> None:
    print(f"Received text message: {message.text}")
    await message.reply("✍️" + message.text)


def escape_markdown(text: str) -> str:
    print(f"Escaping markdown for text: {text}")
    escape_chars = r'_[]*()~`>#+-=|{}.!'
    escaped_text = ''.join(f'\\{char}' if char in escape_chars else char for char in text)
    print(f"Escaped text: {escaped_text}")
    return escaped_text


async def send_long_message(message: types.Message, text: str):
    print(f"Sending long message with text: {text}")
    max_length = 4000
    escaped_text = escape_markdown(text)
    if len(escaped_text) > max_length:
        parts = [escaped_text[i:i + max_length] for i in range(0, len(escaped_text), max_length)]
        print(f"Message is too long, splitting into parts: {len(parts)} parts")
        for part in parts:
            await message.reply(part, parse_mode="MarkdownV2")
    else:
        print("Message fits within the limit, sending as is")
        await message.reply(escaped_text, parse_mode="MarkdownV2")


def get_all_news(key_words: str = '',
                 sources: str = '',
                 time_delta=1,
                 language='en',
                 sort_by='relevancy',
                 save=False) -> None:
    """
    Note: Free plan enables only 50 requests per 12 hours.
    :param save:
    :param key_words:
    :param sources:
    :param time_delta:
    :param language:
    :param sort_by:
    :return:
    """
    assert len(key_words) < 500, 'Maximum size of key_words argument is 500'
    assert any([s.strip() for s in sources.split(',') if s.strip() in SOURCE_ID]), \
        f'source must be one of the following: {SOURCE_ID}'
    assert language in LANGUAGES, f'Language argument must take one of the following values: {LANGUAGES}'

    if sort_by:
        assert sort_by in ['publishedAt', 'relevancy', 'popularity'], f'sort_by value must be in in: ' \
                                                                      f'{["publishedAt", "relevancy", "popularity"]}'
    assert len([x for x in [key_words, sources] if x != '']) > 0, \
        'At least key_words or sources args must be specified'

    all_news = {'articles': []}

    if sources:
        try:
            for s in tqdm([x.strip() for x in sources.split(',') if x]):
                response = news_client.get_everything(
                    q=key_words,
                    sources=s,
                    from_param=(datetime.now() - timedelta(days=time_delta)).strftime('%Y-%m-%d'),
                    language=language,
                    sort_by=sort_by,
                )

                if response['status'] == 'ok':
                    all_news['articles'].extend(response['articles'])

        except NewsAPIException as e:
            # TO DO
            logger.warning(e)
            pass

    else:
        try:
            response = news_client.get_everything(
                q=key_words,
                sources=sources,
                from_param=(datetime.now() - timedelta(days=time_delta)).strftime('%Y-%m-%d'),
                language=language,
                sort_by=sort_by,
            )

            if response['status'] == 'ok':
                all_news['articles'].extend(response['articles'])

        except NewsAPIException as e:
            # TO DO
            logger.warning(e)
            pass

    if all_news['articles'] and save:
        with open('news_data.json', 'w') as f:
            json.dump(all_news, f)

    else:
        logger.info(e)


async def main():
    print("Starting bot polling")
    get_all_news(time_delta=5, sources=','.join(SOURCE_ID), save=True)
    # await dp.start_polling(bot)


if __name__ == "__main__":
    print("Running main function")
    asyncio.run(main())
