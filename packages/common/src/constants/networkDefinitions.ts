import { TNetworkInfo } from 'eth-hooks/models';

import { TNetworkNamesList } from '~common/models';

const INFURA_ID = "03ca59b1013c48349601286a4ebf6d37";

export type TNetworkDefinition = TNetworkInfo & {
  color: string;
};

export const networkDefinitions: Record<TNetworkNamesList, TNetworkDefinition> = {
  localhost: {
    name: 'localhost',
    color: '#666666',
    chainId: 31337,
    blockExplorer: '',
    rpcUrl: 'http://127.0.0.1:8545/',
  },
  mainnet: {
    name: 'mainnet',
    color: '#ff8b9e',
    chainId: 1,
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
    blockExplorer: 'https://etherscan.io/',
  },
  goerli: {
    name: 'goerli',
    color: '#0975F6',
    chainId: 5,
    faucet: 'https://goerli-faucet.slock.it/',
    blockExplorer: 'https://goerli.etherscan.io/',
    rpcUrl: `https://goerli.infura.io/v3/${INFURA_ID}`,
  }
} as const;
