import {
  zetachainAthensTestnet,
  opBNBTestnet,
  polygon,
  opBNB,
  mainnet,
  scrollSepolia,
  scroll,
  base,
  plumeTestnet,
  berachainTestnet,
  baseSepolia,
  zetachain,
  sepolia,
  polygonAmoy,
  optimism,
  gnosisChiado,
  optimismSepolia,
  arbitrumSepolia,
  polygonMumbai,
  gnosis,
  degen,
  xLayer,
  cyber,
  arbitrum,
  bsc,
  celo,
  celoAlfajores,
} from 'viem/chains';
import { EvmChains } from './types';
import { Address } from 'viem';
import { DataLocationOffChain } from '../../types';

export const ContractInfoMap = {
  [EvmChains.mainnet]: {
    address: '0x3D8E699Db14d7781557fE94ad99d93Be180A6594' as Address,
    chain: mainnet,
  },
  [EvmChains.bsc]: {
    address: '0xe2C15B97F628B7Ad279D6b002cEDd414390b6D63' as Address,
    chain: bsc,
  },
  [EvmChains.zetachainAthensTestnet]: {
    address: '0x5d4D4eEd224028C230aFEbB69d279DE99bC06338' as Address,
    chain: zetachainAthensTestnet,
  },
  [EvmChains.opBNBTestnet]: {
    address: '0x72efA4093539A909C1f9bcCA1aE6bcDa435a3433' as Address,
    chain: opBNBTestnet,
  },
  [EvmChains.zetachainMainnet]: {
    address: '0xBbc279ee396074aC968b459d542DEE60c6bD71C1' as Address,
    chain: zetachain,
  },
  [EvmChains.polygon]: {
    address: '0xe2C15B97F628B7Ad279D6b002cEDd414390b6D63' as Address,
    chain: polygon,
  },
  [EvmChains.opBNB]: {
    address: '0x03688D459F172B058d39241456Ae213FC4E26941' as Address,
    chain: opBNB,
  },
  [EvmChains.scrollSepolia]: {
    address: '0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD' as Address,
    chain: scrollSepolia,
  },
  [EvmChains.scroll]: {
    address: '0xFBF614E89Ac79d738BaeF81CE6929897594b7E69' as Address,
    chain: scroll,
  },
  [EvmChains.base]: {
    address: '0x2b3224D080452276a76690341e5Cfa81A945a985' as Address,
    chain: base,
  },
  [EvmChains.xLayer]: {
    address: '0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD' as Address,
    chain: xLayer,
  },
  [EvmChains.plumeTestnet]: {
    address: '0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD' as Address,
    chain: plumeTestnet,
  },
  [EvmChains.berachainTestnet]: {
    address: '0x2774d96a841E522549CE7ADd3825fC31075384Cf' as Address,
    chain: berachainTestnet,
  },
  [EvmChains.baseSepolia]: {
    address: '0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD' as Address,
    chain: baseSepolia,
  },
  [EvmChains.sepolia]: {
    address: '0x878c92FD89d8E0B93Dc0a3c907A2adc7577e39c5' as Address,
    chain: sepolia,
  },
  [EvmChains.polygonAmoy]: {
    address: '0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD' as Address,
    chain: polygonAmoy,
  },
  [EvmChains.optimism]: {
    address: '0x945C44803E92a3495C32be951052a62E45A5D964' as Address,
    chain: optimism,
  },
  [EvmChains.gnosisChiado]: {
    address: '0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD' as Address,
    chain: gnosisChiado,
  },
  [EvmChains.optimismSepolia]: {
    address: '0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD' as Address,
    chain: optimismSepolia,
  },
  [EvmChains.arbitrumSepolia]: {
    address: '0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD' as Address,
    chain: arbitrumSepolia,
  },
  [EvmChains.polygonMumbai]: {
    address: '0x4665fffdD8b48aDF5bab3621F835C831f0ee36D7' as Address,
    chain: polygonMumbai,
  },
  [EvmChains.gnosis]: {
    address: '0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD' as Address,
    chain: gnosis,
  },
  [EvmChains.degen]: {
    address: '0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD' as Address,
    chain: degen,
  },
  [EvmChains.cyber]: {
    address: '0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD' as Address,
    chain: cyber,
  },
  [EvmChains.arbitrum]: {
    address: '0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD' as Address,
    chain: arbitrum,
  },
  [EvmChains.celo]: {
    address: '0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD' as Address,
    chain: celo,
  },
  [EvmChains.celoAlfajores]: {
    address: '0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD' as Address,
    chain: celoAlfajores,
  },
};

export const chainInfo: {
  evm: {
    name: string;
    chain: EvmChains;
    icon: string;
    scanUrl: string;
    id: string;
    chainInfo: any;
    isTestnet?: boolean;
  }[];
  offchain: {
    chain: DataLocationOffChain;
    id: DataLocationOffChain;
    icon: string;
    name: string;
    scanUrl: string;
    isTestnet?: boolean;
  }[];
} = {
  evm: [
    {
      name: mainnet.name,
      chain: EvmChains.mainnet,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/ETH_240205060739_240723091257.svg',
      scanUrl: mainnet.blockExplorers.default.url + '/tx/',
      id: mainnet.id + '',
      chainInfo: mainnet,
    },
    {
      name: bsc.name,
      chain: EvmChains.bsc,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/bnb_240709085015.webp',
      scanUrl: bsc.blockExplorers.default.url + '/tx/',
      id: bsc.id + '',
      chainInfo: bsc,
    },
    {
      name: polygon.name,
      chain: EvmChains.polygon,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/Attestation-App/polygon-token_240726025025.svg',
      scanUrl: polygon.blockExplorers.default.url + '/tx/',
      id: polygon.id + '',
      chainInfo: polygon,
    },
    {
      name: zetachain.name,
      chain: EvmChains.zetachainMainnet,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/zeta_240123034413_240723091203.svg',
      scanUrl: zetachain.blockExplorers.default.url + '/tx/',
      id: zetachain.id + '',
      chainInfo: zetachain,
    },
    {
      name: opBNB.name,
      chain: EvmChains.opBNB,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/bnb_240127141716_240723091203.svg',
      scanUrl: opBNB.blockExplorers.default.url + '/tx/',
      id: opBNB.id + '',
      chainInfo: opBNB,
    },
    {
      name: scroll.name,
      chain: EvmChains.scroll,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/Scroll_Logomark_240723092217.svg',
      scanUrl: scroll.blockExplorers.default.url + '/tx/',
      id: scroll.id + '',
      chainInfo: scroll,
    },
    {
      name: base.name,
      chain: EvmChains.base,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/base_240321024616_240723091203.svg',
      scanUrl: base.blockExplorers.default.url + '/tx/',
      id: base.id + '',
      chainInfo: base,
    },
    {
      name: optimism.name,
      chain: EvmChains.optimism,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/op_240415064952_240723091203.svg',
      scanUrl: optimism.blockExplorers.default.url + '/tx/',
      id: optimism.id + '',
      chainInfo: optimism,
    },
    {
      name: gnosis.name,
      chain: EvmChains.gnosis,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/gnosis_240723093122.svg',
      scanUrl: gnosis.blockExplorers.default.url + '/tx/',
      id: gnosis.id + '',
      chainInfo: gnosis,
    },
    {
      name: degen.name,
      chain: EvmChains.degen,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/degen_240723093839.svg',
      scanUrl: degen.blockExplorers.default.url + '/tx/',
      id: degen.id + '',
      chainInfo: degen,
    },
    {
      name: xLayer.name,
      chain: EvmChains.xLayer,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/3D95DB39A3F6B46D_240724010255.webp',
      scanUrl: xLayer.blockExplorers.default.url + '/tx/',
      id: xLayer.id + '',
      chainInfo: xLayer,
    },
    {
      name: cyber.name,
      chain: EvmChains.cyber,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/cyber-coin_240724010558.webp',
      scanUrl: cyber.blockExplorers.default.url + '/tx/',
      id: cyber.id + '',
      chainInfo: cyber,
    },
    {
      name: arbitrum.name,
      chain: EvmChains.arbitrum,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/Attestation-App/arbitrum-one_240726024522.svg',
      scanUrl: arbitrum.blockExplorers.default.url + '/tx/',
      id: arbitrum.id + '',
      chainInfo: arbitrum,
    },
    {
      name: polygonAmoy.name,
      chain: EvmChains.polygonAmoy,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/Attestation-App/polygon-token_240726025025.svg',
      scanUrl: polygonAmoy.blockExplorers.default.url + '/tx/',
      id: polygonAmoy.id + '',
      chainInfo: polygonAmoy,
      isTestnet: true,
    },
    {
      name: gnosisChiado.name,
      chain: EvmChains.gnosisChiado,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/gnosis_240723093122.svg',
      scanUrl: gnosisChiado.blockExplorers.default.url + '/tx/',
      id: gnosisChiado.id + '',
      chainInfo: gnosisChiado,
      isTestnet: true,
    },
    {
      name: zetachainAthensTestnet.name,
      chain: EvmChains.zetachainAthensTestnet,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/zeta_240123034413_240723091203.svg',
      scanUrl: zetachainAthensTestnet.blockExplorers.default.url + '/tx/',
      id: zetachainAthensTestnet.id + '',
      isTestnet: true,
      chainInfo: zetachainAthensTestnet,
    },
    {
      name: opBNBTestnet.name,
      chain: EvmChains.opBNBTestnet,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/bnb_240127141716_240723091203.svg',
      scanUrl: opBNBTestnet.blockExplorers.default.url + '/tx/',
      id: opBNBTestnet.id + '',
      isTestnet: true,
      chainInfo: opBNBTestnet,
    },
    {
      name: scrollSepolia.name,
      chain: EvmChains.scrollSepolia,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/Scroll_Logomark_240723092217.svg',
      scanUrl: scrollSepolia.blockExplorers.default.url + '/tx/',
      id: scrollSepolia.id + '',
      isTestnet: true,
      chainInfo: scrollSepolia,
    },
    {
      name: baseSepolia.name,
      chain: EvmChains.baseSepolia,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/base_240321024616_240723091203.svg',
      scanUrl: baseSepolia.blockExplorers.default.url + '/tx/',
      id: baseSepolia.id + '',
      isTestnet: true,
      chainInfo: baseSepolia,
    },
    {
      name: celo.name,
      chain: EvmChains.celo,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/celo_240813062718.svg',
      scanUrl: celo.blockExplorers.default.url + '/tx/',
      id: celo.id + '',
      chainInfo: celo,
    },
    {
      name: plumeTestnet.name,
      chain: EvmChains.plumeTestnet,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/plume_240724011259.webp',
      scanUrl: plumeTestnet.blockExplorers.default.url + '/tx/',
      id: plumeTestnet.id + '',
      isTestnet: true,
      chainInfo: plumeTestnet,
    },
    {
      name: berachainTestnet.name,
      chain: EvmChains.berachainTestnet,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/Berachain_Orange_240724011628.webp',
      scanUrl: berachainTestnet.blockExplorers.default.url + '/tx/',
      id: berachainTestnet.id + '',
      isTestnet: true,
      chainInfo: berachainTestnet,
    },
    {
      name: sepolia.name,
      chain: EvmChains.sepolia,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/ETH_240205060739_240723091257.svg',
      scanUrl: sepolia.blockExplorers.default.url + '/tx/',
      id: sepolia.id + '',
      isTestnet: true,
      chainInfo: sepolia,
    },
    {
      name: optimismSepolia.name,
      chain: EvmChains.optimismSepolia,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/op_240415064952_240723091203.svg',
      scanUrl: optimismSepolia.blockExplorers.default.url + '/tx/',
      id: optimismSepolia.id + '',
      isTestnet: true,
      chainInfo: optimismSepolia,
    },
    {
      name: arbitrumSepolia.name,
      chain: EvmChains.arbitrumSepolia,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/Attestation-App/arbitrum-one_240726024522.svg',
      scanUrl: arbitrumSepolia.blockExplorers.default.url + '/tx/',
      id: arbitrumSepolia.id + '',
      isTestnet: true,
      chainInfo: arbitrumSepolia,
    },
    {
      name: polygonMumbai.name,
      chain: EvmChains.polygonMumbai,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/Attestation-App/polygon-token_240726025025.svg',
      scanUrl: polygonMumbai.blockExplorers.default.url + '/tx/',
      id: polygonMumbai.id + '',
      isTestnet: true,
      chainInfo: polygonMumbai,
    },
    {
      name: celoAlfajores.name,
      chain: EvmChains.celoAlfajores,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/celo_240813062718.svg',
      scanUrl: celoAlfajores.blockExplorers.default.url + '/tx/',
      id: celoAlfajores.id + '',
      isTestnet: true,
      chainInfo: celoAlfajores,
    },
  ],
  offchain: [
    {
      chain: DataLocationOffChain.ARWEAVE,
      id: DataLocationOffChain.ARWEAVE,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/arweave_240724011931.svg',
      name: 'Arweave',
      scanUrl: 'https://viewblock.io/arweave/tx/',
    },
    {
      chain: DataLocationOffChain.IPFS,
      id: DataLocationOffChain.IPFS,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/Ipfs_240724012252.webp',
      name: 'IPFS',
      scanUrl: 'https://ipfs.io/ipfs/',
    },
    {
      chain: DataLocationOffChain.GREENFIELD,
      id: DataLocationOffChain.GREENFIELD,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/bnb_240127141716_240723091203.svg',
      name: 'Greenfield',
      scanUrl: 'https://greenfieldscan.com/tx/',
    },
    {
      chain: DataLocationOffChain.GREENFIELD_TESTTNET,
      id: DataLocationOffChain.GREENFIELD_TESTTNET,
      icon: 'https://sign-public-cdn.s3.us-east-1.amazonaws.com/sp-sdk/icons/bnb_240127141716_240723091203.svg',
      name: 'Greenfield',
      scanUrl: 'https://testnet.greenfieldscan.com/tx/',
      isTestnet: true,
    },
  ],
};
