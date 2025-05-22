import ETHIcon from '../assets/eth.svg';
import FUELIcon from '../assets/fuelsymbol.svg';
// import BTCIcon from '../assets/solvBTC.webp';
import USDCIcon from '../assets/usdc.svg';

export const BASE_URL = "https://fuelstation-mainnet.xyz";
export const FUEL_PROVIDER_URL = "https://testnet.fuel.network/v1/graphql";
export const BASE_ASSET_ID = "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07";

export interface TokenData {
  name: string;
  symbol: string;
  icon: string;
  balance: string;
  usdValue: string;
  iconBg: string;
  assetID: string;
  decimals: number;
}

export const AVAILABLE_TOKENS: TokenData[] = [
  {
    name: "Ethereum",
    symbol: "ETH",
    icon: ETHIcon,
    balance: "0.476402",
    assetID: "0xd5c117a69f81ca3ff17475cca861a8b823e82de7a43f38b7247e7b941aaee23a",
    usdValue: "1,482.29",
    iconBg: "",
    decimals: 9,
  },
  {
    name: "USDC",
    symbol: "USDC",
    icon: USDCIcon,
    balance: "1,234.56",
    assetID: "0x93d83b17dc254399548ec2f7654b332de629688fb70ae5a5030b6212dd102e10",
    usdValue: "1,234.56",
    iconBg: "",
    decimals: 9,
  },
  {
    name: "Fuel",
    symbol: "FUEL",
    icon: FUELIcon,
    balance: "1,234.56",
    assetID: "0x8f8234a3c5908fcb6086d19135b35566093f765b7de73efcb0a3d0b037be09cc",
    usdValue: "1,234.56",
    iconBg: "",
    decimals: 9,
  },
  // {
  //   name: "Bitcoin",
  //   symbol: "BTC",
  //   icon: BTCIcon,
  //   balance: "2,345.67",
  //   assetID: "0xaa3976aea23b93e788493f64aa96f3743c4e13e33a996cf21d8ece952c25ee17",
  //   usdValue: "2,345.67",
  //   iconBg: "",
  //   decimals: 9,
  // },
];
export const BASE_ETH_TOKEN = {
  name: "Ethereum",
  symbol: "BASE_ETH",
  icon: ETHIcon,
  balance: "0.476402",
  assetID: BASE_ASSET_ID,
  usdValue: "1,482.29",
  iconBg: "",
  decimals: 9,
}

export const ETH_MINT_THRESHOLD = 100000000; 