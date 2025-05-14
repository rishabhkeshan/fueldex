import FuelLogo from '../../assets/Sway.svg';
import WalletConnect from './WalletConnect';

const Header = () => {
  return (
    <header className="relative z-10 py-4 sm:px-12">
      <div className="flex flex-row items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <img src={FuelLogo} alt="FUEL Logo" className="w-auto h-9" />
        </div>
        <WalletConnect />
      </div>
    </header>
  );
};

export default Header;
