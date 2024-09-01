import asyncio
from typing import Any

import os

from dotenv import load_dotenv
from openai import OpenAI
import openai
import json

from aiogram.types import FSInputFile
from aiogram import Bot, Dispatcher, types
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.filters.command import Command
from aiogram import F

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
openai.api_key = os.getenv("OPENAI_API_KEY")
session = AiohttpSession()
bot = Bot(token=os.getenv("TELEGRAM_BOT_TOKEN"))
dp = Dispatcher()
BOT_HI_MESSAGE = (
    "🤖 Welcome to Galadrimeme Bot 📚🎵\n\n"
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


async def main():
    print("Starting bot polling")
    await dp.start_polling(bot)


if __name__ == "__main__":
    print("Running main function")
    asyncio.run(main())
