import React, { MutableRefObject } from "react";
import {
  Account,
  bn,
  ScriptTransactionRequest,
  Coin,
  Provider,
  BN,
  Wallet,
  TransactionRequest,
} from "fuels";
import axios from "axios";
import { toast } from "react-hot-toast";
import { BASE_URL, FUEL_PROVIDER_URL } from "./constants";
import { logTime } from "./timeLogger";
import { OrderbookPredicate } from "../out";

interface SwapParams {
  wallet: Account;
  fromToken: {
    symbol: string;
    assetID: string;
  };
  toToken: {
    symbol: string;
    assetID: string;
  };
  fromAmount: string;
  bnToAmount: BN;
  coins?: Coin[];
  baseEthCoins?: Coin[];
  ethCoinsRef: MutableRefObject<Coin[]>;
  btcCoinsRef: MutableRefObject<Coin[]>;
  usdcCoinsRef: MutableRefObject<Coin[]>;
  fuelCoinsRef: MutableRefObject<Coin[]>;
  baseEthCoinsRef: MutableRefObject<Coin[]>;
  preCalculatedRequest?: TransactionRequest;
}

/**
 * Execute a token swap
 */
export const executeSwap = async ({
  wallet,
  fromToken,
  toToken,
  fromAmount,
  bnToAmount,
  preCalculatedRequest,
}: SwapParams) => {
  logTime(
    "swap_initiated",
    `${fromAmount} ${fromToken.symbol} -> ${toToken.symbol}`
  );

  if (!wallet || !fromAmount) {
    toast.error("Please connect wallet and enter amount");
    return null;
  }

  try {
    const provider = new Provider(FUEL_PROVIDER_URL);

    // Get burner wallet private key from local storage
    const burnerPrivateKey = localStorage.getItem("burner-wallet-private-key");
    if (!burnerPrivateKey) {
      throw new Error("Burner wallet private key not found");
    }

    // Create burner wallet instance
    const burnerWallet = Wallet.fromPrivateKey(burnerPrivateKey, provider);
    const orderPredicate = new OrderbookPredicate({
      configurableConstants: {
        ASSET_ID_GET: toToken.assetID,
        ASSET_ID_SEND: fromToken.assetID,
        MINIMAL_OUTPUT_AMOUNT: bnToAmount,
        RECEPIENT: burnerWallet.address.b256Address,
      },
      data: [1],
      provider,
    });

    let assembledRequest = preCalculatedRequest;

    // If no pre-calculated request, calculate it now
    if (!assembledRequest) {
      console.log("Calculating request...");
      const scriptTransactionRequest = new ScriptTransactionRequest();
      const sellTokenAmount = bn.parseUnits(fromAmount, 9);
      burnerWallet.addTransfer(scriptTransactionRequest, {
        destination: orderPredicate.address,
        amount: sellTokenAmount,
        assetId: fromToken.assetID,
      });
      const result = await provider.assembleTx({
        request: scriptTransactionRequest,
        feePayerAccount: burnerWallet,
        accountCoinQuantities: [
          {
            account: burnerWallet,
            amount: sellTokenAmount,
            assetId: fromToken.assetID,
          },
        ],
      });
      assembledRequest = result.assembledRequest;
    }
    await burnerWallet.populateTransactionWitnessesSignature(assembledRequest);

    const txid = assembledRequest.getTransactionId(0);

    logTime("send_transaction_start");
    const response = await toast.promise(
      (async () => {
        logTime("fill_order_request_start");

        const { data } = await axios.post(`${BASE_URL}/fill-order`, {
          sellTokenName: fromToken.symbol.toLowerCase(),
          sellTokenAmount: bn.parseUnits(fromAmount, 9).toString(),
          recepientAddress: burnerWallet.address.b256Address,
          buyTokenName: toToken.symbol.toLowerCase(),
          predicateAddress: orderPredicate.address,
          minimalBuyAmount: bnToAmount,
          predicateScriptRequest: assembledRequest.toJSON(),
        });
        console.log("data", data);
        logTime("fill_order_request_end");
        return data;
      })(),
      {
        loading: "Swapping tokens...",
        success: () => {
          logTime("send_transaction_success");
          return (
            <span>
              Swap successful!
              <br />
              <a
                href={`https://app-testnet.fuel.network/tx/${txid}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "underline" }}
              >
                {txid.substring(0, 8)}...{txid.substring(txid.length - 8)}
              </a>
            </span>
          );
        },
        error: (err) => {
          logTime("send_transaction_error", `Error: ${err.message}`);
          return "Failed to send transaction";
        },
      }
    );
    logTime("swap_completed", `Transaction ID: ${txid}`);
    console.log("Pre confirmation:", response);

    return response;

  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Swap error:", error);
    logTime("swap_failed", errorMessage);
    toast.error("Failed to execute swap");
    return null;
  }
};

/**
 * Calculate equivalent token amount based on prices
 */
export const calculateTokenAmount = (
  amount: string,
  fromTokenPrice: number | null,
  toTokenPrice: number | null,
  direction: "from-to" | "to-from"
): string => {
  const numericAmount = parseFloat(amount);

  if (
    isNaN(numericAmount) ||
    numericAmount <= 0 ||
    !fromTokenPrice ||
    !toTokenPrice
  ) {
    return "";
  }

  if (direction === "from-to" && toTokenPrice > 0) {
    return (numericAmount * (fromTokenPrice / toTokenPrice)).toFixed(6);
  } else if (direction === "to-from" && fromTokenPrice > 0) {
    return (numericAmount * (toTokenPrice / fromTokenPrice)).toFixed(6);
  }

  return "";
};
