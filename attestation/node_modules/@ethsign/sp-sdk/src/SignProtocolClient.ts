import { getClient } from './clients';

import { SignProtocolClientBase } from './interface/SignProtocolClientBase';
import {
  Attestation,
  AttestationResult,
  SpMode,
  Schema,
  OnChainClientOptions,
  OffChainClientOptions,
  RevokeAttestationResult,
  SchemaResult,
  RecipientEncodingType,
  CreateAttestationOnChainOptions,
} from './types';
export class SignProtocolClient implements SignProtocolClientBase {
  public client: SignProtocolClientBase;

  constructor(mode: SpMode.OnChain, options: OnChainClientOptions);
  constructor(mode: SpMode.OffChain, options: OffChainClientOptions);
  constructor(
    mode: SpMode,
    options: OnChainClientOptions | OffChainClientOptions
  ) {
    this.client = getClient(mode, options);
  }

  getClient(): SignProtocolClientBase {
    return this.client;
  }
  async createSchema(schema: Schema): Promise<SchemaResult>;
  async createSchema(
    schema: Schema,
    options?: { getTxHash?: (txHash: `0x${string}`) => void }
  ): Promise<SchemaResult>;
  async createSchema(
    schema: Schema,
    options?: { getTxHash?: (txHash: `0x${string}`) => void }
  ): Promise<SchemaResult> {
    return this.client.createSchema(schema, options);
  }
  async getSchema(schemaId: string): Promise<Schema> {
    return this.client.getSchema(schemaId);
  }
  async createAttestation(attestation: Attestation): Promise<AttestationResult>;
  async createAttestation(
    attestation: Attestation,
    options?: CreateAttestationOnChainOptions
  ): Promise<AttestationResult>;
  async createAttestation(
    attestation: Attestation,
    options?: CreateAttestationOnChainOptions
  ): Promise<AttestationResult> {
    return this.client.createAttestation(attestation, options);
  }
  async getAttestation(attestationId: string): Promise<Attestation> {
    return this.client.getAttestation(attestationId);
  }

  async revokeAttestation(
    attestationId: string,
    options?: {
      reason?: string;
    }
  ): Promise<RevokeAttestationResult>;
  async revokeAttestation(
    attestationId: string,
    options?: {
      reason?: string;
      delegationSignature?: string;
      getTxHash?: (txHash: `0x${string}`) => void;
    }
  ): Promise<RevokeAttestationResult>;
  async revokeAttestation(
    attestationId: string,
    options?: {
      reason?: string;
      delegationSignature?: string;
      getTxHash?: (txHash: `0x${string}`) => void;
    }
  ): Promise<RevokeAttestationResult> {
    return this.client.revokeAttestation(attestationId, options);
  }
}
