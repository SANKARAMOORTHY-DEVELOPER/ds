import React, { useState, useCallback, useEffect } from "react";
import { Layout, Loader } from "components";
import { useContractKit } from "@celo-tools/use-contractkit"
import { ItemList } from "components/item-list/item-list";
import { getUserItems } from "lib/market";
import { useMarketContract } from "lib/hooks";
import { ItemNFT } from "lib/interfaces";

function MyListings() {
  const [items, setItems] = useState<ItemNFT[]>(null);
  const [loading, setLoading] = useState(false);

  const { address } = useContractKit()
  const marketContract = useMarketContract();

  // function to get the list of items
  const retrieveItems = useCallback(async () => {
    if (!marketContract.methods && address === null) {
      return
    }
    try {
      setLoading(true);
      const userItems: ItemNFT[] = await getUserItems(marketContract, { address })
      setItems(userItems);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }, [marketContract]);

  useEffect(() => {
    if (items === null && marketContract.methods) {
      retrieveItems();
    }
  }, [retrieveItems, address, marketContract])

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="font-semibold text-xl mb-5">My Items</h1>
        {loading && <Loader />}
        <ItemList items={items} />
      </div>
    </Layout>
  )
}

export default MyListings;