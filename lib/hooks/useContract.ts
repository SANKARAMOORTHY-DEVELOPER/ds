import { useState, useEffect, useCallback } from 'react';
import { useContractKit } from '@celo-tools/use-contractkit';
import { AbiItem } from 'web3-utils';
import { Contract } from "web3-eth-contract";
import { newKitFromWeb3 } from '@celo/contractkit';
import Web3 from 'web3';

export const useContract = (abi: AbiItem[], contractAddress: string) => {
  const { getConnectedKit, address } = useContractKit();
  const [contract, setContract] = useState({});

  const getContract = useCallback(async () => {
    const kit = await getConnectedKit();

    const contract = new kit.web3.eth.Contract(abi, contractAddress);
    // get a contract interface to interact with
    setContract(contract);
  }, [getConnectedKit, abi, contractAddress]);


  const defaultConnection = useCallback(async () => {
    const web3 = new Web3('https://alfajores-forno.celo-testnet.org');
    const kit = newKitFromWeb3(web3);
    const contract = new kit.web3.eth.Contract(abi, contractAddress);
    setContract(contract);
  }, [])

  useEffect(() => {
    if (address) {
      getContract()
    } else {
      defaultConnection()
    };
  }, [address, getContract, defaultConnection]);

  return contract as Contract;
};
