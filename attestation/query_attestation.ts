import * as dotenv from "dotenv";
import axios from "axios";
import { decodeAbiParameters } from "viem";

//dotenv.config({ path: __dirname+'/.env' });
require('dotenv').config();  // Load .env variables
import { secp256k1 } from 'ethereum-cryptography/secp256k1';

const { SignProtocolClient, SpMode, EvmChains } = require("@ethsign/sp-sdk");
const { privateKeyToAccount } = require("viem/accounts");

const privateKey = process.env.ETH_ACCOUNT_KEY;
const accountAddress = process.env.ETH_ACCOUNT_ADDRESS;
const signerAccountAddress = process.env.ETH_ACCOUNT_ADDRESS;
const fullSchemaId = "onchain_evm_84532_"

const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.baseSepolia,
  account: privateKeyToAccount(privateKey),
});


// Generate a function for making requests to the Sign Protocol Indexing Service
async function makeAttestationRequest(endpoint: string, options: any) {
  const url = `https://testnet-rpc.sign.global/api/${endpoint}`;
  const res = await axios.request({
    url,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    ...options,
  });
  // Throw API errors
  if (res.status !== 200) {
    throw new Error(JSON.stringify(res));
  }
  // Return original response
  return res.data;
}


async function queryAttestations(schemaId: string, attester: string, indexingValue: string) {
  const response = await makeAttestationRequest("index/attestations", {
    method: "GET",
    params: {
      mode: "onchain", // Data storage location
      schemaId: fullSchemaId+schemaId, // Your full schema's ID
      attester: attester, // Alice's address
      indexingValue: indexingValue.toLowerCase(), // Bob's address
    },
  });

  // Make sure the request was successfully processed.
  if (!response.success) {
    return {
      success: false,
      message: response?.message ?? "Attestation query failed.",
    };
  }

  // Return a message if no attestations are found.
  if (response.data?.total === 0) {
    return {
      success: false,
      message: "No attestation for this address found.",
    };
  }

  // Return all attestations that match our query.
  return {
    success: true,
    attestations: response.data.rows,
    attestationsCount: response.data.rows.length
  };
}


// Parsing args
const args = process.argv.slice(2);
const schemaIdArg = args.find((arg) => arg.startsWith("--schemaId="));
const schemaId = schemaIdArg ? schemaIdArg.split("=")[1] : "default";

const attesterArg = args.find((arg) => arg.startsWith("--attester="));
const attester = attesterArg ? attesterArg.split("=")[1] : "default";

const signerArg = args.find((arg) => arg.startsWith("--signer="));
const signer = signerArg ? signerArg.split("=")[1] : "default";

// create Schema
(async() => {
  const query = await queryAttestations(schemaId, attester as string, signer as string);
  console.log(query);
})();
