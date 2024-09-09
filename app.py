import asyncio
from typing import Any, List, Tuple

import os
import openai
import logging
import time
import subprocess
import re
import ast
import chompjs
from asyncer import asyncify

from dotenv import load_dotenv
from openai import OpenAI, AsyncOpenAI
from datetime import datetime, timedelta
from tqdm import tqdm
from newsapi import NewsApiClient
from newsapi.newsapi_exception import NewsAPIException
from utils.source_id import SOURCE_ID, CATEGORIES, LANGUAGES, COUNTRIES
import json
from web3 import utils as web3_utils
from web3 import Web3
from web3.middleware import geth_poa_middleware
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

# RPC_URL = os.getenv('RPC_URL')
# PRIVATE_KEY = os.getenv('PRIVATE_KEY')
# CONTRACT_NFT_ADDRESS = os.getenv('CONTRACT_NFT_ADDRESS')
#
# web3 = Web3(Web3.HTTPProvider(RPC_URL))
# web3.middleware_onion.inject(geth_poa_middleware, layer=0)
# if not web3.is_connected():
#     raise ConnectionError("Unable to connect to Ethereum node")
#
# with open('./DalleNft.json', 'r') as file:
#     contract_abi = json.load(file)
# account = web3.eth.account.from_key(PRIVATE_KEY)
#
# contract = web3.eth.contract(address=CONTRACT_NFT_ADDRESS, abi=contract_abi)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
news_client = NewsApiClient(api_key=os.getenv("NEWS_API_KEY"))
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
openai.api_key = os.getenv("OPENAI_API_KEY")
session = AiohttpSession()
bot = Bot(token=os.getenv("TELEGRAM_BOT_TOKEN"))
dp = Dispatcher()
BOT_HI_MESSAGE = (
    "🤖 Welcome to Galadrimeme Bot 💪😎👌\n\n"
)
recipient_address = None
is_authorized_address = False
main_idea = None


# @dp.message(Command("start"))
# async def command_start(message: types.Message):
#     print("Received /start command")
#     global recipient_address  # Declare it global to modify the global variable
#     match = re.match(r'/start\s+(.+)', message.text)
#     if match:
#         recipient_address = match.group(1)
#         await message.reply("Address for NFTs saved!")
#     else:
#         await message.reply("Please provide the text after the command. Example: "
#                             "/start 0x15eA00EF924F8aD0efCbB852da63Cc34321ca746")

@dp.message(Command("start"))
async def command_start(message: types.Message):
    print("Received /start command")
    await message.reply("Hello! \nThis is the fantastic and amiable MemeCoin generating service, Galadrimeme 🐱. \n\nHere, "
                        "you may issue your own coin with a single command in addition to generating a MemeCoin idea "
                        "concept based on the most recent news and hype! ")
    await message.reply("Kick off your journey by verifying your account address. Example: "
                        "/auth 0x...")


@dp.message(Command("auth"))
async def command_authorize(message: types.Message):
    global recipient_address  # Declare it global to modify the global variable
    global is_authorized_address

    with open(os.getcwd()+"/attestation/schemas/account_validation.json") as f:
        auth_schema_id = json.load(f)['account_validation']['schemaId']

    match = re.match(r'/auth\s+(.+)', message.text)

    if match:
        recipient_address = match.group(1)
        await message.reply("Awaiting address validation...")
        if recipient_address.startswith('0x') and len(recipient_address) == 42:

            attest = attest_schema(schema_id=auth_schema_id,
                                   arg1='authStatement',
                                   arg2='signer',
                                   data='Address is valid.',
                                   signer=recipient_address,
                                   attest_by="0x298f9539e484D345CAd143461E4aA3136292a741")

            is_authorized_address = True

            await message.reply("Address for NFTs saved!")
            await message.reply(f"Address is valid and signed via Sign Protocol. \nFind more information here: "
                                f"https://testnet-scan.sign.global/attestation/onchain_evm_84532_{attest['attestationId']}")
        else:
            await message.reply("Address must start with 0x. Please start again.")
            await message.reply("Please provide the text after the command. Example: "
                                "/auth 0x...")
    else:
        await message.reply("Please provide the text after the command. Example: "
                            "/auth 0x...")


@dp.message(Command("memecoin"))
async def command_memecoin(message: types.Message):
    global main_idea

    if is_authorized_address:
        await message.reply("Generating an awesome Meme idea...")
        meme_idea = get_meme_idea_assets()
        main_idea = meme_idea['concept']

        await message.reply(f"""
        Based on the last news we suggest the following idea:
        {json.dumps(meme_idea, indent=3, sort_keys=True)}
        """.replace('{', '').replace('}', ''))
        rank = openai_idea_rank(meme_idea['image description'])

        if rank['fun_rank'] > 3 and rank['tolerance_rank'] > 5:
            await message.reply(f"Our AI agent thinks this concept is fantastic. Score: {rank['fun_rank']}")
            await message.reply(f"It is important that the idea is not harmful and tolerant. Score: {rank['tolerance_rank']}")
        else:
            await message.reply("Please consider generating new idea because the one listed above may not be so fun.")

        if main_idea:
            await message.reply("Galadrimeme attesting that your idea is thick...")
            with open(os.getcwd()+"/attestation/schemas/meme_idea_is_thick.json") as f:
                idea_schema_id = json.load(f)['meme_idea_is_thick']['schemaId']

            await message.reply("Awaiting thickness verification on Sign Protocol...")
            attest = attest_schema(schema_id=idea_schema_id,
                                   arg1='memeIdea',
                                   arg2='signer',
                                   data=f'{main_idea}',
                                   signer=recipient_address,
                                   attest_by="0x298f9539e484D345CAd143461E4aA3136292a741")
            await message.reply(f"Attestation completed. Find the more on Sign Protocol: "
                                f"https://testnet-scan.sign.global/attestation/onchain_evm_84532_{attest['attestationId']}")

        await message.reply(f"If you satisfied with the idea, declare the following 'I hereby declare that my coin is "
                            f"genuine and has no malicious intent' by running /approve yes.")

    else:
        await message.reply("Please authrize with /auth command.")


@dp.message(Command("approve"))
async def command_approve(message: types.Message):
    match = re.match(r'/approve\s+(.+)', message.text)

    if match:
        choice = match.group(1)

        if choice == 'yes'.lower():
            with open(os.getcwd()+"/attestation/schemas/genuinity.json") as f:
                genuinity_schema_id = json.load(f)['genuinity']['schemaId']

            await message.reply("Awaiting letter of intent attestation on Sign Protocol...")
            attest = attest_schema(schema_id=genuinity_schema_id,
                                   arg1='statementData',
                                   arg2='signer',
                                   data='I hereby declare that my coin is genuine and has no malicious intent.',
                                   signer=recipient_address,
                                   attest_by="0x298f9539e484D345CAd143461E4aA3136292a741")

            await message.reply(f"Attestation completed. Find the more on Sign Protocol: "
                                f"https://testnet-scan.sign.global/attestation/onchain_evm_84532_{attest['attestationId']}")
        else:
            await message.reply("Without intentions attestation you cannot proceed!")
    else:
        await message.reply("Please provide the text after the command. Example: "
                            "/approve yes")


@dp.message(Command("nft"))
async def command_nft(message: types.Message):
    global recipient_address  # Declare it global to modify the global variable
    match = re.match(r'/nft\s+(.+)', message.text)
    if match:
        nft_description = match.group(1)
        # nft_description = get_meme_idea_assets()['image']
        # print("nft_description", nft_description)
        mess = await message.reply("Generating NFT...")
        contract_url, image_url, token_id = generate_nft(nft_description)

        transfer_tx_hash = transfer_nft(token_id, recipient_address)
        if transfer_tx_hash:
            print(f"NFT transferred successfully: Transaction Hash {transfer_tx_hash.hex()}")

        await message.reply_photo(image_url)
        await message.reply(contract_url)
        await mess.delete()

    else:
        await message.reply("Please provide the text after the command. Example: "
                            "/nft galadriel cat")


@dp.message(Command("deploy"))
async def command_deploy(message: types.Message):
    print("Received /deploy command")

    # Extract parameters from the message
    match = re.match(r'/deploy\s+(\w+)\s+(\w+)\s+(\d+)', message.text)

    if match:
        mess = await message.reply("Deploying token...")

        contract_full_name = match.group(1)
        contract_short_name = match.group(2)
        initial_supply = int(match.group(3))  # Convert supply to integer

        # Call the deploy_token function with the extracted parameters
        token_address = deploy_token(contract_full_name, contract_short_name, initial_supply)

        await message.reply(token_address)
        await mess.delete()

    else:
        await message.reply("Please provide the correct parameters. Example: /deploy MikCoin Mik 5000000")


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


def generate_nft(prompt: str):
    tx_hash = send_initialize_mint(prompt)
    logger.info(f"Transaction sent, tx hash: {tx_hash.hex()}")
    token_id = get_token_id_from_receipt(tx_hash)

    if token_id is not None:
        logger.info(f"Token ID: {token_id}")
        response = get_contract_response(token_id)
        url = f"https://explorer.galadriel.com/token/0xb8B50D76D1a3558EC18068506C3d91EDc021B33D/instance/{token_id}"
        logger.info(f"Contract response: {url}")
        return url, response, token_id
    else:
        logger.error("Failed to retrieve token ID from receipt")
        return "", ""


def send_initialize_mint(message):
    nonce = web3.eth.get_transaction_count(account.address)
    txn = contract.functions.initializeMint(message).build_transaction({
        'chainId': web3.eth.chain_id,
        'gas': 2000000,
        'gasPrice': web3.to_wei('5', 'gwei'),
        'nonce': nonce
    })
    signed_txn = web3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
    tx_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)
    return tx_hash


def get_token_id_from_receipt(tx_hash):
    receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    logs = contract.events.MintInputCreated().process_receipt(receipt)
    if logs:
        return logs[0]['args']['chatId']
    return None


def get_contract_response(tokenId):
    while True:
        try:
            response = contract.functions.tokenURI(tokenId).call()
            if response:
                return response
        except Exception as e:
            print(e)
        time.sleep(2)


def transfer_nft(tokenId: int, recipient: str):
    # Ensure tokenId and recipient are valid

    # Step 1: Prepare the transfer transaction
    nonce = web3.eth.get_transaction_count(account.address)
    txn = contract.functions.safeTransferFrom(account.address, recipient, tokenId).build_transaction({
        'chainId': web3.eth.chain_id,
        'gas': 200000,
        'gasPrice': web3.to_wei('5', 'gwei'),
        'nonce': nonce
    })

    # Step 2: Sign and send the transaction
    signed_txn = web3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
    tx_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)
    logger.info(f"Transfer transaction sent, tx hash: {tx_hash.hex()}")

    # Step 3: Wait for the transaction receipt to confirm the transfer
    receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    logger.info(f"Transfer completed, transaction receipt: {receipt}")
    return tx_hash


def update_env_file(key, value):
    # Ensure the value is formatted correctly with quotes
    if not value.startswith('"'):
        value = f'"{value}"'

    # Read the existing .env file
    env_file_path = '.env'
    lines = []

    # Read the existing .env file if it exists
    if os.path.exists(env_file_path):
        with open(env_file_path, 'r') as file:
            lines = file.readlines()

    # Ensure there's a newline at the end of the last line
    if lines and not lines[-1].endswith('\n'):
        lines[-1] = lines[-1] + '\n'

    # Check if the key already exists, if so, update it
    key_exists = False
    for i in range(len(lines)):
        if lines[i].startswith(f"{key}="):
            lines[i] = f"{key}={value}\n"
            key_exists = True
            break

    # If the key doesn't exist, add it to the file
    if not key_exists:
        lines.append(f"{key}={value}\n")

    # Write the updated lines back to the .env file
    with open(env_file_path, 'w') as file:
        file.writelines(lines)


def deploy_token(token_name, token_symbol, initial_mint):
    # Save the token name, symbol, and initial mint to .env before deploying
    print(f"Deploying token with name: {token_name}, symbol: {token_symbol}, initial mint: {initial_mint}")
    update_env_file("TOKEN_NAME", token_name)
    update_env_file("TOKEN_SYMBOL", token_symbol)
    update_env_file("INITIAL_MINT", str(initial_mint))

    # Command to execute the Hardhat deployment script
    command = "npx hardhat run scripts/deploy.js --network sepolia"

    try:
        # Execute the command and capture the output
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                cwd="./contract-deploy")

        # Get the contract address from stdout
        token_address = result.stdout.decode().strip()

        if token_address:
            print(f"Token deployed at address: {token_address}")
        return token_address

    except subprocess.CalledProcessError as e:
        print(f"Error during deployment: {e.stderr.decode()}")
        return None


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
        'global', 'economics', 'technologies',
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


def openai_summarize_news(text: str) -> dict:
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
        "Biggest news buzz: "Brief description of the most sensational news.",
        "Strategy": "Marketing strategy applicable to my case and based on the hype news.",
        "Features": "Most relevant and shocking features of the current world news.",
        "Meme": "Come up with the following data for a meme that captures the biggest news buzz: concept, catchphrase, image description, and title. Give a thought for the target demographic.",
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
        response = client.chat.completions.create(
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
        logger.info(f"Response retreived successfully, passed {round(time.time() - processing_start, 3)} sec.")
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


def openai_idea_rank(text: str) -> dict:
    logger.info("Sending text and prompt to OpenAI...")
    prompt = f"""
    *1.1 Task Definition*
       - Analyze the provided text.

       - data: {text}

   *1.2 Focus on User Objective*
      - Provide the following information (if any) in JSON format:
      {{
        "fun_rank": "a rank from 1 to 10 where 10 means that the idea is very fun",
        "tolerance_rank": "a rank from 1 to 10 where 10 means that the idea is tolerant and does not harm anyone.",
      }}
    """

    system_message = """
        You are acting as a funny rating assistant tasked with assessing fun rank from the provided meme idea. 
        Your response should be clear and structured, avoiding references to external documents.
        """

    try:
        processing_start = time.time()
        response = client.chat.completions.create(
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
        logger.info(f"Response retreived successfully, passed {round(time.time() - processing_start, 3)} sec.")
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
        content = [c for c in content if c.startswith(kind + '_')]
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


def create_schema(name: str,
                  title: str,
                  field_1: str = 'tokenDetails',
                  field_2: str = 'signer', force_rewrite: bool = False) -> dict:
    """
    Current implementation suggests two data field attestation where the first one is a statement must be attested
    and the second is signer address .

    Example usage:
    create_schema(name='test_schema',
                  title='Test Schema')

    The schema created here: https://testnet-scan.sign.global/schema/onchain_evm_84532_SCHEMA_ID

    :param name: name of a schema, should be reminiscent a key of a dictionary for fast access
    :param title: title of a schema, the name is displayed on Sign Protocol web page
    :param field_1: first data field
    :param field_2: second data field
    :param force_rewrite: rewrite stored schema anyway
    :return: dictionary where the key is the schema name and values are schemaId and txHash
    """
    schemas = next(os.walk(os.getcwd() + '/attestation/schemas'), (None, None, []))[2]  # [] if no file
    schemas = [x.replace('.json', '') for x in schemas]

    if name not in schemas or force_rewrite:
        sp_cmd = [f'npm run --prefix attestation create_schema -- --name="{title}" --arg1={field_1} --arg2={field_2}']

        process = subprocess.Popen(sp_cmd,
                                   stdout=subprocess.PIPE,
                                   stderr=subprocess.PIPE,
                                   shell=True,
                                   )

        output, error = process.communicate()
        error = error.decode("utf-8")

        # Parse response
        result = {name: {}}
        if error == '':
            output = output.decode("utf-8").split("\n")
            output = [re.sub(r"[-()\"#/@;<>{}`+=~|.!?,]", '', x.strip()) for x in output
                      if any([k in x for k in ['schemaId', 'txHash']])]

            for el in output:
                k, v = el.split(':')
                v = v.strip().replace("'", "")

                result[name][k] = v

        with open(f'{os.getcwd()}/attestation/schemas/{name}.json', 'w') as f:
            json.dump(result, f)

        return result

    else:
        return {'error': f'Schema with the specified "{name}" name exists.'}


def attest_schema(schema_id: str, arg1: str, arg2: str, data: str, signer: str, attest_by: str) -> dict:
    """
    Example usage:
    attest_schema(schema_id='0x260',
                  data='We developed a service for MemeCoin generation.',
                  signer="0x298f9539e484D345CAd143461E4aA3136292a741",
                  attest_by="0x298f9539e484D345CAd143461E4aA3136292a741")

    :param arg2:
    :param arg1:
    :param schema_id:
    :param data:
    :param signer:
    :param attest_by:
    :return:
    """
    sp_cmd = [
        f'npm run --prefix attestation attest_schema -- --schemaId="{schema_id}" --arg1="{arg1}" --arg2="{arg2}" --dataField="{data}" --signer={signer} --indexingValue={attest_by}']

    process = subprocess.Popen(sp_cmd,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE,
                               shell=True,
                               )

    # output, error = process.communicate()

    #
    output, error = process.communicate()

    error = error.decode("utf-8")
    # Parse response
    result = {}
    if error == '':
        output = output.decode("utf-8").split("\n")
        output = [x for x in output if any([k in x for k in ['attestationId', 'txHash', 'indexingValue']])]
        exclude_id = [i for i, x in enumerate(output) if '>' in x]
        output = [x for i, x in enumerate(output) if i not in exclude_id]
        output = [re.sub(r"[-()\"#/@;<>{}`+=~|.!?,]", '', x.strip()) for x in output]

        for el in output:
            k, v = el.split(':')
            v = v.strip().replace("'", "")

            result[k] = v

    return result


async def query_attestation(schema_id: str, attester: str, signer: str) -> dict:
    """
    Returns attestations if exists, and their corresponding count

    Example usage:
    query_attestation(schema_id='0x260',
                      attester="0x298f9539e484D345CAd143461E4aA3136292a741",
                      signer="0x298f9539e484D345CAd143461E4aA3136292a741")

    :param schema_id:
    :param attester:
    :param signer:
    :return: a dict with a success flag, attestation records, and their count

    """
    sp_cmd = [
        f'npm run --prefix attestation query_attestation -- --schemaId="{schema_id}" --attester={attester} --signer={signer}']
    # process = subprocess.Popen(sp_cmd,
    #                            stdout=subprocess.PIPE,
    #                            stderr=subprocess.PIPE,
    #                            shell=True,
    #                            text=True
    #                            )

    process = await asyncio.create_subprocess_shell(sp_cmd,
                                                    stdout=subprocess.PIPE,
                                                    stderr=subprocess.PIPE,
                                                    shell=True,
                                                    text=True)

    output, error = process.communicate()
    if error == '':
        output = re.sub(r'^> .*\n?', '', output, flags=re.MULTILINE)
        output = re.sub(r'^$\n', '', output, flags=re.MULTILINE)
        res = re.sub(r'([a-zA-Z]+)', r'"\1"', output)  # Name -> "Name"

        res = ast.literal_eval(res)

        return res

    else:
        return {"success": 'false', 'error': f'{error}'}


def find_attestation(schema_id: str, attester: str, signer: str, message: str) -> dict:
    """
    Example usage:
    statement = 'I hereby declare that my coin is genuine and has no malicious intent.'
    attest_schema(schema_id='0x260',
                  data=statement,
                  signer="0x..",
                  attest_by="0x..")

    print(find_attestation(schema_id='0x260',
                           attester="0x..",
                           signer="0x..",
                           message=statement))

    :param schema_id:
    :param attester:
    :param signer:
    :param message:
    :return:
    """
    sp_cmd = [
        f'npm run --prefix attestation find_attestation -- --schemaId="{schema_id}" --attester={attester} --signer={signer} --message="{message}"']
    process = subprocess.Popen(sp_cmd,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE,
                               shell=True,
                               text=True
                               )

    output, error = process.communicate()

    if error == '':
        output = re.sub(r'^> .*\n?', '', output, flags=re.MULTILINE)
        output = re.sub(r'^$\n', '', output, flags=re.MULTILINE)

        return chompjs.parse_js_object(output)  # chompjs nicely parses javascript to dict

    else:
        return {'error': f'{error}'}


def get_meme_idea_assets():
    files = get_news_files(kind='news')
    text = ' \n'.join([str(x) for x in files[:50]])  # limit number of instances we are feeding OpenAI
    response = openai_summarize_news(text=text)
    response = ast.literal_eval(f"""{response}""")
    meme_data = response['Meme']
    meme_data['underlying_news'] = response['Biggest news buzz']
    print(meme_data)

    return meme_data


async def main():
    print("Starting bot polling")

    # print(attest_schema(schema_id='0x28f',
    #               arg1='authStatement',
    #               arg2='signer',
    #               data='Address is valid.',
    #               signer='0x298f9539e484D345CAd143461E4aA3136292a741',
    #               attest_by="0x298f9539e484D345CAd143461E4aA3136292a741"))

    # get_all_headlines(categories=CATEGORIES)
    # get_all_news(time_delta=15)

    # print(await get_meme_idea_assets())
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

    # print(create_schema(name='genuinity',
    #               title='Meme Coin Genuinity and Intention Approve',
    #               field_1='statementData',
    #               field_2='signer'
    #               ))
    await dp.start_polling(bot)


if __name__ == "__main__":
    print("Running main function")
    asyncio.run(main())
