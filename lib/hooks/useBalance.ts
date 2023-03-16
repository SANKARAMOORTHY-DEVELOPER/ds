import { useState, useEffect, useCallback } from 'react';
import { useContractKit } from '@celo-tools/use-contractkit';
import BigNumber from 'bignumber.js';
export const useBalance = () => {

  type prop = {
    number: BigNumber | undefined
  }
  const deflt: prop = {
    number: new BigNumber(0)
  }

  const { address, kit } = useContractKit();
  const [balance, setBalance] = useState(deflt.number);


  const getBalance = useCallback(async () => {

    // fetch a connected wallet token balance
    const add = address ? address : "";
    const value = await kit.getTotalBalance(add);
    setBalance(value.CELO);
  }, [address, kit]);

  useEffect(() => {
    if (address) getBalance();
  }, [address, getBalance]);

  return {
    balance,
    getBalance,
  };
};
