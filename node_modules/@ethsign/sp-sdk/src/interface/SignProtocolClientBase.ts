import {
  Attestation,
  AttestationResult,
  CreateAttestationOnChainOptions,
  RecipientEncodingType,
  RevokeAttestationResult,
  Schema,
  SchemaResult,
} from '../types';

export interface SignProtocolClientBase {
  createSchema(schema: Schema): Promise<SchemaResult>;
  createSchema(
    schema: Schema,
    options?: { getTxHash?: (txHash: `0x${string}`) => void }
  ): Promise<SchemaResult>;

  getSchema(schemaId: string): Promise<Schema>;

  createAttestation(attestation: Attestation): Promise<AttestationResult>;
  createAttestation(
    attestation: Attestation,
    options?: CreateAttestationOnChainOptions
  ): Promise<AttestationResult>;

  getAttestation(attestationId: string): Promise<Attestation>;

  revokeAttestation(
    attestationId: string,
    options?: {
      reason?: string;
    }
  ): Promise<RevokeAttestationResult>;
  revokeAttestation(
    attestationId: string,
    options?: {
      reason?: string;
      delegationSignature?: string;
      getTxHash?: (txHash: `0x${string}`) => void;
    }
  ): Promise<RevokeAttestationResult>;
}
