import * as dotenv from "dotenv";
import axios from "axios";
import { decodeAbiParameters } from "viem";

dotenv.config({ path: __dirname+'/.env' });
import { secp256k1 } from 'ethereum-cryptography/secp256k1';

const { SignProtocolClient, SpMode, EvmChains } = require("@ethsign/sp-sdk");
const { privateKeyToAccount } = require("viem/accounts");

const privateKey = process.env.ETH_ACCOUNT_KEY;
const accountAddress = process.env.ETH_ACCOUNT_ADDRESS;
const signerAccountAddress = process.env.ETH_ACCOUNT_ADDRESS;
const tokenDetails = "A coin tending to prove that recycling is a boon."
const fullSchemaId = "onchain_evm_84532_"

const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.baseSepolia,
  account: privateKeyToAccount(privateKey),
});


async function createSchema(nameValue: string, param1: string, param2: string) {
    const res = await client.createSchema({
      name: nameValue,
      data: [
        { name: `${param1}`, type: "string" },
        { name: `${param2}`, type: "address" },
      ],
    });

    return res
}


const args = process.argv.slice(2);
const nameArg = args.find((arg) => arg.startsWith("--name="));
const firstArg = args.find((arg) => arg.startsWith("--arg1="));
const secondArg = args.find((arg) => arg.startsWith("--arg2="));
const nameValue = nameArg ? nameArg.split("=")[1] : "default";
const firstValue = firstArg ? firstArg.split("=")[1] : "default";
const secondValue = secondArg ? secondArg.split("=")[1] : "default";

// creating Schema
(async() => {
  const schema = await createSchema(nameValue, firstValue, secondValue);
  console.log(schema);
})();

//console.log(args[0], args[1]);
//console.log(firstValue, secondValue);

// Ideas for attestation:
// 1. The claim of a MemeCoin issuer that the character, image, and other related stuff are not tending to harm someone
//    -- Then we read that statement made by user and attest it
// 2. A user acts as a attester approving that our service is not responsible for any financial losses caused by
//    a MemeCoin issuance
// 3. Our platform acts as a rating system - each individual can attest the core concepts of a Memecoin
//    The more attestations have been made the more reliable coin is.
// 4. We attest that person's wallet address is a valid address
// 5. We attest the date the coin issued, the fact that the person made a request for MemeCoin issuance is not a robot
// 6. Attest user's experience in blockchain industry (person provides short description, we read it and attest)
