import { PrivateKeyAccount, isAddress } from 'viem';
import { SignProtocolClientBase } from './SignProtocolClientBase';
import { OffChainRpc } from '../types/offChain';
import {
  Attestation,
  AttestationResult,
  ChainType,
  DataLocationOffChain,
  RevokeAttestationResult,
  Schema,
  SchemaItem,
  SchemaResult,
  SignType,
} from '../types';
import { request, validateObject } from '../utils';

export abstract class OffChainClientBase implements SignProtocolClientBase {
  rpc: OffChainRpc | string;
  chainType: ChainType;
  signType: SignType;
  constructor(
    chainType: ChainType,
    signType: SignType,
    rpc: OffChainRpc | string
  ) {
    this.rpc = rpc || OffChainRpc.mainnet;
    this.signType = signType;
    this.chainType = chainType;
  }

  async revokeAttestation(
    attestationId: string,
    options?: {
      reason?: string | undefined;
    }
  ): Promise<RevokeAttestationResult> {
    const { reason } = options || {};
    const publicKey = (await this.getAccount()).address;
    const signType = this.signType;
    const chain = this.chainType;
    const revokeAttestationObj = {
      attestationId,
      reason: reason || '',
    };
    const revokeAttestationString = JSON.stringify(revokeAttestationObj);
    let signature = '';
    let message = revokeAttestationString;
    if (signType === 'eip712') {
      const info = await this.signTypedData({
        message: revokeAttestationObj,
        types: {
          Data: [
            { name: 'attestationId', type: 'string' },
            { name: 'reason', type: 'string' },
          ],
        },
        primaryType: 'Data',
      });
      signature = info.signature;
      message = JSON.stringify(info.message);
    } else {
      signature = await this.signMessage(revokeAttestationString);
    }
    const url = this.rpc + '/sp/revoke-attestation';
    try {
      const res = await request(url, {
        method: 'POST',
        body: JSON.stringify({
          signType: chain + '-' + signType,
          publicKey,
          signature,
          message,
          revokeInfo: revokeAttestationString,
        }),
      });
      if (res) {
        return { attestationId, reason };
      } else {
        throw new Error('revoke attestation failed');
      }
    } catch (error) {
      throw new Error('revoke attestation failed');
    }
  }

  abstract getAccount(): Promise<PrivateKeyAccount>;
  abstract signTypedData(data: {
    message: { [key: string]: any };
    types: { [key: string]: { name: string; type: string }[] };
    primaryType: string;
  }): Promise<{ message: any; signature: string }>;
  abstract signMessage(message: string): Promise<string>;
  async createSchema(schema: Schema): Promise<SchemaResult> {
    const publicKey = (await this.getAccount()).address;
    const signType = this.signType;
    const chain = this.chainType;
    const {
      name,
      description,
      revocable,
      maxValidFor,
      data,
      dataLocation = DataLocationOffChain.ARWEAVE,
    } = schema;
    const schemaObj = {
      name: name || '',
      description: description || '',
      revocable: revocable === undefined ? true : revocable,
      maxValidFor: maxValidFor || 0,
      types: data,
      dataLocation,
    };
    const schemaString = JSON.stringify(schemaObj);
    let signature = '';
    let message = schemaString;
    if (signType === 'eip712') {
      const info = await this.signTypedData({
        message: schemaObj,
        types: {
          Data: [
            { name: 'name', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'revocable', type: 'bool' },
            { name: 'maxValidFor', type: 'uint32' },
            { name: 'dataLocation', type: 'string' },
            { name: 'types', type: 'SchemaItem[]' },
          ],
          SchemaItem: [
            { name: 'name', type: 'string' },
            { name: 'type', type: 'string' },
          ],
        },
        primaryType: 'Data',
      });
      signature = info.signature;
      message = JSON.stringify(info.message);
    } else {
      signature = await this.signMessage(schemaString);
    }
    const url = this.rpc + '/sp/schemas';
    const res = await request(url, {
      method: 'POST',
      body: JSON.stringify({
        signType: chain + '-' + signType,
        publicKey,
        signature,
        message,
        schema: schemaString,
      }),
    });
    return res.data;
  }

  async getSchema(schemaId: string): Promise<Schema> {
    const url = this.rpc + '/sp/schemas/' + schemaId;
    const res = await request(url, {
      method: 'GET',
    });
    if (!res.data) {
      throw new Error('schema not found');
    }
    const {
      name,
      description,
      revocable,
      dataLocation,
      maxValidFor,
      resolver,
      data,
    } = res.data;
    const result: Schema = {
      name,
      description,
      revocable,
      dataLocation,
      maxValidFor,
      resolver,
      data,
    };

    return result;
  }
  async createAttestation(
    attestation: Attestation
  ): Promise<AttestationResult> {
    const publicKey = (await this.getAccount()).address;
    const signType = this.signType;
    const chain = this.chainType;
    const {
      schemaId,
      linkedAttestationId,
      validUntil,
      recipients,
      indexingValue,
      data,
      dataLocation = DataLocationOffChain.ARWEAVE,
    } = attestation;
    const attestationObj = {
      schemaId,
      linkedAttestationId: linkedAttestationId || '',
      validUntil: validUntil || 0,
      recipients: recipients || [],
      indexingValue,
      dataLocation,
      data: JSON.stringify(data),
    };
    const attestationString = JSON.stringify(attestationObj);
    const schema = await this.getSchema(schemaId);
    const schemaData = schema?.data;
    if (!schema) {
      throw new Error('schema not found');
    }
    if (!validateObject(data, schemaData as SchemaItem[])) {
      throw new Error('data is not valid');
    }
    let signature = '';
    let message = attestationString;
    if (signType === 'eip712') {
      let isRecipientAddress = true;
      recipients?.forEach((recipient) => {
        if (!isAddress(recipient)) {
          isRecipientAddress = false;
        }
      });
      const info = await this.signTypedData({
        message: attestationObj,
        types: {
          AttestationData: schemaData as SchemaItem[],
          Data: [
            { name: 'schemaId', type: 'string' },
            { name: 'linkedAttestationId', type: 'string' },
            { name: 'data', type: 'string' },
            { name: 'validUntil', type: 'uint32' },
            {
              name: 'recipients',
              type: isRecipientAddress ? 'address[]' : 'string[]',
            },
            {
              name: 'indexingValue',
              type: isAddress(indexingValue) ? 'address' : 'string',
            },
          ],
        },
        primaryType: 'Data',
      });
      signature = info.signature;
      message = JSON.stringify(info.message);
    } else {
      signature = await this.signMessage(attestationString);
    }
    const url = this.rpc + '/sp/attestations';

    const res = await request(url, {
      method: 'POST',
      body: JSON.stringify({
        signType: chain + '-' + signType,
        publicKey,
        signature,
        message,
        attestation: attestationString,
      }),
    });

    return res.data;
  }

  async getAttestation(attestationId: string): Promise<Attestation> {
    const url = this.rpc + '/index/attestations/' + attestationId;
    const res = await request(url, {
      method: 'GET',
    });
    if (!res.data) {
      throw new Error('attestation not found');
    }
    const {
      schemaId,
      linkedAttestationId,
      data,
      validUntil,
      revoked,
      recipients,
      indexingValue,
    } = res.data;
    const result: Attestation = {
      schemaId,
      linkedAttestationId,
      data: data ? JSON.parse(data) : data,
      validUntil,
      revoked,
      recipients,
      indexingValue,
    };
    return result;
  }
}
