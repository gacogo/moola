import { stringifyAmountValue } from '@agoric/ui-components';

type InventoryProps = {
  address: string;
  moolaPurse: Purse;
};

const Inventory = ({ address, moolaPurse }: InventoryProps) => (
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
          <b>Moola: </b>
           mooolalalalalal
          {stringifyAmountValue(
            moolaPurse.currentAmount.value,
            moolaPurse.displayInfo.assetKind,
          )}
        </div>
        <div>
          <b>Items:</b>
          {moolaPurse ? (
            <div>{String(moolaPurse.currentAmount.value)}</div>
          ) : (
            // <ul style={{ marginTop: 0, textAlign: 'left' }}>
            //   {(moolaPurse.currentAmount.value as BigInt).payload.map(
            //     ([name, number]) => (
            //       <li key={name}>
            //         {String(number)} {name}
            //       </li>
            //     ),
            //   )}
            // </ul>
            <div>
              <div>None</div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export { Inventory };
