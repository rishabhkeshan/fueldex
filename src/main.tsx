import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@rainbow-me/rainbowkit/styles.css";
import { FuelProvider } from "@fuels/react";
import {
  BakoSafeConnector,
  createConfig as createFuelConfig,
  FueletWalletConnector,
  FuelWalletConnector,
  SolanaConnector,
  WalletConnectConnector,
  BurnerWalletConnector,
} from "@fuels/connectors";import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, base, mainnet, optimism, sepolia } from "wagmi/chains";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { CHAIN_IDS, Provider } from "fuels";
import { createConfig, http, injected } from "@wagmi/core";
import { walletConnect } from "@wagmi/connectors";
import type { Config as WagmiConfig } from "@wagmi/core";
import { WagmiProvider } from "wagmi";
const FUEL_PROVIDER_URL = "https://testnet.fuel.network/v1/graphql";
const FUEL_CONFIG = createFuelConfig(() => {
  const WalletConnectProjectId = "35b967d8f17700b2de24f0abee77e579";
  const wagmiConfig = createConfig({
    syncConnectedChain: false,
    chains: [sepolia],
    transports: {
      [sepolia.id]: http(),
    },
    connectors: [
      injected({ shimDisconnect: false }),
      walletConnect({
        projectId: WalletConnectProjectId,
        metadata: {
          name: "Fuel DEX",
          description: "Fuel DEX",
          url: "https://fuel-dex.vercel.app/",
          icons: ["https://connectors.fuel.network/logo_white.png"],
        },
      }),
    ],
  });

  const fuelProvider = new Provider(FUEL_PROVIDER_URL);

  const externalConnectorConfig = {
    chainId: CHAIN_IDS.fuel.testnet,
    fuelProvider,
  };

  const fueletWalletConnector = new FueletWalletConnector();
  const fuelWalletConnector = new FuelWalletConnector();
  const bakoSafeConnector = new BakoSafeConnector();
  const burnerWalletConnector = new BurnerWalletConnector({ fuelProvider });
  const walletConnectConnector = new WalletConnectConnector({
    projectId: WalletConnectProjectId,
    wagmiConfig: wagmiConfig as WagmiConfig,
    ...externalConnectorConfig,
  });
  const solanaConnector = new SolanaConnector({
    projectId: WalletConnectProjectId,
    ...externalConnectorConfig,
  });
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /(iphone|android|windows phone)/.test(userAgent);

  return {
    connectors: [
      fueletWalletConnector,
      walletConnectConnector,
      solanaConnector,
      burnerWalletConnector,
      ...(isMobile ? [] : [fuelWalletConnector, bakoSafeConnector]),
    ],
  };
});

const config = getDefaultConfig({
  appName: "Fuel Order Book",
  projectId: "YOUR_PROJECT_ID",
  chains: [mainnet, optimism, arbitrum, base],
});
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <FuelProvider
          theme="dark"
          networks={[
            {
              chainId: CHAIN_IDS.fuel.testnet,
              url: "https://testnet.fuel.network/v1/graphql",
            },
          ]}
          fuelConfig={FUEL_CONFIG}
        >
          <RainbowKitProvider>
            <App />
            <Toaster
              toastOptions={{
                position:
                  window.innerWidth <= 768 ? "top-center" : "bottom-center",
                style: {
                  background: "#141414", // fuel-dark-800
                  color: "#fff",
                  border: "1px solid #27272A", // fuel-dark-600
                },
                success: {
                  iconTheme: {
                    primary: "#00F58C", // fuel-green
                    secondary: "#141414", // fuel-dark-800
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#EF4444", // red-500
                    secondary: "#141414", // fuel-dark-800
                  },
                },
                loading: {
                  iconTheme: {
                    primary: "#00F58C", // fuel-green
                    secondary: "#141414", // fuel-dark-800
                  },
                },
                duration: 4000,
              }}
            />
          </RainbowKitProvider>
        </FuelProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
