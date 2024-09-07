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


async function createNotaryAttestation(schemaId: string, dataField: string, signer: string, indexingValue: string) {
  const res = await client.createAttestation({
    schemaId: schemaId,
    data: {
      "tokenDetails": dataField,
      "signer": signer
    },
    indexingValue: indexingValue.toLowerCase(),
//    recipients: accountAddress as string,
  });

  return res
}


// Parsing arguments
const args = process.argv.slice(2);
const schemIdArg = args.find((arg) => arg.startsWith("--schemaId="));
const schemaId = schemIdArg ? schemIdArg.split("=")[1] : "default";

const dataFieldArg = args.find((arg) => arg.startsWith("--dataField="));
const dataField = dataFieldArg ? dataFieldArg.split("=")[1] : "default";

const signerArg = args.find((arg) => arg.startsWith("--signer="));
const signer = signerArg ? signerArg.split("=")[1] : "default";

const indexingValueArg = args.find((arg) => arg.startsWith("--indexingValue="));
const indexingValue = indexingValueArg ? indexingValueArg.split("=")[1] : "default";


// create Schema
(async() => {
  const attestation = await createNotaryAttestation(schemaId, dataField as string, signer as string, indexingValue as string);
  console.log(attestation);
})();
