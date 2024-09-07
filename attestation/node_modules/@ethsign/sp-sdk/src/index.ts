import { IndexService } from './IndexService';
import { SignProtocolClient } from './SignProtocolClient';
import { chainInfo } from './clients/evm/constants';
import { EvmChains } from './clients/evm/types';
import {
  SpMode,
  OffChainSignType,
  DataLocationOnChain,
  DataLocationOffChain,
} from './types';
import type { DataLocation } from './types';
import { OffChainRpc } from './types/offChain';
import {
  delegateSignAttestation,
  delegateSignRevokeAttestation,
  delegateSignSchema,
} from './utils/tools';

import { decodeOnChainData } from './utils';

export {
  SignProtocolClient,
  EvmChains,
  SpMode,
  OffChainRpc,
  OffChainSignType,
  DataLocation,
  DataLocationOnChain,
  DataLocationOffChain,
  delegateSignAttestation,
  delegateSignRevokeAttestation,
  delegateSignSchema,
  chainInfo,
  IndexService,
  decodeOnChainData,
};
export * from './types';
