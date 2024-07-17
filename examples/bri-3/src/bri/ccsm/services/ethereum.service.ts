import { Injectable, InternalServerErrorException } from '@nestjs/common';
import 'dotenv/config';
import {
  BaseWallet, Contract,
  ethers,
  InfuraProvider,
  Provider, SigningKey
} from 'ethers';
import * as CcsmBpiStateAnchor from '../../../../ccsmArtifacts/CcsmBpiStateAnchor.json';
import { internalBpiSubjectEcdsaPrivateKey } from '../../../shared/testing/constants';
import { ICcsmService } from './ccsm.interface';

@Injectable()
export class EthereumService implements ICcsmService {
  private provider: Provider;
  private wallet: BaseWallet;

  constructor() {
    // TOOD: This should be environment agnostic, meanning it can worok both against 
    // local hardhat node, sepolia and mainnet
    this.provider = new InfuraProvider(
      process.env.CCSM_NETWORK,
      process.env.INFURA_PROVIDER_API_KEY,
    );

    const signingKey = new SigningKey('0x' + internalBpiSubjectEcdsaPrivateKey);

    this.wallet = new BaseWallet(signingKey, this.provider);
  }

  async connectToContract(options: { readonly: boolean }): Promise<Contract> {
    const ccsmContractAddress = process.env.ALCHEMY_PROVIDER_NETWORK!;
    let ccsmBpiStateAnchorContract;

    if (options.readonly) {
      ccsmBpiStateAnchorContract = new ethers.Contract(
        ccsmContractAddress,
        CcsmBpiStateAnchor.abi,
        this.provider,
      );
    } else {
      ccsmBpiStateAnchorContract = new ethers.Contract(
        ccsmContractAddress,
        CcsmBpiStateAnchor.abi,
        this.wallet,
      );
    }

    return ccsmBpiStateAnchorContract;
  }

  public async storeAnchorHash(
    workgroupId: string,
    anchorHash: string,
  ): Promise<void> {
    const ccsmContract = await this.connectToContract({ readonly: false });
    try {
      const tx = await ccsmContract.setAnchorHash(workgroupId, anchorHash);
      await tx.wait();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error while trying to process ethereum tx : ${error}`,
      );
    }
  }

  public async getAnchorHash(workgroupdId: string): Promise<string> {
    const ccsmContract = await this.connectToContract({ readonly: true });
    const anchorHash = await ccsmContract.getAnchorHash(workgroupdId);
    return anchorHash;
  }
}
