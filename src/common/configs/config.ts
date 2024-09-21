import type { Config } from './config.interface';

const config: Config = {
  nest: {
    port: 3000,
  },
  cors: {
    enabled: true,
  },
  swagger: {
    enabled: true,
    title: 'Nestjs FTW',
    description: 'The nestjs API description',
    version: '1.5',
    path: 'api',
  },
  graphql: {
    playgroundEnabled: true,
    debug: true,
    schemaDestination: './src/schema.graphql',
    sortSchema: true,
  },
  security: {
    expiresIn: '2m',
    refreshIn: '7d',
    bcryptSaltOrRound: 10,
  },
  chains: [
    {
      name: 'ethereum',
      chainId: 1,
      explorer: 'https://etherscan.io',
      rpc: 'https://mainnet.infura.io/v3/your-infura-id',
      ws: 'wss://mainnet.infura.io/ws/v3/your-infura-id',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
    },
  ],
};

export default (): Config => config;
