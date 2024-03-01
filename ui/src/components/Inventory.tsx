import { stringifyAmountValue } from '@agoric/ui-components';

type InventoryProps = {
  address: string;
  istPurse: Purse;
  moolaPurse: Purse;
};

export const Inventory = ({
  address,
  istPurse,
  moolaPurse,
}: InventoryProps) => {
  return (
    <div className="card">
      <h3>My Wallet</h3>
      <div>
        <div>
          <small>
            <code>{address}</code>
          </small>
        </div>

        <div style={{ textAlign: 'left' }}>
          <div>
            <b>IST: </b>
            {stringifyAmountValue(
              istPurse.currentAmount,
              istPurse.displayInfo.assetKind,
              istPurse.displayInfo.decimalPlaces,
            )}
          </div>
          <div>
            <b>Moola:</b>
            {moolaPurse ? (
              <div style={{ marginTop: 0, textAlign: 'left' }}>
                {stringifyAmountValue(moolaPurse.currentAmount.value, 'nat', 6)}
              </div>
            ) : (
              stringifyAmountValue(0n, 'nat', 6)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
