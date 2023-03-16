export interface Collection {
  id: string;
  name?: string;
}

export interface ItemNFT {
  id?: string;
  owner?: string;
  metadata?: metadata;
  location: string;
  price: string;
  isItemListed?: boolean;
  history?: Transaction[];
}

export interface metadata {
  name: string;
  description: string;
  image: string;
}

export interface Transaction {
  id: number;
  tranType: string;
  from: string;
  price: string;
  createdAt: number;
}