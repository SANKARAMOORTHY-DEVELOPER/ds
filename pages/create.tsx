import { Button, Input, Layout, Select } from "components";
import { useContractKit } from "@celo-tools/use-contractkit"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { addNewItem, uploadToIpfs } from "../lib/market"
import { useMarketContract } from "lib/hooks/";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { ItemNFT, metadata } from "lib/interfaces";

function Create() {
  const { address, connect, performActions } = useContractKit();
  const [loading, setLoading] = useState(false);
  const [ipfsImage, setipfsImage] = useState("");
  const router = useRouter();
  const { register, handleSubmit, watch } = useForm<any>({ defaultValues: { duration: "86400", type: "0" } });
  const imageData = watch('image');
  const marketContract = useMarketContract();

  // console.log(ipfsImage)

  async function handleCreate(params) {
    let id: string = "/"
    if (marketContract === null) {
      return
    }
    if (!address) {
      await connect();
    }
    try {
      setLoading(true)

      const metadata: metadata = {
        name: params.name,
        description: params.description,
        image: ipfsImage,
      }

      const item: ItemNFT = {
        metadata: metadata,
        location: params.location,
        price: params.price
      }
      id = await addNewItem(marketContract, performActions, { item });
      toast.success('Listing created')
      setipfsImage("");
      router.push(`/items/${id}`);
    } catch (e) {
      console.log({ e });
      toast.error("Failed to create a product.");
    } finally {
      setLoading(false)
    }
  }

  async function upload() {
    if (imageData && ipfsImage == "") {
      if (!imageData[0]) {
        return;
      }
      const imageUrl = await uploadToIpfs(imageData[0]);
      if (!imageUrl) {
        alert("Failed to upload data")
        return;
      }
      setipfsImage(imageUrl)
    }
  }

  const buttonLabel = !address ? 'Connect Wallet' : 'Create Listing';

  return (
    <Layout>
      <div className="container my-12">
        <div className="max-w-lg mx-auto bg-gray-900 rounded-sm p-8">
          <h1 className="text-3xl font-semibold text-red-500">Create Listing</h1>
          <p>
            Create a New Item listing using this form.
          </p>
          <hr className="my-8" />
          <form onSubmit={handleSubmit(handleCreate)}>
            <div className="space-y-6">
              <div>
                <Input
                  label="Item Name"
                  {...register('name', { required: true })}
                />
              </div>
              <div>
                <Input
                  label="Item Description"
                  {...register('description', { required: true })}
                />
              </div>
              <div>
                <Input
                  type="file"
                  onChange={upload()}
                  label="Item Image"
                  {...register('image', { required: true })}
                />
              </div>
              <div>
                <Input
                  label="Item Location"
                  {...register('location', { required: true })}
                />
              </div>
              <div>
                <Input
                  type="number"
                  step={0.01}
                  label="Price (in CELO)"
                  {...register('price', { required: true })}
                />
              </div>
              <Button type="submit" loading={loading}>
                {buttonLabel}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default Create;