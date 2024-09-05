require('dotenv').config();  // Load .env variables

async function main() {
    const [deployer] = await ethers.getSigners();

    // Load token name, symbol, and initial mint from environment variables
    const tokenName = process.env.TOKEN_NAME;
    const tokenSymbol = process.env.TOKEN_SYMBOL;
    const initialMint = process.env.INITIAL_MINT;

    // Validate that the values are present
    if (!tokenName || !tokenSymbol || !initialMint) {
        throw new Error("Missing TOKEN_NAME, TOKEN_SYMBOL, or INITIAL_MINT in the environment variables");
    }

    console.log("Deploying contracts with the account:", deployer.address);
    console.log(`Deploying token ${tokenName} (${tokenSymbol}) with initial mint ${initialMint}`);

    // Deploy the contract
    const CustomToken = await ethers.getContractFactory("CustomToken");
    const customToken = await CustomToken.deploy(tokenName, tokenSymbol, deployer.address);

    console.log(`${tokenName} deployed to:`, customToken.address);

    // Mint the initial supply
    const mintTx = await customToken.mint(deployer.address, ethers.utils.parseUnits(initialMint, 18));
    await mintTx.wait();

    console.log(`Minted ${initialMint} tokens to ${deployer.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
