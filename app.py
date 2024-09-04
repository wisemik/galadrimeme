import asyncio
from typing import Any, List, Tuple

import os
import openai
import logging
import time

from dotenv import load_dotenv
from openai import OpenAI, AsyncOpenAI
from datetime import datetime, timedelta
from tqdm import tqdm
from newsapi import NewsApiClient
from newsapi.newsapi_exception import NewsAPIException
from utils.source_id import SOURCE_ID, CATEGORIES, LANGUAGES, COUNTRIES
import json

import google.generativeai as genai

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
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
news_client = NewsApiClient(api_key=os.getenv("NEWS_API_KEY"))
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
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


def get_all_news(time_delta: int = 1) -> None:
    keywords = [
        'global',
        'politics', 'environment', 'crisis', 'selections', 'ev', 'crypto',
        'bitcoin', 'ai', 'gpt', 'ethereum', 'finance', 'llm',
    ]
    for kw in keywords:
        logger.info(f'Getting and saving data for {kw} keyword...')
        get_news_data(keywords=kw, time_delta=time_delta, save=True)


def openai_upload_file(name: str):
    client.files.create(
        file=open(f"{os.getcwd()}/data/{name}", "rb"),
        purpose='assistants'
    )


def openai_models_list():
    logger.info(client.models.list())


async def news_categorization_gemini(text: str, product_description: str, target_audience_description: str) -> str:
    try:
        model = genai.GenerativeModel('gemini-1.5-pro-latest')
        response = model.generate_content(f"""    

Task Definition:

Analyze the provided text, which may contain complex, disordered, or non-standard news data.

Focus on extracting significant news details directly from the text, with ratings based on the following parameters:

- **Relevance to Product** (Rate from 0 to 10 based on the alignment with the provided product description)
- **Hype** (Rate from 0 to 10)
- **Audience Engagement Potential** (Rate from 0 to 10 based on the likelihood of engaging the described target audience)
- **Positive** (Rate from 0 to 10 based on how positive or uplifting the news is)
- **Fun** (Rate from 0 to 10 based on the entertainment or fun factor of the news)

Input:

- **Product Description**: `{product_description}`
- **Target Audience Description**: `{target_audience_description}`
- **News Data**: `{text}`


Output the Top 10 most relevant news (array) items in JSON format 
with the following information for each object (dictionary):
"News": "Brief description of the news.",
"Relevance Score": 0-10,
"Relevance Justification": "Why this score was assigned.",
"Hype Score": 0-10,
"Hype Justification": "Why this score was assigned.",
"Audience Engagement Potential": 0-10,
"Engagement Justification": "Why this score was assigned."
"Positive Score": 0-10,
"Positive Justification": "Why this score was assigned.",
"Fun Score": 0-10,
"Fun Justification": "Why this score was assigned."
"Overall Score": "The arithmetic average of all the above scores."
"Link": "Link to the full news article."
        """)
        return response.text
    except Exception as e:
        print(f"Error generating poem: {e}")
        return "Error "


async def openai_summarize_news(text: str) -> dict:
    logger.info("Sending text and prompt to OpenAI...")
    prompt = f"""
    *1.1 Task Definition*
       - Analyze the provided text which may contain complex, misordered, or non-standard news data.
       - Focus particularly on extracting significant news details directly from the text:
         - Hype. 
         - Global and important stuff.
         - Technological breakthrough.
         - Funny moments.
         - Politics.
         - Meme.
         - Crypto.

       - data: {text}

   *1.2 Focus on User Objective*
      - Provide the following information (if any) in JSON format:
      {{
        "Most relevant news": "Brief description of most relevant news.",
        "Strategy": "Marketing strategy applicable to my case and based on the hype news.",
        "Features": "Most relevant and shocking features of the current world news.",
        "Meme": "Come up with a meme concept that captures the biggest news buzz. Give a thought for the target demographic, catchphrase, image, and intriguing title.",
      }}
    """

    system_message = """
        You are acting as a analyst and marketing strategy assistant tasked with extracting key news from the provided news data. 
        The text may contain raw news and headlines, some embedded within sentences. 
        Ignore technical details containing in files, for instance, json or dictionary keys. 
        Your response should be clear and structured, avoiding references to external documents.
        """

    try:
        processing_start = time.time()
        response = await client.chat.completions.create(
            # model="gpt-4o",
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {'role': 'system', 'content': system_message},
                {'role': 'user', 'content': prompt}
            ],
            temperature=0.5,
            max_tokens=3000,
            top_p=1.0,
            frequency_penalty=0.1,
            presence_penalty=0.2
        )

        # Correct handling of response using the client library's response objects
        content = response.choices[0].message.content  # Directly access the content
        sum_dict = json.loads(content)  # Parse JSON content
        logger.info(f"Response retreived successfully, passed {round(time.time()-processing_start, 3)} sec.")
        logger.info("API Call Successful:", sum_dict)

        return sum_dict

    except (KeyError, json.JSONDecodeError) as e:
        print("Failed to decode JSON:", str(e))
        return {'error': {"code": "", "text": f"Error: Failed to decode JSON. {e}"}}

    except AttributeError as e:
        print("Response handling error:", str(e))
        return {'error': {"code": "", "text": f"Error: Response handling error. {e}"}}

    except Exception as e:
        print("API Error Here")
        print({'error': {"code": "", "text": f"Error: Failed to generate summary. {e}"}})
        return {'error': {"code": "", "text": f"Error: Failed to generate summary. {e}"}}


def get_news_files(kind: str = 'news') -> List[dict]:
    assert kind in ['headlines', 'news', 'all'], \
        "king argument must take one of the following values: 'headlines', 'news', 'all'"

    content = os.listdir(f"{os.getcwd()}/data")
    if kind != 'all':
        content = [c for c in content if c.startswith(kind+'_')]
    files = []
    for c in content:
        with open(f'{os.getcwd()}/data/{c}') as f:
            obj = json.load(f)

            if obj:
                if isinstance(obj, dict):
                    files.extend(obj['articles'])
                else:
                    files.extend(obj)

    return files


async def main():
    print("Starting bot polling")

    # get_all_headlines(categories=CATEGORIES)
    get_all_news(time_delta=15)
#     files = get_news_files(kind='news')
#     text = ' \n'.join([str(x) for x in files[:50]])  # limit number of instances we are feeding OpenAI
#     # response = await openai_summarize_news(text=text)
#
#     product_description = """AI HR assistant"""
#     target_audience_description = """Age: 25-45 years old
# Gender: All genders
# Role: Corporate professionals, HR managers, and business owners
# Location: Primarily Russia and Europe, with a focus on urban and suburban areas
# Income Level: Middle to high income"""
#     response = await news_categorization_gemini(text=text, product_description=product_description,
#                                                 target_audience_description=target_audience_description)
#     print(response)

    # await dp.start_polling(bot)


if __name__ == "__main__":
    print("Running main function")
    asyncio.run(main())
