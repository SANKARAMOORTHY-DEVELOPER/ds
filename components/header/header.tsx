import logo from 'lib/assets/logo.svg';
import { useContractKit } from "@celo-tools/use-contractkit";
import { Fragment, useEffect, useCallback, useState } from 'react';
import { useBalance, useMarketContract } from "lib/hooks"
import { Wallet } from 'components';
import Link from 'next/link';

export function Header() {
  /*
  address : fetch the connected wallet address
  destroy: terminate connection to user wallet
  connect : connect to the celo blockchain
   */
  const { address, destroy, connect } = useContractKit()
  const [accountAddr, setAccountAddr] = useState("");


  //  fetch user's celo balance using hook
  const { balance } = useBalance()
  const marketContract = useMarketContract();

  async function handleConnect() {
    try {
      await connect()
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (address && marketContract.methods) {
      setAccountAddr(address)
    } else {
      setAccountAddr("")
    }
  }, [address, marketContract])

  return (
    <div className="bg-gray-900 border-b border-gray-800 text-white text-sm font-mono">
      <div className="container py-4 md:flex items-center">
        <div className="flex-1 mb-3 md:mb-0">
          <a href="/">
            <img src={logo.src} className={"filter"} style={{ height: 22 }} />
            <h6>justArt Market</h6>
          </a>
        </div>
        <div className="flex space-x-6 items-center">
          {accountAddr ? (
            <Fragment>
              <Link href="/create">
                <a>Create</a>
              </Link>
              <Link href="/my-items">
                <a>My Items</a>
              </Link>
              <Wallet
                address={accountAddr}
                amount={balance}
                symbol="CELO"
                destroy={destroy}
              />
            </Fragment>
          ) : (
            <a onClick={handleConnect} className="border border-red-500 px-3 py-2">Connect Wallet</a>
          )}
        </div>
      </div>
    </div>
  )
}