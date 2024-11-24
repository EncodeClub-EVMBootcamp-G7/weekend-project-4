import { Injectable } from '@nestjs/common';
import * as tokenJson from './MyTokens.json';
import {
  createPublicClient,
  http,
  Address,
  formatEther,
  createWalletClient,
} from 'viem';
import { sepolia } from 'viem/chains';
import { ConfigService } from '@nestjs/config';
import { privateKeyToAccount } from 'viem/accounts';

@Injectable()
export class AppService {
  publicClient;
  walletClient;
  constructor(private configService: ConfigService) {
    const apikey = this.configService.get<string>('ALCHEMY_API_KEY');
    const privatekey = this.configService.get<string>('PRIVATE_KEY');
    const account = privateKeyToAccount(`0x${privatekey}`);
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${apikey}`),
    });
    this.walletClient = createWalletClient({
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${apikey}`),
      chain: sepolia,
      account: account,
    });
  }
  getHello(): string {
    return 'Hello World!';
  }
  getContractAddress(): Address {
    return '0x42c75444c0b6a9cc21346feba1dd0bfdd009389b';
  }
  async getTokenName(): Promise<string> {
    const name = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'name',
    });
    return name as string;
  }
  async getTotalSupply() {
    const symbol = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'symbol',
    });

    const totalsupply = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'totalSupply',
    });
    return `${formatEther(totalsupply)} of ${symbol}`;
  }
  async getTokenBalance(address: string) {
    const symbol = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'symbol',
    });
    const balance = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'balanceOf',
      args: [address],
    });
    return `Token Balance of ${address} is ${formatEther(balance)} ${symbol}`;
  }
  async getTransactionReceipt(hash: string) {
    const tx = await this.publicClient.getTransactionReceipt({ hash: hash });
    return `Transaction Status = ${tx.status} at block ${tx.blockNumber}`;
  }
  async getServerWalletAddress() {
    const address = await this.walletClient.account.address;
    return address;
  }
  async checkMinterRole(address: string) {
    const MINTER_ROLE = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'MINTER_ROLE',
    });
    const hasRole = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'hasRole',
      args: [MINTER_ROLE, address],
    });
    return `The address ${hasRole ? 'has' : 'doesnt have'} the role ${MINTER_ROLE}`;
  }
  async getVotes(address: string): Promise<string> {
    const votes = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'getVotes',
      args: [address],
    });

    // Return a formatted string with the result
    return `The address ${address} has ${Number(votes) / 10 ** 18} votes.`;
  }

  async mintTokens(address: string, amount: number) {
    const txHash = await this.walletClient.writeContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'mint',
      args: [address, BigInt(amount * 10 ** 18)],
    });

    // Wait for the transaction receipt to confirm success
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    if (receipt.status === 'success') {
      return `Tokens successfully minted. Transaction hash: ${txHash}`;
    } else {
      throw new Error(`Minting failed. Transaction hash: ${txHash}`);
    }
  }
  async delegate(address: string) {
    const txHash = await this.walletClient.writeContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'delegate',
      args: [address],
    });

    // Wait for the transaction receipt to confirm success
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    if (receipt.status === 'success') {
      return `Delegated successfully. Transaction hash: ${txHash}`;
    } else {
      throw new Error(`Delegation failed. Transaction hash: ${txHash}`);
    }
  }
}
