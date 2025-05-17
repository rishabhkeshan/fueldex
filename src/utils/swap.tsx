import React, { MutableRefObject } from "react";
import { Account, Address, bn, ScriptTransactionRequest, Coin } from "fuels";
import axios from "axios";
import { toast } from "react-hot-toast";
import { BASE_URL } from "./constants";
import { logTime } from "./timeLogger";

interface SwapParams {
  wallet: Account;
  fromToken: {
    symbol: string;
    assetID: string;
  };
  toToken: {
    symbol: string;
  };
  fromAmount: string;
  coins?: Coin[];
  baseEthCoins?: Coin[];
  ethCoinsRef: MutableRefObject<Coin[]>;
  btcCoinsRef: MutableRefObject<Coin[]>;
  usdcCoinsRef: MutableRefObject<Coin[]>;
  fuelCoinsRef: MutableRefObject<Coin[]>;
  baseEthCoinsRef: MutableRefObject<Coin[]>;
}

/**
 * Execute a token swap
 */
export const executeSwap = async ({
  wallet,
  fromToken,
  toToken,
  fromAmount,
  coins,
  baseEthCoins,
  ethCoinsRef,
  btcCoinsRef,
  usdcCoinsRef,
  fuelCoinsRef,
  baseEthCoinsRef,
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
    const scriptTransactionRequest = new ScriptTransactionRequest();
    logTime("create_transaction_request");

    // Add passed-in coins as resources if provided
    if (coins && coins.length > 0) {
      const coinResources = coins.map((coin) => ({
        id: coin.id,
        assetId: coin.assetId,
        amount: bn(coin.amount),
        owner: wallet.address,
        blockCreated: bn(coin.blockCreated ?? 0),
        txCreatedIdx: bn(coin.txCreatedIdx ?? 0),
      }));
      scriptTransactionRequest.addResources(coinResources);
    }
    logTime("get_resources");

    if (baseEthCoins && baseEthCoins.length > 0) {
      const baseEthResources = baseEthCoins.map((coin) => ({
        id: coin.id,
        assetId: coin.assetId,
        amount: bn(coin.amount),
        owner: wallet.address,
        blockCreated: bn(coin.blockCreated ?? 0),
        txCreatedIdx: bn(coin.txCreatedIdx ?? 0),
      }));
      scriptTransactionRequest.addResources(baseEthResources);
    }
    logTime("get_base_resources");

    const sellTokenAmount = bn.parseUnits(fromAmount, 9);

    // const baseResources = await wallet.getResourcesToSpend([
    //   {
    //     assetId: await wallet.provider.getBaseAssetId(),
    //     amount: bn(2000000),
    //   },
    // ]);
    // logTime('get_base_resources_end');

    // scriptTransactionRequest.addResources(baseResources);

    const solverAddress = Address.fromB256(
      "0xf8cf8acbe8b4d970c3e1c9ffed11e8b55abfc5287ad7f5e4d0240a4f0651d658"
    );
    scriptTransactionRequest.addCoinOutput(
      solverAddress,
      sellTokenAmount,
      fromToken.assetID
    );
    scriptTransactionRequest.addChangeOutput(wallet.address, fromToken.assetID);

    logTime("fill_order_request_start");

    const { data } = await axios.post(`${BASE_URL}/fill-order`, {
      scriptRequest: scriptTransactionRequest.toJSON(),
      sellTokenName: fromToken.symbol.toLowerCase(),
      buyTokenName: toToken.symbol.toLowerCase(),
      sellTokenAmount: sellTokenAmount.toString(),
      recepientAddress: wallet.address.toB256(),
    });
    logTime("fill_order_request_end");

    const responseRequest = new ScriptTransactionRequest();
    Object.assign(responseRequest, data.request);

    logTime("send_transaction_start");
    const tx = await toast.promise(
      (async () => {
        const tx = await wallet.sendTransaction(responseRequest);
        if (!tx) throw new Error("Failed to send transaction");
        logTime("pre_confirmation_start");
        const preConfirmation = await tx.waitForPreConfirmation();
              if (preConfirmation.resolvedOutputs) {
                // Filter to only get the output with ETH assetId
                const ethOutput = preConfirmation.resolvedOutputs.find(
                  (output) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (output.output as any).assetId ===
                      "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07" &&
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (output.output as any).to === wallet.address.toB256()
                );
                if (ethOutput) {
                  const ethCoin = {
                    id: ethOutput.utxoId,
                    assetId: ethOutput.output.assetId,
                    amount: ethOutput.output.amount,
                    owner: wallet.address,
                    blockCreated: bn(0),
                    txCreatedIdx: bn(0),
                  };
                  baseEthCoinsRef.current = [ethCoin];
                }
                const fromOutput = preConfirmation.resolvedOutputs.find(
                  (output) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (output.output as any).assetId === fromToken.assetID &&
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (output.output as any).to === wallet.address.toB256()
                );
                if (fromOutput) {
                  const fromCoin = {
                    id: fromOutput.utxoId,
                    assetId: fromOutput.output.assetId,
                    amount: fromOutput.output.amount,
                    owner: wallet.address,
                    blockCreated: bn(0),
                    txCreatedIdx: bn(0),
                  };
                  if (fromToken.symbol === "ETH") ethCoinsRef.current = [fromCoin];
                  if (fromToken.symbol === "BTC") btcCoinsRef.current = [fromCoin];
                  if (fromToken.symbol === "USDC") usdcCoinsRef.current = [fromCoin];
                  if (fromToken.symbol === "FUEL") fuelCoinsRef.current = [fromCoin];
                }
              }
        logTime("pre_confirmation_end");
        return tx;
      })(),
      {
        loading: "Swapping tokens...",
        success: (tx) => {
          logTime("send_transaction_success");
          return (
            <span>
              Swap successful!
              <br />
              <a
                href={`https://app-testnet.fuel.network/tx/${tx.id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "underline" }}
              >
                {tx.id.substring(0, 8)}...{tx.id.substring(tx.id.length - 8)}
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
    logTime("swap_completed", `Transaction ID: ${tx.id}`);
    console.log("Pre confirmation:", tx);

    return tx;
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
