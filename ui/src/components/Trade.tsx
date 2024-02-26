import { FormEvent, useState } from 'react';
import { stringifyAmountValue } from '@agoric/ui-components';
import scrollIcon from '../assets/scroll.png';
import istIcon from '../assets/IST.svg';
import mapIcon from '../assets/map.png';
import potionIcon from '../assets/potionBlue.png';




const Moola = ({ value }: { value: number | string }) => (
  <div className="item-col">
    <input value={value} className={`trade-input`} />
  </div>
);

type MintProps = {
  makeOffer: (wantValue: bigint) => void;
  moolaPurse: Purse;
  walletConnected: boolean;
};

// TODO: IST displayInfo is available in vbankAsset or boardAux
const Trade = ({ makeOffer, moolaPurse, walletConnected }: MintProps) => {
  const want = '1000000000';

  console.log('moolaPurssssse', moolaPurse);
  
  return (
    <>
      <div className="trade">
        <h3>Want: You're minting 1000 Moola</h3>
        <div className="row-center">
          <Moola value={want} />
        </div>
      </div>
      <div>
        {walletConnected && (
          <button onClick={() => makeOffer(want)}>Make an Offer</button>
        )}
      </div>
    </>
  );
}
export { Trade };
