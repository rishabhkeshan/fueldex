import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { FuelProvider } from "@fuels/react";
import {
  BakoSafeConnector,
  createConfig as createFuelConfig,
  FueletWalletConnector,
  FuelWalletConnector,
  SolanaConnector,
  WalletConnectConnector,
  BurnerWalletConnector,
} from "@fuels/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { sepolia } from "wagmi/chains";
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


const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
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
            <App />
            <Toaster
              toastOptions={{
                position:
                  window.innerWidth <= 768 ? "top-center" : "bottom-center",
                style: {
                  background: "#F5F6E7",
                  color: "#181A22",
                  border: "1px solid #181A22",
                  fontWeight: "600",
                },
                success: {
                  iconTheme: {
                    primary: "#181A22",
                    secondary: "#fff",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#181A22",
                    secondary: "#fff",
                  },
                },
                loading: {
                  iconTheme: {
                    primary: "#181A22",
                    secondary: "#fff",
                  },
                },
                duration: 4000,
              }}
            />
        </FuelProvider>
      </QueryClientProvider>
  </StrictMode>
);
