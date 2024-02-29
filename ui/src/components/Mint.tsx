
type MintProps = {
  makeOffer: (wantValue: bigint) => void;
  walletConnected: boolean;
};

const wantValue = 1000000000n;

// TODO: IST displayInfo is available in vbankAsset or boardAux
const Mint = ({ makeOffer, walletConnected }: MintProps) => {
  return (
    <>
      <div className="trade">
        <h3>You're mintint 100 Moola </h3>
      </div>
      <div>
        {walletConnected && (
          <button onClick={() => makeOffer(wantValue)}>Make an Offer</button>
        )}
      </div>
    </>
  );
};

export default Mint;