
# The easiest way to treat Meme Coin as a serious stuff.

![My Image](./images/catmeme.jpeg)

# Galadrimeme Project

The **Galadrimeme Project** is a Python-based application that interacts with blockchain and AI APIs to deploy ERC-20 tokens and NFTs on Ethereum networks using Hardhat, Web3.py, and OpenAI. Additionally, it includes functionalities to interact with a Telegram bot, manage NFTs, and perform token deployments.

## Project Structure

```
├── contract-deploy
│   ├── artifacts            # Hardhat generated artifacts
│   ├── cache                # Hardhat cache
│   ├── contracts            # Solidity smart contracts
│   ├── node_modules         # Node dependencies for Hardhat
│   ├── scripts              # Deployment scripts for contracts
│   ├── test                 # Tests for smart contracts
│   └── hardhat.config.js    # Configuration file for Hardhat
│
├── data                     # Data folder for storing files
├── images                   # Folder to store images (for NFT generation)
├── node_modules             # Node dependencies for the project
├── utils                    # Utility scripts used in the project
├── .env                     # Environment variables (API keys, private keys)
├── app.py                   # Main Python script
├── DalleNft.json            # ABI file for the NFT contract
├── package.json             # Project dependencies (for Hardhat)
├── package-lock.json        # Lock file for dependencies
├── debug.log                # Log file for debugging
└── README.md                # Project documentation
```

## Requirements

- Python 3.9+
- Node.js and npm (for Hardhat)
- Hardhat (installed via npm)
- Ethereum node provider (e.g., Alchemy, Infura)
- Web3.py (for interacting with the Ethereum blockchain)
- OpenAI API key (for using OpenAI features)
- NewsAPI key (for retrieving news)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/galadrimeme.git
   cd galadrimeme
   ```

2. Install the Python dependencies:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. Install Node.js dependencies:

   ```bash
   cd contract-deploy
   npm install
   ```

4. Set up environment variables:

   Create a `.env` file in the root directory with the following variables:

   ```env
   RPC_URL=your_rpc_url
   PRIVATE_KEY=your_private_key
   OPENAI_API_KEY=your_openai_api_key
   NEWS_API_KEY=your_news_api_key
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   CONTRACT_NFT_ADDRESS=your_nft_contract_address
   ```

## Running the Project

### 1. Deploy an ERC-20 Token:

You can deploy an ERC-20 token using the Telegram bot or by running the Python script directly.

#### Via Telegram Bot:
- Run the bot:
  ```bash
  python app.py
  ```
- Use the `/deploy` command to deploy a token. Example:
  ```
  /deploy MikCoin MIK 5000000
  ```
  This will deploy a token with the name `MikCoin`, symbol `MIK`, and initial supply of `5,000,000`.

#### Via Python Script:
To deploy the token from the script directly, call the `deploy_token()` function.

Example:
```python
deploy_token("MikCoin", "MIK", 5000000)
```

### 2. Generate and Transfer NFTs:

- Use the `/nft` command to generate an NFT. Example:
  ```
  /nft galadriel cat
  ```

  This will generate an NFT based on the provided description and transfer it to the recipient address saved in the bot.

### 3. Retrieve News Data:

You can retrieve top headlines and news data using the built-in functions in `app.py`.

- `get_top_headlines()`: Retrieves top headlines based on specified keywords and sources.
- `get_news_data()`: Retrieves all news articles based on the given keywords.

## Hardhat Configuration

The Hardhat project is configured under the `contract-deploy/` directory. The `hardhat.config.js` file contains the network configurations for deploying smart contracts to Ethereum.

### Network Configurations

- **Sepolia Test Network**: 
   You can deploy to Sepolia using the command:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

- **Ethereum Mainnet**: 
   To deploy to the Ethereum mainnet, make sure to set your `ALCHEMY_API_URL` and `PRIVATE_KEY` in the `.env` file and run:
   ```bash
   npx hardhat run scripts/deploy.js --network mainnet
   ```

## Project Features

1. **ERC-20 Token Deployment**: Deploy custom tokens with configurable name, symbol, and initial supply.
2. **NFT Generation and Transfer**: Generate NFTs based on user input and transfer them to a recipient's address.
3. **Telegram Bot Integration**: Use commands through Telegram to interact with the smart contracts.
4. **News API Integration**: Fetch and process news articles based on keywords, sources, and categories.
5. **OpenAI Integration**: Use OpenAI for content generation, such as summarizing news or generating meme concepts.

## Contributing

If you want to contribute to this project, feel free to fork the repository and submit a pull request.

1. Fork the repository.
2. Create your feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
