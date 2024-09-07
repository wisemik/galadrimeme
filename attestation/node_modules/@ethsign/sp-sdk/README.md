# attestation-sdk

### demo

#### on chain

```tsx
import {
  SignProtocolClient,
  SpMode,
  EvmChains,
  delegateSignAttestation,
  delegateSignRevokeAttestation,
  delegateSignSchema,
} from '@ethsign/sp-sdk';
import { privateKeyToAccount } from 'viem/accounts';
const privateKey = '0xabc'; // optional

const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.sepolia,
  account: privateKeyToAccount(privateKey), // optional
});

//create schema
const createSchemaRes = await client.createSchema({
  name: 'xxx',
  data: [{ name: 'name', type: 'string' }],
});

// delegation create schema
const delegationPrivateKey = '0xaaaaa';
const info = await delegateSignSchema(
  {
    name: 'xxx',
    data: [{ name: 'name', type: 'string' }],
  },
  {
    chain: EvmChains.sepolia,
    delegationAccount: privateKeyToAccount(delegationPrivateKey),
  }
);
const delegateCreateSchemaRes = await client.createSchema(info.schema, {
  delegationSignature: info.delegationSignature,
});

// create attestation
const createAttestationRes = await client.createAttestation({
  schemaId: '0x3',
  data: { name: 'a' },
  indexingValue: 'xxx',
});

// delegation  create attestation
const delegationPrivateKey = '0xaaaaa';
const info = await delegateSignAttestation(
  {
    schemaId: '0x1',
    data: { name: 'a' },
    indexingValue: 'xxx',
  },
  {
    chain: EvmChains.sepolia,
    delegationAccount: privateKeyToAccount(delegationPrivateKey),
  }
);

const delegationCreateAttestationRes = await client.createAttestation(
  info.attestation,
  {
    delegationSignature: info.delegationSignature,
  }
);

//revoke attestation
const revokeAttestationRes = await client.revokeAttestation('0x3', {
  reason: 'test',
});

//delegation revoke attestation

const delegationPrivateKey = '0xaaaaa';
const info = await delegateSignRevokeAttestation(attestationId, {
  chain: EvmChains.sepolia,
  reason: 'test',
  delegationAccount: privateKeyToAccount(delegationPrivateKey),
});
const delegationRevokeAttestationRes = await client.revokeAttestation(
  info.attestationId,
  {
    reason: info.reason,
    delegationSignature: info.delegationSignature,
  }
);
```

#### off chain

```tsx
import {
  SignProtocolClient,
  SpMode,
  EvmChains,
  OffChainSignType,
} from '@ethsign/sp-sdk';
import { privateKeyToAccount } from 'viem/accounts';
const privateKey = '0xabc'; // optional
const client = new SignProtocolClient(SpMode.OffChain, {
  signType: OffChainSignType.EvmEip712,
  account: privateKeyToAccount(privateKey), // optional
});

//create schema
const schemaInfo = await client.createSchema({
  name: 'xxx',
  data: [{ name: 'name', type: 'string' }],
});

//create attestation
const attestationInfo = await client.createAttestation({
  schemaId: 'xxxx', //schemaInfo.schemaId or other schemaId
  data: { name: 'a' },
  indexingValue: 'xxx',
});

//revoke attestation
const attestationId = 'xxx';
const revokeAttestationRes = await client.revokeAttestation(attestationId, {
  reason: 'test',
});
```

#### index service

```tsx
import { IndexService } from '@ethsign/sp-sdk';

async function getSchemaListFromIndexService() {
  const indexService = new IndexService('testnet');
  const res = await indexService.querySchemaList({ page: 1 });
}

async function getSchemaFromIndexService() {
  const indexService = new IndexService('testnet');
  const res = await indexService.querySchema('onchain_evm_80001_0x1');
}

async function getAttestationListFromIndexService() {
  const indexService = new IndexService('testnet');
  const res = await indexService.queryAttestationList({ page: 1 });
}
async function getAttestationFromIndexService() {
  const indexService = new IndexService('testnet');
  const res = await indexService.queryAttestation('onchain_evm_80001_0x1');
}
```

### Changelog

#### 0.7.0

- Added support for celo and celo testnet

#### 0.6.1

- delegate utils support rpcUrl

#### 0.6.0

- Added support for bnb

#### 0.5.0

- Added support for arbitrum one
- update zetachain smart contract address

#### 0.4.4

- create attestation support extraData

#### 0.4.0

- Added support for cyber mainnet

#### 0.3.31

- Added support for xlayer chain

#### 0.3.30

- Added support for gnosis chain
- Added support for degen chain

#### 0.3.27

- Added support for arbitrum sepolia
- remove polygon mumbai

#### 0.3.24

- offchain mode support config wallet client

#### 0.3.19

- support for index service

#### 0.3.18

- add config wallet client

#### 0.3.14

- Added support for sepolia

#### 0.3.7

- Added support for base sepolia

#### 0.3.4

- Added support for base

#### 0.3.2

- Added support for scroll sepolia

#### 0.3.3

- Added support for scroll

#### 0.3.0

- Upgrade contract

#### 0.2.3

- Improved error handling.
- General optimization.

#### 0.2.2

- Improved encoding for attestation data.

#### 0.2.0

- Added support for delegate schema registration.

#### 0.1.11

- Added support for ZetaChain mainnet.

#### 0.1.10

- Added support for opBNB testnet.

#### 0.1.9

- Added support for attestation revocation.

#### 0.1.5

- Added support for delegate attestation.

#### 0.0.1

- Initial release.
