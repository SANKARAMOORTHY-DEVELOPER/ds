import { ItemNFT, metadata } from "lib/interfaces";
import { v4 as uuid4 } from "uuid";
import axios from "axios";
import BigNumber from "bignumber.js"
import { create as ipfsHttpClient } from "ipfs-http-client";
import { ERC20_DECIMALS } from "./constants";
import { Contract } from "web3-eth-contract"

const auth = 'Basic ' + Buffer.from(process.env.PROJECT_ID + ':' + process.env.PROJECT_SECRET).toString('base64')

const client = ipfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth
    }
})

// function to upload a file to IPFS
export const uploadToIpfs = async (file: string) => {
    if (!file) return;
    try {
        const added = await client.add(file, {
            progress: (prog) => console.log(`received: ${prog}`),
        });
        return `https://justartmarket.infura-ipfs.io/ipfs/${added.path}`;
    } catch (error) {
        console.log("Error uploading file: ", error);
    }
};

export async function addNewItem(marketContract: Contract, perFormActions: Function, params: { item: ItemNFT }) {
    let { item } = params;
    item.id = uuid4();
    item.price = new BigNumber(item.price)
        .shiftedBy(ERC20_DECIMALS)
        .toString();

    await perFormActions(async (kit) => {
        const { defaultAccount } = kit;
        // convert Item metadata to JSON format
        const data = JSON.stringify(item.metadata);
        // save metadata to IPFS
        const added = await client.add(data);
        // IPFS url for uploaded metadata
        const url = `https://justartmarket.infura-ipfs.io/ipfs/${added.path}`;
        // mint the NFT and save the IPFS url to the blockchain
        await marketContract.methods
            .addNewItem(item.id, url, item.location, item.price)
            .send({ from: defaultAccount });
    })

    return item.id;
}

export async function buyItem(marketContract: Contract, perFormActions: Function, params: { itemId: string, price: string }) {
    const { itemId, price } = params;
    const itemTokenID = await marketContract.methods.lookUpStringId(itemId).call();
    return perFormActions(async (kit) => {
        const { defaultAccount } = kit;

        await marketContract.methods.buyItems(itemTokenID).send({
            from: defaultAccount,
            value: price
        });
    })
}

export async function relistItem(marketContract: Contract, perFormActions: Function, params: { itemId: string, newPrice: string, newLocation: string, }) {
    let { itemId, newPrice, newLocation } = params;
    const itemTokenID = await marketContract.methods.lookUpStringId(itemId).call();

    newPrice = new BigNumber(newPrice)
        .shiftedBy(ERC20_DECIMALS)
        .toString();

    return perFormActions(async (kit) => {
        const { defaultAccount } = kit;

        await marketContract.methods.relistItem(itemTokenID, newLocation, newPrice).send({
            from: defaultAccount
        });
    })
}

export async function unlistItem(marketContract: Contract, perFormActions: Function, params: { itemId: string }) {
    const { itemId } = params;
    const itemTokenID = await marketContract.methods.lookUpStringId(itemId).call();
    return perFormActions(async (kit) => {
        const { defaultAccount } = kit;

        await marketContract.methods.unlistItem(itemTokenID).send({
            from: defaultAccount
        });
    });
}

// get functions
// get the metedata for an NFT from IPFS
export async function fetchNftMeta(ipfsUrl: string) {
    try {
        if (ipfsUrl === null || !ipfsUrl) return null;
        const meta = await axios.get(ipfsUrl);
        return meta;
    } catch (e) {
        console.log({ e });
    }
};

// get user items
export async function getUserItems(marketContract: Contract, params: { address: string }) {
    const { address } = params;
    let userItems: ItemNFT[] = await marketContract.methods.getUserItems(address).call();
    const items = [];

    for (let i = 0; i < userItems.length; i++) {
        let item: ItemNFT = userItems[i];
        const _data = new Promise<ItemNFT>(async (resolve) => {
            const itemTokenID = await marketContract.methods.lookUpStringId(item.id).call();
            const uri = await marketContract.methods.tokenURI(itemTokenID).call();
            const metadata = await fetchNftMeta(uri);
            resolve({
                id: item.id,
                owner: item.owner,
                location: item.location,
                price: item.price,
                isItemListed: item.isItemListed,
                history: item.history,
                metadata: {
                    name: metadata?.data.name,
                    description: metadata?.data.description,
                    image: metadata?.data.image,
                }
            });
        });

        items.push(_data);
    }
    return Promise.all(items);
}

// get all items
export async function getItems(marketContract: Contract) {
    const _itemsLength = await marketContract.methods.totalSupply().call();
    const _items = []

    for (let i = 0; i < _itemsLength; i++) {
        const _itemdata = _getItemFromID(marketContract, i);
        _items.push(_itemdata)
    }
    return Promise.all(_items);
}

export async function getItemFromID(marketContract: Contract, params: { itemStringId: string }) {
    const { itemStringId } = params;

    const itemTokenID = await marketContract.methods.lookUpStringId(itemStringId).call();

    const itemMarketData = _getItemFromID(marketContract, itemTokenID);

    return await itemMarketData;
}

export function idLookUp(marketContract: Contract, params: { itemStringId: string }) {
    const { itemStringId } = params;
    return marketContract.methods.lookUpStringId(itemStringId).call();
}

function _getItemFromID(marketContract: Contract, itemId: number) {
    const _itemdata = new Promise<ItemNFT>(async (resolve, reject) => {
        const data: ItemNFT = await marketContract.methods.getItemFromID(itemId).call();
        const uri = await marketContract.methods.tokenURI(itemId).call();
        const metadata = await fetchNftMeta(uri);
        resolve({
            id: data.id,
            owner: data.owner,
            location: data.location,
            price: data.price,
            isItemListed: data.isItemListed,
            history: data.history,
            metadata: {
                name: metadata?.data.name,
                description: metadata?.data.description,
                image: metadata?.data.image,
            }
        })
    });

    return _itemdata;
}
