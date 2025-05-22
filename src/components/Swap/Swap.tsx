import React from 'react';
import SwapHeader from './SwapHeader';
import SwapForm from './SwapForm';

const Swap: React.FC = () => (
  <div className="flex flex-col items-center">
    <SwapHeader />
    <SwapForm />
  </div>
);

export default Swap; 