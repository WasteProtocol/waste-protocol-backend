import { Injectable, Logger } from '@nestjs/common';
import { BigNumber, Contract, ethers } from 'ethers';
import { CHAINS } from 'src/common/configs/constant';
import { Attestation } from 'src/models/attestation.interface';
import { Trade } from 'src/models/trade.interface';
import { collection, get, update } from 'typesaurus';
// load json file name sp.abi.json
// ABI for the attest function
const CONTACT_ABI = [
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint64',
            name: 'schemaId',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'linkedAttestationId',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'attestTimestamp',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'revokeTimestamp',
            type: 'uint64',
          },
          {
            internalType: 'address',
            name: 'attester',
            type: 'address',
          },
          {
            internalType: 'uint64',
            name: 'validUntil',
            type: 'uint64',
          },
          {
            internalType: 'enum DataLocation',
            name: 'dataLocation',
            type: 'uint8',
          },
          {
            internalType: 'bool',
            name: 'revoked',
            type: 'bool',
          },
          {
            internalType: 'bytes[]',
            name: 'recipients',
            type: 'bytes[]',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
        ],
        internalType: 'struct Attestation',
        name: 'attestation',
        type: 'tuple',
      },
      {
        internalType: 'string',
        name: 'indexingKey',
        type: 'string',
      },
      {
        internalType: 'bytes',
        name: 'delegateSignature',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'extraData',
        type: 'bytes',
      },
    ],
    name: 'attest',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
// service SignProtocolService
@Injectable()
export class SignProtocolService {
  constructor() {
    Logger.debug(`SignProtocolService constructor`);
  }

  async createAttestationMessage(attestationData: Attestation) {
    const signerAddress = process.env.SIGNER_PUBLIC;
    const privateKey = process.env.SIGNER_PRIVATE;
    Logger.debug(`signerAddress=${signerAddress}`);
    Logger.debug(`privateKey=${privateKey}`);
    const schemaData = ethers.utils.defaultAbiCoder.encode(
      [
        'string',
        'address',
        'address',
        'string[]',
        'string[]',
        'string',
        'uint256',
        'uint256',
        'uint256',
        'string',
        'string',
        'uint256',
        'uint256',
        'uint256',
      ],
      [
        attestationData.id.toString(),
        attestationData.address.toString(),
        signerAddress,
        attestationData.wasteTypeIds,
        attestationData.amounts,
        attestationData.status,
        ethers.utils.parseUnits(attestationData.totalTokenReceived.toString(), 18),
        ethers.utils.parseUnits(attestationData.totalUSDCReceived.toString(), 18),
        ethers.utils.parseUnits(attestationData.totalEmissionAmount.toString(), 18),
        attestationData.submittedTx,
        attestationData.approvedTx,
        attestationData.tradeId,
        attestationData.approvedAt,
        attestationData.tradedAt,
      ]
    );

    // Standard setup for the contract
    const provider = new ethers.providers.JsonRpcProvider(CHAINS.SEPOLIA.rpc);
    // Get the contract address from the Address Book in docs.sign.global
    const signProtocolSmartContractAddress = '0x878c92FD89d8E0B93Dc0a3c907A2adc7577e39c5';
    const contract = new Contract(
      signProtocolSmartContractAddress,
      [
        'function attest((uint64,uint64,uint64,uint64,address,uint64,uint8,bool,bytes[],bytes),string,bytes,bytes) external returns (uint64)',
      ],
      provider
    );
    // get the signer wallet
    const signerWallet = new ethers.Wallet(privateKey, provider);
    // Create writable contract instance
    const instance = contract.connect(signerWallet) as Contract;

    // Send the attestation transaction
    try {
      await instance[
        'attest((uint64,uint64,uint64,uint64,address,uint64,uint8,bool,bytes[],bytes),string,bytes,bytes)'
      ](
        {
          schemaId: BigNumber.from('0x266'), // The final number from our schema's ID.
          linkedAttestationId: 0, // We are not linking an attestation.
          attestTimestamp: 0, // Will be generated for us.
          revokeTimestamp: 0, // Attestation is not revoked.
          attester: signerAddress, // Signer address.
          validUntil: 0, // We are not setting an expiry date.
          dataLocation: 0, // We are placing data on-chain.
          revoked: false, // The attestation is not revoked.
          recipients: [attestationData.address], // Sale address
          data: schemaData, // The encoded schema data.
        },
        attestationData.address.toLowerCase(), // Bob's lowercase address will be our indexing key.
        '0x', // No delegate signature.
        '0x00' // No extra data.
      )
        .then(
          async (tx: any) =>
            await tx.wait(1).then(async (res) => {
              console.log('success', res);
              const trades = collection<Trade>('trades');
              const trade = await get(trades, attestationData.id);
              const attestationId = res.events[0].args.attestationId;
              Logger.debug(`attestationId == %o`, attestationId);
              trade.data.attestationId = res.events[0].args.attestationId;
              await update(trades, attestationData.id, trade.data);
              // You can find the attestation's ID using the following path:
              // res.events[0].args.attestationId
            })
        )
        .catch((err: any) => {
          console.log(err?.message ? err.message : err);
        });
    } catch (err: any) {
      console.log(err?.message ? err.message : err);
    }
  }

  async issueAttestation(attestationData: Attestation) {
    const signerAddress = process.env.SIGNER_PUBLIC;
    const privateKey = process.env.SIGNER_PRIVATE;
    Logger.debug(`signerAddress=${signerAddress}`);
    Logger.debug(`privateKey=${privateKey}`);

    Logger.debug(`attestationData == ${JSON.stringify(attestationData)}`);
    const schemaData = ethers.utils.defaultAbiCoder.encode(
      [
        'string',
        'address',
        'address',
        'string[]',
        'string[]',
        'string',
        'uint256',
        'uint256',
        'uint256',
        'string',
        'string',
        'uint256',
        'uint256',
        'uint256',
      ],
      [
        attestationData.id.toString(),
        attestationData.address.toString(),
        signerAddress,
        attestationData.wasteTypeIds,
        attestationData.amounts,
        attestationData.status,
        ethers.utils.parseUnits(attestationData.totalTokenReceived.toString(), 18),
        ethers.utils.parseUnits(attestationData.totalUSDCReceived.toString(), 18),
        ethers.utils.parseUnits(attestationData.totalEmissionAmount.toString(), 18),
        attestationData.submittedTx,
        attestationData.approvedTx,
        attestationData.tradeId,
        attestationData.approvedAt,
        attestationData.tradedAt,
      ]
    );

    // Standard setup for the contract
    const provider = new ethers.providers.JsonRpcProvider(CHAINS.SEPOLIA.rpc);
    // create signer wallet
    const signerWallet = new ethers.Wallet(privateKey, provider);
    Logger.debug(`create signer wallet`);
    // Get the contract address from the Address Book in docs.sign.global
    const signProtocolSmartContractAddress = '0x878c92FD89d8E0B93Dc0a3c907A2adc7577e39c5';
    const contract = new Contract(signProtocolSmartContractAddress, CONTACT_ABI, signerWallet);
    Logger.debug(`Try issue attestation`);
    // call smart contract with the attestation data
    Logger.debug(`Signer Address: ${signerAddress}`);
    Logger.debug(`Recipient Address: ${attestationData.address}`);
    const tx = await contract.attest(
      {
        schemaId: BigNumber.from('0x266'), // The final number from our schema's ID.
        linkedAttestationId: 0, // We are not linking an attestation.
        attestTimestamp: 0, // Will be generated for us.
        revokeTimestamp: 0, // Attestation is not revoked.
        attester: signerAddress.toString(), // Signer address.
        validUntil: 0, // We are not setting an expiry date.
        dataLocation: 0, // We are placing data on-chain.
        revoked: false, // The attestation is not revoked.
        recipients: [attestationData.address], // Sale address
        data: schemaData, // The encoded schema data.
      },
      attestationData.address.toLowerCase(), // Bob's lowercase address will be our indexing key.
      '0x', // No delegate signature.
      '0x00' // No extra data.);
    );
    Logger.debug(`tx == ${JSON.stringify(tx)}`);
    const receipt = await tx.wait();
    Logger.debug(`receipt == ${JSON.stringify(receipt)}`);
    const attestationId = receipt.events[0].args.attestationId;

    const trades = collection<Trade>('trades');
    const trade = await get(trades, attestationData.id);
    Logger.debug(`attestationId == ${attestationId}`);
    trade.data.attestationId = attestationId;
    await update(trades, attestationData.id, trade.data);

    return attestationId;
  }
}
