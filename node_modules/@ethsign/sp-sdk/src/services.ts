import { DataLocationOnChain } from './types';
import { SchemaInfo } from './types/indexService';
import { OffChainRpc } from './types/offChain';
import { request, stringifyQueryString } from './utils';

export const getDataFromStorage = async (data: {
  dataId: string;
  dataLocation: DataLocationOnChain.ARWEAVE | DataLocationOnChain.IPFS;
}): Promise<any> => {
  return request(
    `${OffChainRpc.mainnet}/sp/storage-data?dataId=${
      data.dataId
    }&dataLocation=${
      data.dataLocation === DataLocationOnChain.ARWEAVE ? 'arweave' : 'ipfs'
    }`
  );
};
