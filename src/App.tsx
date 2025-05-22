import Header from './components/Header';
import { Swap } from './components/Swap';

function App() {

  return (
    <div className="flex flex-col min-h-screen relative text-dex-dark">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-[#FCF8F2]" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[#FCF8F2] sm:bg-[#EAEBDB]" />
      <Header />
      <main className="relative flex-1 flex flex-col min-h-0 sm:justify-center sm:-mt-28 z-0">
        <Swap/>
      </main>
    </div>
  );
}

export default App;