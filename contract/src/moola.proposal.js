// @ts-check
// import { AmountMath } from '@agoric/ertp';
import { E } from '@endo/far';
import { makeMarshal } from '@endo/marshal';
// import { M } from '@endo/patterns';

console.warn('start proposal module evaluating');
export const contractName = 'moolaCicada';

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
  console.error(
    'we got publishBrandInfo: id:',
    id,
    'displayInfo:',
    displayInfo,
    'allegedName:',
    allegedName,
  );

  const node = makeBoardAuxNode(chainStorage, id);
  const moolaName = marshalData.toCapData(harden({ allegedName }));
  const aux = marshalData.toCapData(harden({ moolaName, displayInfo }));
  await E(node).setValue(JSON.stringify(aux));
  await E(node).setValue(JSON.stringify(moolaName));
};
console.warn('finished publishing brand info');

/**
 * Core eval script to start contract
 *
 * @param {BootstrapPowers} permittedPowers
 */
export const startMoolaCicadaContract = async permittedPowers => {
  const {
    consume: { board, chainStorage, startUpgradable, zoe },
    brand: {
      // @ts-expect-error dynamic extension to promise space
      produce: { Moola: produceMoolaBrand },
    },
    issuer: {
      produce: { Moola: produceMoolaIssuer },
    },
    installation: {
      consume: { moolaCicada: moolaInstallationP },
    },
    instance: {
      produce: { moolaCicada: produceMoolaInstance },
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

  // I think I should get Keyword Record from instance instead of trying to fix  it here. Why do we even do this?
  console.warn('terms are deex:', await E(zoe).getTerms(instance));
  const {
    brands: { Moola: brand },
    issuers: { Moola: issuer },
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
    installation: { consume: { moolaCicada: true } },
    issuer: { produce: {Moola: true } },
    brand: { produce: { Moola: true } },
    instance: { produce: { moolaCicada: true } },
  },
};
harden(moolaManifest);

export const getManifestForMoola = ({ restoreRef }, { moolaRef }) => {
  return harden({
    manifest: moolaManifest,
    installations: {
      moolaCicada: restoreRef(moolaRef),
    },
  });
};
