// @ts-check

import { Far } from '@endo/far';
import { AssetKind } from '@agoric/ertp/src/amountMath.js';
import { AmountShape } from '@agoric/ertp/src/typeGuards.js';
import '@agoric/zoe/exported.js';
import { M } from '@endo/patterns';
import { makeTracer } from './debug.js';

/**
 * In addition to the standard `issuers` and `brands` terms,
 * this contract is parameterized by the `Moola` Keyword.
 *
 * @typedef {{
 *   Moola: Amount;
 * }}moolaTerms
 **/

export const meta = {
  customTermsShape: M.splitRecord({ Moola: AmountShape }),
};
// compatibility with an earlier contract metadata API
export const customTermsShape = meta.customTermsShape;

const trace = makeTracer('Moola', 'verbose');

/**
 * @param {ZCF<moolaTerms>} zcf
 */
export const start = async zcf => {
  trace('start minting contract for moola');

  const moolaMint = await zcf.makeZCFMint(
    'Moola',
    AssetKind.NAT,
    harden({ decimalPlaces: 6 }),
  );

  const { issuer: moolaIssuer, brand: moolabrand } =
    moolaMint.getIssuerRecord();

  const proposalShape = harden({
    want: { Moola: { brand: moolabrand, value: M.bigint() } },
    give: M.any(),
    exit: M.any(),
  });

  /** @type {OfferHandler} */
  const mintMoolaHandler = clientSeat => {
    trace('invitation redeemed');
    const proposal = clientSeat.getProposal();

    trace('This is the proposal: ', proposal);

    const { want } = proposal;
    const newMint = moolaMint.mintGains(want, clientSeat);
    console.warn('This is the new mint', newMint);
    clientSeat.exit();
    return `Here is your Moolacicadas`;
  };
  const mintMoolaInvitation = () =>
    zcf.makeInvitation(
      mintMoolaHandler,
      'mint yourself moola',
      undefined,
      proposalShape,
    );

  const publicFacet = Far('Moola public facet', {
    getIssuer: () => moolaIssuer, // for purses and transfers
    mintMoolaInvitation,
  });

  return harden({ publicFacet });
};

harden(start);
