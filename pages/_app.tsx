import 'tailwindcss/tailwind.css';
import './styles.css';
import {
  ContractKitProvider,
  Alfajores,
  NetworkNames,
} from "@celo-tools/use-contractkit"
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Head from 'next/head';
import NProgress from 'nprogress';
import Router from "next/router";
import canUseDom from 'can-use-dom';
import favicon from 'lib/assets/favicon.png';
import "@celo-tools/use-contractkit/lib/styles.css";
import "react-toastify/dist/ReactToastify.min.css"

dayjs.extend(localizedFormat);

function App({ Component, pageProps }) {
  return (
    <ContractKitProvider
      networks={[Alfajores]}
      network={{
        name: NetworkNames.Alfajores,
        rpcUrl: "https://alfajores-forno.celo-testnet.org",
        graphQl: "https://alfajores-blockscout.celo-testnet.org/graphiql",
        explorer: "https://alfajores-blockscout.celo-testnet.org",
        chainId: 44787,
      }}
      dapp={{
        name: "Celo justArt NFT Marketplace.",
        description: "Create, buy and sell your art easily.",
        url: "https://dacade.org",
        icon: "",
      }}
    >
      <Head>
        <title>justArt Market</title>

        <link rel="icon" type="image/png" href={favicon.src} />
      </Head>
      <Component {...pageProps} />
      <ToastContainer />
    </ContractKitProvider>
  )
}

export default App;

if (canUseDom) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start();
  });

  Router.events.on('routeChangeComplete', () => {
    NProgress.done();
  });

  Router.events.on('routeChangeError', () => {
    NProgress.done();
  });
}