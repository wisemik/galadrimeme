import {
  PrivateKeyAccount,
  WalletClient,
  encodeAbiParameters,
  isAddress,
} from 'viem';
import { SignProtocolClient } from '../SignProtocolClient';
import { EvmChains } from '../clients/evm/types';
import {
  Attestation,
  DataLocationOnChain,
  AttestationDelegationSignature,
  RevokeDelegationSignature,
  SchemaItem,
  SpMode,
  SchemaDelegationSignature,
  OnChainSchema,
  RecipientEncodingType,
} from '../types';
import { encodeOnChainData, validateObject } from '.';
import { OnChainClient } from '../clients/evm/OnChain';

export async function delegateSignAttestation(
  attestation: Attestation,
  options: {
    chain: EvmChains;
    delegationAccount?: PrivateKeyAccount;
    recipientEncodingType?: RecipientEncodingType;
    rpcUrl?: string;
    walletClient?: WalletClient;
  }
): Promise<AttestationDelegationSignature> {
  const client = new SignProtocolClient(SpMode.OnChain, {
    chain: options?.chain,
    account: options?.delegationAccount,
    rpcUrl: options?.rpcUrl,
    walletClient: options?.walletClient,
  });
  const {
    schemaId,
    linkedAttestationId,
    data,
    validUntil,
    revoked,
    recipients,
    attester,
    indexingValue,
  } = attestation;
  const innerClient = client.getClient() as OnChainClient;
  const account = await innerClient.getAccount();
  if (!attestation.schemaId) {
    throw new Error('schemaId is required');
  }
  const dataLocation = attestation.dataLocation || DataLocationOnChain.ONCHAIN;
  const schema = await client.getSchema(attestation.schemaId);
  const schemaData = schema?.data;
  if (!schema) {
    throw new Error('schema not found');
  }
  if (
    schema.dataLocation === DataLocationOnChain.ONCHAIN &&
    dataLocation === DataLocationOnChain.ONCHAIN &&
    !validateObject(data, schemaData as SchemaItem[])
  ) {
    throw new Error('data is not valid');
  }

  const attestationData = {
    schemaId,
    linkedAttestationId: linkedAttestationId || 0,
    attester: attester || account?.address,
    validUntil: validUntil || 0,
    revoked: revoked || false,
    dataLocation,
    attestTimestamp: 0,
    revokeTimestamp: 0,
    recipients:
      recipients?.map((item: string) => {
        const isRecipientAddress = isAddress(item);
        return encodeAbiParameters<any>(
          [
            {
              name: 'data',
              type:
                isRecipientAddress &&
                options?.recipientEncodingType === RecipientEncodingType.Address
                  ? RecipientEncodingType.Address
                  : RecipientEncodingType.String,
            },
          ],
          [item]
        );
      }) || [],
    data: encodeOnChainData(
      data,
      dataLocation as DataLocationOnChain,
      schemaData as SchemaItem[]
    ),
  };

  const res = await innerClient.invokeContractRead('getDelegatedAttestHash', [
    attestationData,
  ]);
  const signature = await innerClient.signMessage(res as string);

  return {
    delegationSignature: signature,
    attestation: { ...attestationData, indexingValue } as Attestation,
  };
}

export async function delegateSignRevokeAttestation(
  attestationId: string,
  options: {
    chain: EvmChains;
    delegationAccount?: PrivateKeyAccount;
    reason?: string;
    rpcUrl?: string;
    walletClient?: WalletClient;
  }
): Promise<RevokeDelegationSignature> {
  const client = new SignProtocolClient(SpMode.OnChain, {
    chain: options?.chain,
    account: options?.delegationAccount,
    rpcUrl: options?.rpcUrl,
    walletClient: options?.walletClient,
  });
  const innerClient = client.getClient() as OnChainClient;
  const { reason } = options || {};
  const res = await innerClient.invokeContractRead('getDelegatedRevokeHash', [
    attestationId,
    reason || '',
  ]);
  const account = options.delegationAccount || (await innerClient.getAccount());
  const signature = await account.signMessage({
    message: { raw: res as any },
  });

  return {
    delegationSignature: signature,
    attestationId,
    reason: reason || '',
  };
}

export async function delegateSignSchema(
  schema: OnChainSchema,
  options: {
    chain: EvmChains;
    delegationAccount?: PrivateKeyAccount;
    rpcUrl?: string;
    walletClient?: WalletClient;
  }
): Promise<SchemaDelegationSignature> {
  const client = new SignProtocolClient(SpMode.OnChain, {
    chain: options?.chain,
    account: options?.delegationAccount,
    rpcUrl: options?.rpcUrl,
    walletClient: options?.walletClient,
  });
  const {
    revocable,
    maxValidFor,
    resolver,
    data,
    name,
    description,
    registrant,
  } = schema;
  const dataLocation = schema.dataLocation || DataLocationOnChain.ONCHAIN;
  const innerClient = client.getClient() as OnChainClient;
  const account = await innerClient.getAccount();
  const schemaData = {
    registrant: registrant || account.address,
    revocable: revocable === undefined ? true : revocable,
    dataLocation: dataLocation,
    maxValidFor: maxValidFor || 0,
    hook: resolver || '0x0000000000000000000000000000000000000000',
    timestamp: 0,
    data:
      dataLocation === DataLocationOnChain.ONCHAIN
        ? JSON.stringify({ name, description, data })
        : data,
  };
  const res = await innerClient.invokeContractRead('getDelegatedRegisterHash', [
    schemaData,
  ]);

  const signature = await innerClient.signMessage(res as string);

  return {
    delegationSignature: signature,
    schema: { ...schema, registrant: schemaData.registrant },
  };
}
//onchain_evm_7001_0x4
export function checkId(id: string): boolean {
  if (id.startsWith('SP')) {
    return true;
  }

  if (id.startsWith('0x')) {
    throw new Error(
      'The id is invalid,Please go to Sign Scan to get the full ID'
    );
  }

  const [type, chainType, chainId, ID] = id.split('_');
  if (type === 'onchain' && chainType && chainId && ID) {
    return true;
  } else {
    throw new Error('The id is invalid');
  }
}
