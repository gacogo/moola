// @ts-check

import { Far } from '@endo/far';
import { AmountMath, AssetKind } from '@agoric/ertp/src/amountMath.js';
import '@agoric/zoe/exported.js';
import { makeTracer } from './debug.js';

const trace = makeTracer('Moola', true);
/**
 * Start a contract that
 *   - creates a new moola asset
 *   - handles offers to mint moola
 *
 * @param {ZCF} zcf
 */
const start = async zcf => {
  trace('start minting contract for moola');

  
  const moolaMint = await zcf.makeZCFMint('Moola', AssetKind.NAT, harden({decimalPlaces: 6}));
  
  const { brand: moolaBrand, issuer } =
    moolaMint.getIssuerRecord();


  const proposalShape = harden({
    want: { Tokens: null },
  });


  // const {zcfSeat: moolaSeat}  = zcf.makeEmptySeatKit();
  /** @type {OfferHandler} */
  const mintMoolaHandler = clientSeat => {
    trace('invitation redeemaned? deex\n');
     
    const { want } = clientSeat.getProposal();
    
    trace('This is what we got proposal', want);
    const requestedAmount = want.Tokens.value;
    trace('This is the requested amount', requestedAmount);
    // note we are minting the amount requested by the user
    assert(
      AmountMath.isGTE(requestedAmount, AmountMath.make(moolaBrand, 0n)),
      'requested amount must be greater than 0',
    );

    trace('This is the requested amount dikis', requestedAmount); 
    const wantedMint  = AmountMath.make(moolaBrand, requestedAmount);
    console.warn('This is the wanted mint', {wantedMint});
   
    // moolaMint.mintGains(want, moolaSeat);

    const newMint = moolaMint.mintGains(harden({Tokens: wantedMint}), clientSeat);
    
    // clientSeat.incrementBy(moolaSeat.decrementBy(want));
    // zcf.reallocate(moolaSeat, clientSeat);
    console.warn('This is the new mint', newMint);
    clientSeat.exit(true);
    // moolaSeat.exit();
    return `Here is your ${requestedAmount.value} Moolacicadas`;
  };
  const mintMoolaInvitation = () =>
    zcf.makeInvitation(
      mintMoolaHandler,
      'mint yourself moola',
      undefined,
      proposalShape,
    );
  const publicFacet = Far('Moola public facet', {
    getIssuer: () => issuer, // for purses and transfers
    mintMoolaInvitation,
  });

  return harden({ publicFacet });
};

harden(start);

export { start };