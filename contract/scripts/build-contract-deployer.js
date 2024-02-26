/**
 * @file Permission Contract Deployment builder
 *
 * Creates files for starting an instance of the contract:
 * * contract source and instantiation proposal bundles to be published via
 *   `agd tx swingset install-bundle`
 * Usage:
 *   agoric run build-contract-deployer.js
 */

import { makeHelpers } from '@agoric/deploy-script-support';
import { getManifestForMoola } from '../src/moola.proposal.js';

/** @type {import('@agoric/deploy-script-support/src/externalTypes.js').ProposalBuilder} */
export const moolaProposalBuilder = async ({ publishRef, install }) => {
  return harden({
    sourceSpec: '../src/moola.proposal.js',
    getManifestCall: [
      getManifestForMoola.name,
      {
        moolaRef: publishRef(
          install(
            '../src/moola.contract.js',
            '../bundles/bundle-moola-cicada.js',
            {
              persist: true,
            },
          ),
        ),
      },
    ],
  });
};

/** @type {DeployScriptFunction} */
export default async (homeP, endowments) => {
  const { writeCoreProposal } = await makeHelpers(homeP, endowments);
  await writeCoreProposal('start-moola-cicada', moolaProposalBuilder);
};
