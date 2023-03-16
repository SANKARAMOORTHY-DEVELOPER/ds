import { useContract } from './useContract';
import justArtAbi from 'lib/contracts/justArt-abi.json';
import justArtAddress from '../contracts/justArt-address.json';
import { AbiItem } from 'web3-utils';


// export interface for NFT contract
export const useMarketContract = () => useContract(justArtAbi.abi as AbiItem[], justArtAddress.addr);