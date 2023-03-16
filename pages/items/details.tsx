import { Button, Layout, Loader } from "components";
import { getItemFromID } from "lib/market";
import TimeAgo from "react-timeago";
import { ExternalLink } from "react-feather";
import { useContractKit } from "@celo-tools/use-contractkit";
import { unlistItem, buyItem, idLookUp } from "lib/market";
import { useMarketContract } from "lib/hooks";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { ItemNFT, metadata } from "lib/interfaces";
import { formatBigNumber, truncateAddress, typeformat } from "lib/utils";
import ListItemModal from "./listModal";
import BigNumber from "bignumber.js";
import justArtAddress from 'lib/contracts/justArt-address.json';

function Details({ id }: { id: string }) {

  const meta: metadata = {
    name: "...",
    description: "...",
    image: "...",
  }

  const template: ItemNFT = {
    id: "...",
    owner: "...",
    location: "...",
    metadata: meta,
    price: "0",
    isItemListed: true,
    history: []
  }

  const { address, connect, performActions } = useContractKit();
  const marketContract = useMarketContract();
  const [item, setItem] = useState<ItemNFT>(template);
  const [itemTokenID, setTokenID] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [pageLoad, setPageLoad] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => setShowModal(false);

  const getItemData = useCallback(async () => {
    if (marketContract.methods || address !== null || id !== null) {
      try {
        setPageLoad(true);
        setItem(await getItemFromID(marketContract, { itemStringId: id }));
        setTokenID(await idLookUp(marketContract, { itemStringId: id }))
      } catch (error) {
        console.log({ error });
      } finally {
        setPageLoad(false);
      }
    }
  }, [marketContract, address, id]);

  const isOwner = () => {
    if (address) {
      return item.owner.toLocaleLowerCase() === address.toLocaleLowerCase()
    } else {
      return
    }
  }
  const buttonLabel = address ? (isOwner() ? (item.isItemListed ? 'Remove listing' : 'Add listing') : 'Buy now') : 'Connect Wallet';

  async function handleAction() {
    if (!marketContract.methods) {
      return
    }
    if (address === null) {
      await connect();
      return;
    }
    setLoading(true);
    try {
      if (isOwner()) {
        if (buttonLabel == "Add listing") {
          setShowModal(true);
        } else if (buttonLabel == "Remove listing") {
          await unlistItem(marketContract, performActions, { itemId: id });
          getItemData();
        }
      } else {
        await buyItem(marketContract, performActions, { itemId: id, price: item.price });
        getItemData();
      }
    } catch (e) {
      console.log(e)
    }
    setLoading(false);

  }


  useEffect(() => {
    if (id === null) {
      return () => { }
    }
    if (item.price === "0" && marketContract.methods) {
      getItemData();
    }

  }, [id, getItemData, address, marketContract])
  return (
    <Layout>
      {pageLoad ? (
        <Loader />
      ) : (
        <div className="container py-8">
          <div className="md:grid md:grid-cols-3 md:gap-8">
            <div className="mb-8 md:mb-0">
              <div className="bg-gray-800 border border-gray-800 mb-8">
                <span
                  className="block bg-cover bg-center"
                  style={{ width: '100%', paddingBottom: '100%', backgroundImage: `url(${item.metadata.image})` }}
                />
              </div>
              {(isOwner() || item.isItemListed) && (
                <Fragment>
                  <div className="bg-gray-800 border border-gray-700 rounded-sm grid grid-cols-2 divide-x divide-gray-700">
                    <div className="p-4 text-center">
                      <p className="uppercase font-bold text-sm mb-1 text-red-600">
                        Item Price
                      </p>
                      <p className="font-mono text-xl leading-none">
                        {formatBigNumber(new BigNumber(item.price))} CELO
                      </p>
                    </div>
                    <div className="p-3 flex flex-col justify-center items-center">
                      <Button onClick={handleAction} loading={loading} block>{buttonLabel}</Button>
                    </div>
                  </div>
                </Fragment>
              )}
            </div>
            <div className="md:col-span-2">
              <div className="bg-gray-800s lg:border-l border-gray-700 border-dashesd lg:pl-8 rounded-sm">
                <p className="text-lg font-medium">
                  <a>{item.metadata.name}</a>
                </p>
                <h1 className="text-4xl font-bold">{item.metadata.name}</h1>
                <p className="mb-8 w-full">
                  <span className="mr-1">Owned by</span>
                  <a
                    href={`https://alfajores-blockscout.celo-testnet.org/address/${item.owner}/transactions`}
                    target="_blank"
                    className="font-mono text-red-200 border-b border-dashed border-gray-700 truncate block">
                    {truncateAddress(item.owner)}
                  </a>
                </p>
                <h3 className="mb-3 font-semibold text-lg">Details</h3>
                <div className="mb-8 bg-gray-900 p-4 rounded-sm space-y-4">
                  <div>
                    <span className="font-bold text-sm block">Description</span>
                    {item.metadata.description}
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Location</span>
                    {item.location}
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <span className="font-bold text-sm block">Item ID</span>
                      <a href={`https://alfajores-blockscout.celo-testnet.org/token/${justArtAddress.addr}/instance/${itemTokenID}/token-transfers`} target="_blank" className="truncate block">
                        {item.id}
                      </a>
                    </div>
                  </div>
                </div>
                <h3 className="mb-3 font-semibold text-lg">History</h3>
                <div className="bg-gray-900 rounded-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <td className="px-4 py-3">Type</td>
                        <td className="px-4 py-3">From</td>
                        <td className="text-right px-4 py-3">Price</td>
                        <td className="text-right px-4 py-3">Time</td>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {item.history.map(transaction => (
                        <tr key={transaction.id}>
                          <td className="border-t border-gray-800 px-4 py-3">
                            <span className="flex items-center space-x-1" style={{ "color": "#D7342A" }}>
                              <span>{typeformat(Number(transaction.tranType))}</span>
                              <ExternalLink size="0.85em" />
                            </span>
                          </td>
                          <td className="relative w-1/4 border-t border-gray-800">
                            <span className="absolute inset-0 truncate px-4 py-3">
                              {truncateAddress(transaction.from)}
                            </span>
                          </td>
                          <td className="relative w-1/4 border-t border-gray-800 px-4 py-3 text-right">
                            {Number(transaction.price) ? `${formatBigNumber(new BigNumber(transaction.price))} CELO` : '--'}
                          </td>
                          <td className="text-right border-t border-gray-800 px-4 py-3">
                            <TimeAgo date={new Date(transaction.createdAt * 1000)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal ? (
        <ListItemModal handleClose={handleClose} update={getItemData} marketContract={marketContract} id={item.id} />
      ) :
        <></>
      }

    </Layout>
  )
}

export default Details;