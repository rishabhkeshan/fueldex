import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@rainbow-me/rainbowkit/styles.css";
import { FuelProvider } from "@fuels/react";
import { defaultConnectors } from "@fuels/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, base, mainnet, optimism } from "wagmi/chains";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

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
          fuelConfig={{
            connectors: defaultConnectors(),
          }}
        >
          <RainbowKitProvider>
            <App />
            <Toaster
              toastOptions={{
                position:
                  window.innerWidth <= 768 ? "top-center" : "bottom-center",
                style: {
                  background: '#141414', // fuel-dark-800
                  color: '#fff',
                  border: '1px solid #27272A', // fuel-dark-600
                },
                success: {
                  iconTheme: {
                    primary: '#00F58C', // fuel-green
                    secondary: '#141414', // fuel-dark-800
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444', // red-500
                    secondary: '#141414', // fuel-dark-800
                  },
                },
                loading: {
                  iconTheme: {
                    primary: '#00F58C', // fuel-green
                    secondary: '#141414', // fuel-dark-800
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
