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
    indexingValue: signer.toLowerCase(),
//    recipients: accountAddress as string,
  });

  return res
}


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
  };
}


function findAttestation(message: string, attestations: any[]) {
  // Iterate through the list of attestations
  for (const att of attestations) {
    if (!att.data) continue;

    let parsedData: any = {};

    // Parse the data.
    if (att.mode === "onchain") {
      // Looking for nested items in the on-chain schema
      try {
        const data = decodeAbiParameters(
          [att.dataLocation === "onchain" ? { components: att.schema.data, type: "tuple" } : { type: "string" }],
          att.data
        );
        parsedData = data[0];
      } catch (error) {
        // Looking for a regular schema format if the nested parse fails
        try {
          const data = decodeAbiParameters(
            att.dataLocation === "onchain" ? att.schema.data : [{ type: "string" }],
            att.data
          );
          const obj: any = {};
          data.forEach((item: any, i: number) => {
            obj[att.schema.data[i].name] = item;
          });
          parsedData = obj;
        } catch (error) {
          continue;
        }
      }
    } else {
      // Try parsing as a string (off-chain attestation)
      try {
        parsedData = JSON.parse(att.data);
      } catch (error) {
        console.log(error);
        continue;
      }
    }

    // Return the correct attestation and its parsed data.
    if(parsedData?.tokenDetails === message) {
      return { parsedData, attestation: att };
    }
  }

  // Did not find the attestation we are looking for.
  return undefined;
}


// create Schema
(async() => {
  console.log('Creating schema...');
//  const schema = await createSchema();
  const schema = {'schemaId': '0x1c0'};
  console.log('Schema: ', schema);
  console.log('Creating attestation...');
//  const attestation = await createNotaryAttestation(schema['schemaId'], tokenDetails, signerAccountAddress as string);
  const attestation = {
                 attestationId: '0x478',
                 txHash: '0xf5e8bdde3bf82b1ae078b50d0b843c0302447f27a0eb94bb2b514a587d35efda',
                 indexingValue: '0x298f9539e484d345cad143461e4aa3136292a741'
               }

  console.log('Attestation: ', attestation);
  console.log('Querying attestation...');
  const query = await queryAttestations(schema['schemaId'], accountAddress as string, attestation['indexingValue'] as string);
  console.log('Query: ', query);
  console.log('Checking whether the attested data is what we are interested in...')
//  const valid = findAttestation(tokenDetails, query['attestations'])
//  console.log(valid);
  console.log('Done.')
})();


const args = process.argv.slice(2);
const profileArg = args.find((arg) => arg.startsWith("--arg="));
const profileName = profileArg ? profileArg.split("=")[1] : "default";

console.log(args[0], args[1]);
console.log(profileArg, profileName);

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
