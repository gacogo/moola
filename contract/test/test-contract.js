/**
 * @file Test  moola contract.
 */
// @ts-check

/* eslint-disable import/order -- https://github.com/endojs/endo/issues/1235 */
import { test as anyTest } from './prepare-test-env-ava.js';
import { createRequire } from 'module';

import {makeZoeKitForTest } from '@agoric/zoe/tools/setup-zoe.js';
import { E, } from '@endo/far';

import { AmountMath, makeIssuerKit } from '@agoric/ertp';
import { makeNodeBundleCache } from '@endo/bundle-source/cache.js';

/** @typedef {typeof import('../src/moola.contract.js').start} MoolaContractFn */

const myRequire = createRequire(import.meta.url);
const contractPath = myRequire.resolve(`../src/moola.contract.js`);

/** @type {import('ava').TestFn<Awaited<ReturnType<makeTestContext>>>} */
const test = anyTest;

const makeTestContext = async _t => {
  const { zoeService: zoe, feeMintAccess } = makeZoeKitForTest();

  const bundleCache = await makeNodeBundleCache('bundles/', {}, s => import(s));
  const bundle = await bundleCache.load(contractPath, 'moolaContract');

  return { zoe, bundle, bundleCache, feeMintAccess };
};

test.before(async t => (t.context = await makeTestContext(t)));

test('Install the contract', async t => {
  const { zoe, bundle } = t.context;

  const installation = await E(zoe).install(bundle);
  t.log(installation);
  t.is(typeof installation, 'object');
});

test('Start the contract', async t => {
  const { zoe, bundle } = t.context;

  const money = makeIssuerKit('Moola');
  const issuers = { Price: money.issuer };
  const terms = { tradePrice: AmountMath.make(money.brand, 5n) };
  t.log('terms:', terms);

  /** @type {ERef<Installation<MoolaContractFn>>} */
  const installation = E(zoe).install(bundle);
  const { instance } = await E(zoe).startInstance(installation, issuers, terms);
  t.log(instance);
  t.is(typeof instance, 'object');
});
