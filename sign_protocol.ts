import * as dotenv from "dotenv";
import axios from "axios";
dotenv.config({ path: __dirname+'/.env' });
import { secp256k1 } from 'ethereum-cryptography/secp256k1';

const { SignProtocolClient, SpMode, EvmChains } = require("@ethsign/sp-sdk");
const { privateKeyToAccount } = require("viem/accounts");

const privateKey = process.env.ETH_ACCOUNT_KEY;
const accountAddress = process.env.ETH_ACCOUNT_ADDRESS;
const tokenDetails = "A coin tending to prove that recycling is a boon."

const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.baseSepolia,
  account: privateKeyToAccount(privateKey),
});

async function createSchema() {
    const res = await client.createSchema({
      name: "Token Purpose Verification",
      data: [
        { name: "tokenDetails", type: "string" },
        { name: "signer", type: "address" },
      ],
    });

    return res
}

async function createNotaryAttestation(schemaId: string, tokenDetails: string, signer: string) {
  const res = await client.createAttestation({
    schemaId: schemaId,
    data: {
      tokenDetails,
      signer
    },
    indexingValue: signer.toLowerCase()
  });

  return res
}


// create Schema
(async() => {
  console.log('creating schema...');
  const schema = await createSchema();
//  const schema = '0x1b8';
  console.log('schema: ', schema);
  console.log('Done.');
  console.log('creating attestation...');
  const attestation = await createNotaryAttestation(schema['schemaId'], tokenDetails, accountAddress as string);
  console.log('attestation: ', attestation);
  console.log('Done.');
})();



