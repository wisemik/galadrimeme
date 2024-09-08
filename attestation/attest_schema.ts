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
const fullSchemaId = "onchain_evm_84532_";

const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.baseSepolia,
  account: privateKeyToAccount(privateKey),
});


async function createAttestation(schemaId: string, arg1: string, arg2: string, dataField: string, signer: string, indexingValue: string) {
  const res = await client.createAttestation({
    schemaId: schemaId,
    data: {
     [arg1]: dataField,
     [arg2]: signer  // Address of a person we are attesting
    },
    attester: indexingValue,  // Attester's address
    indexingValue: signer.toLowerCase(),  // Address of a person we are attesting
//    recipients: accountAddress as string,
  });

  return res
}


// Parsing arguments
const args = process.argv.slice(2);
const schemIdArg = args.find((arg) => arg.startsWith("--schemaId="));
const schemaId = schemIdArg ? schemIdArg.split("=")[1] : "default";

const arg1Arg = args.find((arg) => arg.startsWith("--arg1="));
const arg1 = arg1Arg ? arg1Arg.split("=")[1] : "default";

const arg2Arg = args.find((arg) => arg.startsWith("--arg2="));
const arg2 = arg2Arg ? arg2Arg.split("=")[1] : "default";

const dataFieldArg = args.find((arg) => arg.startsWith("--dataField="));
const dataField = dataFieldArg ? dataFieldArg.split("=")[1] : "default";

const signerArg = args.find((arg) => arg.startsWith("--signer="));
const signer = signerArg ? signerArg.split("=")[1] : "default";

const indexingValueArg = args.find((arg) => arg.startsWith("--indexingValue="));
const indexingValue = indexingValueArg ? indexingValueArg.split("=")[1] : "default";

// create Schema
(async() => {
  const attestation = await createAttestation(schemaId, arg1, arg2, dataField as string, signer as string, indexingValue as string);
  console.log(attestation);
})();
