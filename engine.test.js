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

// Teste de CPM: Deve refletir apenas ciclos reais (picksPerPallet + slip + pallet)
// Para o cenário netPositiveScenario:
// productionBpm: 30, layers: 1, boxesPerLayer: 2, picksPerLayer: 1 -> totalBoxes: 2.
// time per pallet = (2 / 30) * 60 = 4 seconds.
// totalCycles = picks(1) + slip(1) + pallet(1) = 3 cycles.
// CPM = 3 cycles / (4/60) min = 3 / 0.0666 = 45 CPM.
assert.strictEqual(netPositiveScenario.cyclesNumberPerMinute, 45);

// Teste de viabilidade de limpeza de Slip Sheet
// Cenário: 10 camadas, 2 slip sheets. Limpeza em 5 camadas.
var slipClearanceScenario = computeCycleTimer({
  productionBpm: 60,
  boxesPerLayer: 1,
  layersPerPallet: 10,
  picksPerLayer: 1,
  slipSheetBottom: 1,
  slipSheetBetweenLayers: 1,
  palletPick: 0,
  cycleTimePickS: 0.5,
  cycleTimeSlipSheetS: 1,
  cycleTimePalletS: 1
});
// productionBpm 60 -> 1 box/s.
// cycleTimePick 0.5s -> robot removal 2 box/s.
// net removal = 1 box/s.
// slip accumulation = 1s * 1 box/s = 1 box.
// cycles to empty = 1 box / (1 box/s) / 0.5s = 2 cycles.
// picksBetweenSlips = 1 picksPerLayer * (10 layers / 2 slips) = 5 picks.
// 2 <= 5 -> true.
assert.strictEqual(slipClearanceScenario.canClearAccumulation.slip, true);

// Cenário de falha no Slip: apenas 1 pick entre slips
var slipFailScenario = computeCycleTimer({
    productionBpm: 60,
    boxesPerLayer: 1,
    layersPerPallet: 10,
    picksPerLayer: 1,
    slipSheetBottom: 5,
    slipSheetBetweenLayers: 5,
    palletPick: 0,
    cycleTimePickS: 0.5,
    cycleTimeSlipSheetS: 4, // 4s de slip gera 4 caixas acúmulo
    cycleTimePalletS: 1
  });
  // net removal = 1 box/s.
  // slip accumulation = 4s * 1 box/s = 4 boxes.
  // cycles to empty = 4 / 1 / 0.5 = 8 cycles.
  // layersPerSlip = 10 / 10 = 1 layer.
  // picksBetweenSlips = 1 * 1 = 1 pick.
  // 8 <= 1 -> false.
  assert.strictEqual(slipFailScenario.canClearAccumulation.slip, false);

console.log("engine.test.js OK");
