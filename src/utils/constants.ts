import ETHIcon from '../assets/eth.svg';
import FUELIcon from '../assets/fuelsymbol.svg';
import BTCIcon from '../assets/solvBTC.webp';
import USDCIcon from '../assets/usdc.svg';

export const BASE_URL = "https://fuelstation-mainnet.xyz";
export const BASE_ASSET_ID = "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07";

export interface TokenData {
  name: string;
  symbol: string;
  icon: string;
  balance: string;
  usdValue: string;
  iconBg: string;
  assetID: string;
}

export const AVAILABLE_TOKENS: TokenData[] = [
  {
    name: "Ethereum",
    symbol: "ETH",
    icon: ETHIcon,
    balance: "0.476402",
    assetID: "0xcb6e26678af543595ff091dccb3697a8216afaf26e802b5debdac5a7b7dd9bd3",
    usdValue: "1,482.29",
    iconBg: "",
  },
  {
    name: "USDC",
    symbol: "USDC",
    icon: USDCIcon,
    balance: "1,234.56",
    assetID: "0x0576490be2a4dc5311d2b2f9dd3676a0cea6d617ded77243aab11a6e21ff5265",
    usdValue: "1,234.56",
    iconBg: "",
  },
  {
    name: "Fuel",
    symbol: "FUEL",
    icon: FUELIcon,
    balance: "1,234.56",
    assetID: "0x9a58a32da507e0350c80a527e3a466ec5746f6b6c335c37c7f6632605252f422",
    usdValue: "1,234.56",
    iconBg: "",
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    icon: BTCIcon,
    balance: "2,345.67",
    assetID: "0xb2cc1b82b0d1f775c303a135e65ab11de7e7f656c522e09287e0591d84eaae50",
    usdValue: "2,345.67",
    iconBg: "",
  },
];
export const BASE_ETH_TOKEN = {
  name: "Ethereum",
  symbol: "BASE_ETH",
  icon: ETHIcon,
  balance: "0.476402",
  assetID: BASE_ASSET_ID,
  usdValue: "1,482.29",
  iconBg: "",
}

export const ETH_MINT_THRESHOLD = 100000000; 