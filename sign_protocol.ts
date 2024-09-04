import * as dotenv from "dotenv";
dotenv.config({ path: __dirname+'/.env' });
import { secp256k1 } from 'ethereum-cryptography/secp256k1';

const { SignProtocolClient, SpMode, EvmChains } = require("@ethsign/sp-sdk");
const { privateKeyToAccount } = require("viem/accounts");

const privateKey = process.env.ETH_ACCOUNT_KEY;
const accountAddress = process.env.ETH_ACCOUNT_ADDRESS;
const contractDetails = "A coin tending to prove that recycling is a boon."

const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.baseSepolia,
  account: privateKeyToAccount(privateKey),
});

async function test() {
    const res = await client.createSchema({
      name: "SDK Test",
      data: [
        { name: contractDetails, type: "string" },
        { name: "accountAddress", type: "address" },
      ],
    });

    console.log(res)

    return res
}
//const res = await client.createSchema({
//  name: "SDK Test",
//  data: [
//    { name: contractDetails, type: "string" },
//    { name: "accountAddress", type: "address" },
//  ],
//});
test();
