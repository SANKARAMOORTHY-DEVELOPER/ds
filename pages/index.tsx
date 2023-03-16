import React, { useCallback, useEffect, useState } from "react";
import { Layout, Loader } from "components";
import { ItemList } from "components/item-list/item-list";
import { ItemNFT } from "lib/interfaces";
import { getItems } from "../lib/market";
import { useMarketContract } from "lib/hooks";
import { useContractKit } from "@celo-tools/use-contractkit"

function Index() {
  const { address } = useContractKit()
  const [items, setItems] = useState<ItemNFT[]>(null);
  const [loading, setLoading] = useState(false);

  const contract = useMarketContract();

  // function to get the list of items
  const retrieveItems = useCallback(async () => {
    if (!contract.methods) {
      return
    }
    try {
      setLoading(true);
      let listedItems: ItemNFT[] = []
      const items: ItemNFT[] = await getItems(contract);
      for (let i = 0; i < items.length; i++) {
        if (!items[i].isItemListed) {
          continue;
        }
        listedItems.push(items[i])
      }
      setItems(listedItems);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    if (items === null && contract.methods) {
      retrieveItems();
    }
  }, [retrieveItems, address, items, contract])

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="font-semibold text-xl mb-5">Listed Items</h1>
        {loading && <Loader />}
        <ItemList items={items} />
      </div>
    </Layout>
  )
}

export default Index;