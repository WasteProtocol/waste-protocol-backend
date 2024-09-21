export interface ChainConfig {
  name: string;
  network?: string;
  testnet?: boolean;
  chainId: number;
  explorer: string;
  rpc: string;
  ws?: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

const SepoliaChain: ChainConfig = {
  name: 'Sepolia',
  testnet: true,
  network: 'sepolia',
  chainId: 11155111,
  explorer: 'https://sepolia.etherscan.io',
  rpc: 'https://rpc.sepolia.org',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
};

const LineaSepoliaChain: ChainConfig = {
  name: 'Linea Sepolia',
  testnet: true,
  network: 'linea sepolia',
  chainId: 59141,
  explorer: 'https://sepolia.lineascan.build/',
  rpc: 'https://rpc.sepolia.linea.build',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
};

export const CHAINS = {
  SEPOLIA: SepoliaChain,
  LINEA_SEPOLIA: LineaSepoliaChain,
};
