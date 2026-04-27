"use strict";

var assert = require("assert");
var engine = require("./engine.js");
var computeCyclesToEmptyWithNetRemoval = engine.computeCyclesToEmptyWithNetRemoval;
var computeCycleTimer = engine.computeCycleTimer;

assert.strictEqual(computeCyclesToEmptyWithNetRemoval(10, 0.5, 1), 20);

assert.strictEqual(computeCyclesToEmptyWithNetRemoval(10, 0, 1), null);

assert.strictEqual(computeCyclesToEmptyWithNetRemoval(10, -0.1, 1), null);

assert.strictEqual(computeCyclesToEmptyWithNetRemoval(0, -5, 1), 0);

var netZeroScenario = computeCycleTimer({
  productionBpm: 60,
  boxesPerLayer: 1,
  layersPerPallet: 1,
  picksPerLayer: 1,
  slipSheetBottom: 1,
  slipSheetBetweenLayers: 0,
  palletPick: 1,
  cycleTimePickS: 1,
  cycleTimeSlipSheetS: 1,
  cycleTimePalletS: 1
});
assert.strictEqual(netZeroScenario.netRemovalBoxesPerSecond, 0);
assert.ok(netZeroScenario.productNumberInSlipAccumulation > 0);
assert.strictEqual(netZeroScenario.cyclesToEmptySlipAccumulation, null);

var netPositiveScenario = computeCycleTimer({
  productionBpm: 30,
  boxesPerLayer: 2,
  layersPerPallet: 1,
  picksPerLayer: 1,
  slipSheetBottom: 1,
  slipSheetBetweenLayers: 0,
  palletPick: 1,
  cycleTimePickS: 2,
  cycleTimeSlipSheetS: 2,
  cycleTimePalletS: 1
});
assert.ok(netPositiveScenario.netRemovalBoxesPerSecond > 0);
assert.ok(
  typeof netPositiveScenario.cyclesToEmptySlipAccumulation === "number" &&
    isFinite(netPositiveScenario.cyclesToEmptySlipAccumulation)
);

var transitionTimeScenario = computeCycleTimer({
  productionBpm: 30,
  boxesPerLayer: 2,
  layersPerPallet: 1,
  picksPerLayer: 1,
  slipSheetBottom: 1,
  slipSheetBetweenLayers: 0,
  palletPick: 0,
  cycleTimePickS: 2,
  cycleTimeSlipSheetS: 2,
  cycleTimePalletS: 5,
  palletTransitionTimeS: 12
});
assert.strictEqual(transitionTimeScenario.effectivePalletTransitionS, 12);
assert.strictEqual(transitionTimeScenario.accumulationTimeToPalletExchangeS, 16); // cycleTimePickS (2) + palletTransitionTimeS (12) + slipSheetBottom(1) * cycleTimeSlipSheetS(2) = 16

var palletPickScenario = computeCycleTimer({
  productionBpm: 30,
  boxesPerLayer: 2,
  layersPerPallet: 1,
  picksPerLayer: 1,
  slipSheetBottom: 1,
  slipSheetBetweenLayers: 0,
  palletPick: 2,
  cycleTimePickS: 2,
  cycleTimeSlipSheetS: 2,
  cycleTimePalletS: 5,
  palletTransitionTimeS: 12
});
assert.strictEqual(palletPickScenario.effectivePalletTransitionS, 10); // palletPick (2) * cycleTimePalletS (5) = 10
assert.strictEqual(palletPickScenario.accumulationTimeToPalletExchangeS, 14); // cycleTimePickS (2) + effectivePalletTransitionS (10) + slipSheetBottom(1) * cycleTimeSlipSheetS(2) = 14

console.log("engine.test.js OK");
