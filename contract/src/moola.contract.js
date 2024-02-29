// @ts-check

import { Far } from '@endo/far';
import { AssetKind } from '@agoric/ertp/src/amountMath.js';
// import { AmountShape } from '@agoric/ertp/src/typeGuards.js';
import '@agoric/zoe/exported.js';
import { M } from '@endo/patterns';
import { makeTracer } from './debug.js';

const trace = makeTracer('Moola', 'verbose');
/*
 * @param {ZCF} zcf
 */
export const start = async zcf => {
  trace('start minting contract for moola');

  const moolaMint = await zcf.makeZCFMint('Moola', AssetKind.NAT, harden({decimalPlaces: 6}));

  const { issuer: moolaIssuer } = moolaMint.getIssuerRecord();


  const proposalShape = harden({
    // Shoiuld we have the keyword Record here for the tokens?
    // I suppose keyword record is used for namespace purposes?
    // Suppose we have many psuedonyms each identifying a particular mint request?
    want: { Tokens: M.any }, 
    exit: M.any(),
  });

 
  /** @type {OfferHandler} */
  const mintMoolaHandler = clientSeat => {
    trace('invitation redeemed?\n');

    const proposal = clientSeat.getProposal();

    trace('This is the proposal deex', proposal);
     
    const { want } = proposal;
    
    const requestedAmount = want.value;
    trace('This is the requested amount', requestedAmount);
    
    trace('This is the requested amount dikis', requestedAmount); 
   
    const newMint = moolaMint.mintGains(want, clientSeat);
    
    
    
    console.warn('This is the new mint', newMint);
    clientSeat.exit();
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
    getIssuer: () => moolaIssuer, // for purses and transfers
    mintMoolaInvitation,
  });

  return harden({ publicFacet });
};

harden(start);