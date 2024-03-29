export const NetworkNamesList = [
  'localhost',
  'mainnet',
  'goerli',
] as const;

export type TNetworkNamesList = typeof NetworkNamesList[number];
export type TNetworkNames = {
  [key in TNetworkNamesList]: key;
};

export const solidityToolkits = ['hardhat', 'foundry'] as const;
export type TSolidityToolkits = typeof solidityToolkits[number];

export const reactBuilds = ['vite', 'nextjs'] as const;
export type TReactBuilds = typeof reactBuilds[number];
