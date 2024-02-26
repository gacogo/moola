// @ts-check
import { E } from '@endo/far';
import { makeMarshal } from '@endo/marshal';

console.warn('start proposal module evaluating');
export const contractName = 'MoolaCicada';

const { Fail } = assert;

// vstorage paths under published.*
const BOARD_AUX = 'boardAux';
const MOOLA_BRAND = 'Moola';
const marshalData = makeMarshal(_val => Fail`data only`);
/**
 * Make a storage node for auxilliary data for a value on the board.
 *
 * @param {ERef<StorageNode>} chainStorage
 * @param {string} boardId
 */
const makeBoardAuxNode = async (chainStorage, boardId) => {
  const boardAux = E(chainStorage).makeChildNode(BOARD_AUX);
  return E(boardAux).makeChildNode(boardId);
};

const publishBrandInfo = async (chainStorage, board, brand) => {
  const [id, displayInfo, allegedName] = await Promise.all([
    E(board).getId(brand),
    E(brand).getDisplayInfo(),
    E(brand).getAllegedName(),
  ]);
  
  const node = makeBoardAuxNode(chainStorage, id);
  // const moolaName = marshalData.toCapData(harden({ allegedName }));
  const aux = marshalData.toCapData(harden({ allegedName, displayInfo }));
  await E(node).setValue(JSON.stringify(aux));
};
console.warn('finished publishing brand info');
/*
 * Core eval script to start contract
 *
 * @param {BootstrapPowers} permittedPowers
 */
export const startMoolaCicadaContract = async permittedPowers => {
  const {
    consume: { board, chainStorage, startUpgradable, zoe },
    brand: {
      // @ts-expect-error dynamic extension to promise space
      produce: { [MOOLA_BRAND]: produceMoolaBrand },
    },
    issuer: {
      // @ts-expect-error dynamic extension to promise space
      produce: { [MOOLA_BRAND]: produceMoolaIssuer },
    },
    installation: {
      consume: { [contractName]: moolaInstallationP },
    },
    instance: {
      // @ts-expect-error dynamic extension to promise space
      produce: { [contractName]: produceMoolaInstance },
    },
  } = permittedPowers;

  const installation = await moolaInstallationP;

  

  const terms = harden({});
  const issuerKeywordRecord = harden({});
  const { instance } = await E(startUpgradable)({
    installation,
    issuerKeywordRecord,
    label: [contractName],
    terms,
  });


  const {
    brands: { [MOOLA_BRAND]: brand },
    issuers: { [MOOLA_BRAND]: issuer },
  } = await E(zoe).getTerms(instance);

  console.error('CoreEval script: share via agoricNames:', brand);
  console.error(
    'CoreEval script: started contract deex',
    issuer,
    brand,
    instance,
  );

  produceMoolaInstance.reset();
  produceMoolaInstance.resolve(instance);
  produceMoolaBrand.reset();
  produceMoolaBrand.resolve(brand);
  produceMoolaIssuer.reset();
  produceMoolaIssuer.resolve(issuer);
  await publishBrandInfo(chainStorage, board, brand);
  console.log('Moola dapp (re)started  with brand info published.');
};

/** @type { import("@agoric/vats/src/core/lib-boot").BootstrapManifest } */
const moolaManifest = {
  [startMoolaCicadaContract.name]: {
    consume: {
      agoricNames: true,
      board: true, // to publish boardAux info for moola brand
      chainStorage: true, // to publish boardAux info for moola brand
      startUpgradable: true, // to start contract and save adminFacet
      zoe: true, // to get contract terms, including issuer/brand
    },
    installation: { consume: { [contractName]: true } },
    issuer: { produce: { [MOOLA_BRAND]: true } },
    brand: { produce: { [MOOLA_BRAND]: true } },
    instance: { produce: { [contractName]: true } },
  },
};
harden(moolaManifest);

export const getManifestForMoola = ({ restoreRef }, { moolaRef }) => {
  return harden({
    manifest: moolaManifest,
    installations: {
      [contractName]: restoreRef(moolaRef),
    },
  });
};
