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


def get_news_data(keywords: str = '',
                  sources: str = '',
                  time_delta=1,
                  language='en',
                  sort_by='relevancy',
                  save=False) -> None:
    """
    Note: Free plan enables only 50 requests per 12 hours.
    :param save:
    :param keywords:
    :param sources:
    :param time_delta:
    :param language:
    :param sort_by:
    :return:
    """
    suffix_str = '_'.join([x for x in keywords.split(',') if x])
    assert len(keywords) < 500, 'Maximum size of key_words argument is 500'
    assert all([s.strip() in SOURCE_ID + [""] for s in sources.split(',')]) or sources is None, \
        f'Source must be one of the following: {SOURCE_ID + [""]}, got {sources}'
    assert language in LANGUAGES + [""], f'Language argument must take one of the following values: {LANGUAGES + [""]}'

    if sort_by:
        assert sort_by in ['publishedAt', 'relevancy', 'popularity'], f'sort_by value must be in in: ' \
                                                                      f'{["publishedAt", "relevancy", "popularity"]}'
    assert len([x for x in [keywords, sources] if x != '']) > 0, \
        'At least key_words or sources args must be specified'

    all_news = {'articles': []}

    if sources:
        try:
            for s in tqdm([x.strip() for x in sources.split(',') if x]):
                response = news_client.get_everything(
                    q=keywords,
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
                q=keywords,
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
        with open(f'{os.getcwd()}/data/news_recent_{language}_{sort_by}_last_{time_delta}d_{suffix_str}_data.json',
                  'w') as f:
            json.dump(all_news, f)

    else:
        logger.info("Nothing to store")


def get_top_headlines(keywords: str = '',
                      sources: str = '',
                      category: str = '',
                      language: str = 'en',
                      country: str = '') -> list:
    assert len(keywords) < 500, 'Maximum size of key_words argument is 500'
    assert all([s.strip() in SOURCE_ID + [""] for s in sources.split(',')]) or sources is None, \
        f'Source must be one of the following: {SOURCE_ID + [""]}, got {sources}'
    assert language in LANGUAGES + [""], f'Language argument must take one of the following values: {LANGUAGES + [""]}'
    assert country in COUNTRIES + [""], f'Country argument must take one of the following values: {COUNTRIES + [""]}'
    assert category in CATEGORIES + [
        ""], f'Category argument must take one of the following values: {CATEGORIES + [""]}'
    assert len([x for x in [keywords, sources, category] if x != '']) > 0, \
        'At least keywords, sources, or category args must be specified'

    if not sources:
        res = news_client.get_top_headlines(
            q=keywords,
            category=category,
            language=language,
            # country=country,
            page_size=100)
    else:
        res = news_client.get_top_headlines(
            q=keywords,
            sources=sources,
            language=language,
            page_size=100)

    if res['status'] == 'ok':
        return res['articles']

    else:
        return []


def get_all_cat_top_headlines(keywords: str = '', categories=None, dump: bool = True):
    suffix = 'all' if not keywords else '_'.join([w.strip() for w in keywords.split(',') if w])

    if categories is None:
        data = get_top_headlines(keywords=keywords)

    else:
        data = []
        for category in tqdm(categories):
            res = get_top_headlines(keywords=keywords, category=category)
            data.extend(res)

    if dump:
        logger.info(f"Saving result to {f'/data/news_recent_top_en_{suffix}.json ...'}")
        with open(f'{os.getcwd()}/data/headlines_recent_top_en_{suffix}.json', 'w') as f:
            json.dump(data, f)
        logger.info('Done.')

    return data


def get_all_headlines(categories: list) -> None:
    keywords = [
        # None,
        # 'politics', 'environment', 'crisis', 'selections', 'ev', 'crypto',
        'bitcoin', 'ai', 'gpt', 'ethereum', 'finance', 'llm',
    ]
    for kw in keywords:
        logger.info(f'Getting and saving data for {kw} keyword...')
        if kw is None:
            get_all_cat_top_headlines(categories=categories)
        else:
            get_all_cat_top_headlines(keywords=kw, categories=categories)


def get_all_news() -> None:
    keywords = [
        'global',
        'politics', 'environment', 'crisis', 'selections', 'ev', 'crypto',
        'bitcoin', 'ai', 'gpt', 'ethereum', 'finance', 'llm',
    ]
    for kw in keywords:
        logger.info(f'Getting and saving data for {kw} keyword...')
        get_news_data(keywords=kw, time_delta=15, save=True)


async def main():
    print("Starting bot polling")

    # get_all_headlines(categories=CATEGORIES)
    get_all_news()
    # await dp.start_polling(bot)


if __name__ == "__main__":
    print("Running main function")
    asyncio.run(main())
