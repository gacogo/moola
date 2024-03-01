import { useEffect } from 'react';

import './App.css';
import {
  makeAgoricChainStorageWatcher,
  AgoricChainStoragePathKind as Kind,
} from '@agoric/rpc';
import { create } from 'zustand';
import {
  makeAgoricWalletConnection,
  suggestChain,
} from '@agoric/web-components';
import { subscribeLatest } from '@agoric/notifier';
import { Logos } from './components/Logos';
import { Inventory } from './components/Inventory';
import Mint from './components/Mint';

type Wallet = Awaited<ReturnType<typeof makeAgoricWalletConnection>>;

const ENDPOINTS = {
  RPC: 'http://localhost:26657',
  API: 'http://localhost:1317',
};

const watcher = makeAgoricChainStorageWatcher(ENDPOINTS.API, 'agoriclocal');

interface AppState {
  wallet?: Wallet;
  offerUpInstance?: unknown;
  brands?: Array<[string, unknown]>;
  purses?: Array<Purse>;
}

const useAppStore = create<AppState>(() => ({}));

const setup = async () => {
  watcher.watchLatest<Array<[string, unknown]>>(
    [Kind.Data, 'published.agoricNames.instance'],
    instances => {
      console.log('got instances', instances);
      useAppStore.setState({
        offerUpInstance: instances
          .find(([name]) => name === 'MoolaCicada')!
          .at(1),
      });
    },
  );

  watcher.watchLatest<Array<[string, unknown]>>(
    [Kind.Data, 'published.agoricNames.brand'],
    brands => {
      console.log('Got brands', brands);
      useAppStore.setState({
        brands,
      });
    },
  );
};

const connectWallet = async () => {
  await suggestChain('https://local.agoric.net/network-config');
  const wallet = await makeAgoricWalletConnection(watcher, ENDPOINTS.RPC);
  useAppStore.setState({ wallet });
  const { pursesNotifier } = wallet;
  for await (const purses of subscribeLatest(pursesNotifier)) {
    console.log('got purses', purses);
    useAppStore.setState({ purses });
  }
};

const makeOffer = (wantValue: bigint) => {
  const { wallet, offerUpInstance, brands } = useAppStore.getState();
  if (!offerUpInstance) throw Error('no contract instance');
  const moolabrand = brands?.find(([name]) => name === 'Moola')?.at(1);
  if (!moolabrand) throw Error('no moola brand');
  const want = harden({ Moola: { brand: moolabrand, value: wantValue } });

  wallet?.makeOffer(
    {
      source: 'contract',
      instance: offerUpInstance,
      publicInvitationMaker: 'mintMoolaInvitation',
      description: 'mint yourself moola',
    },
    { want },
    undefined,
    (update: { status: string; data?: unknown }) => {
      if (update.status === 'error') {
        alert(`Offer error: ${update.data}`);
      }
      if (update.status === 'accepted') {
        alert('Offer accepted');
      }
      if (update.status === 'refunded') {
        alert('Offer rejected');
      }
    },
  );
};

function App() {
  useEffect(() => {
    setup();
  }, []);

  const { wallet, purses } = useAppStore(({ wallet, purses }) => ({
    wallet,
    purses,
  }));
  const istPurse = purses?.find(p => p.brandPetname === 'IST');
  const moolaPurse = purses?.find(p => p.brandPetname === 'Moola');

  const tryConnectWallet = () => {
    connectWallet().catch(err => {
      switch (err.message) {
        case 'KEPLR_CONNECTION_ERROR_NO_SMART_WALLET':
          alert(
            'no smart wallet at that address; try: yarn docker:make print-key',
          );
          break;
        default:
          alert(err.message);
      }
    });
  };

  return (
    <>
      <Logos />
      <h1>Items Listed on Offer Up</h1>

      <div className="card">
        <Mint makeOffer={makeOffer} walletConnected={!!wallet} />
        <hr />
        {wallet && istPurse ? (
          <Inventory
            address={wallet.address}
            istPurse={istPurse}
            moolaPurse={moolaPurse as Purse}
          />
        ) : (
          <button onClick={tryConnectWallet}>Connect Wallet</button>
        )}
      </div>
    </>
  );
}

export default App;
