// Motor matemático do Cycle Timer (planilha simplificada)
// Função pura, sem acesso a DOM ou storage.

/**
 * Divide com segurança, retornando null se o divisor for inválido
 * ou se qualquer operando não for um número finito.
 */
function safeDivide(numerator, denominator) {
  if (
    numerator === null ||
    numerator === undefined ||
    denominator === null ||
    denominator === undefined
  ) {
    return null;
  }

  if (typeof numerator !== "number" || typeof denominator !== "number") {
    return null;
  }

  if (!isFinite(numerator) || !isFinite(denominator) || denominator === 0) {
    return null;
  }

  return numerator / denominator;
}

function safeMultiply(a, b) {
  if (a === null || a === undefined || b === null || b === undefined) {
    return null;
  }
  if (typeof a !== "number" || typeof b !== "number") {
    return null;
  }
  if (!isFinite(a) || !isFinite(b)) {
    return null;
  }
  return a * b;
}

function safeAdd(a, b) {
  if (a === null || a === undefined || b === null || b === undefined) {
    return null;
  }
  if (typeof a !== "number" || typeof b !== "number") {
    return null;
  }
  if (!isFinite(a) || !isFinite(b)) {
    return null;
  }
  return a + b;
}

function safeSubtract(a, b) {
  if (a === null || a === undefined || b === null || b === undefined) {
    return null;
  }
  if (typeof a !== "number" || typeof b !== "number") {
    return null;
  }
  if (!isFinite(a) || !isFinite(b)) {
    return null;
  }
  return a - b;
}

/**
 * Ciclos para esvaziar acúmulo com remoção líquida (caixas/s retiradas − caixas/s entrando).
 * accumulationQty em caixas; netRemovalBoxesPerSecond = robotRemoval − incoming.
 * Se net ≤ 0 e acúmulo > 0: não há solução finita → null (UI: não atende).
 */
function computeCyclesToEmptyWithNetRemoval(
  accumulationQty,
  netRemovalBoxesPerSecond,
  cycleTimePickS
) {
  if (accumulationQty === null || accumulationQty === undefined) {
    return null;
  }
  if (typeof accumulationQty !== "number" || !isFinite(accumulationQty) || accumulationQty < 0) {
    return null;
  }
  if (accumulationQty === 0) {
    return 0;
  }
  if (netRemovalBoxesPerSecond === null || netRemovalBoxesPerSecond === undefined) {
    return null;
  }
  if (typeof netRemovalBoxesPerSecond !== "number" || !isFinite(netRemovalBoxesPerSecond)) {
    return null;
  }
  if (netRemovalBoxesPerSecond <= 0) {
    return null;
  }
  if (cycleTimePickS === null || cycleTimePickS === undefined) {
    return null;
  }
  if (typeof cycleTimePickS !== "number" || !isFinite(cycleTimePickS) || cycleTimePickS <= 0) {
    return null;
  }
  var timeToEmptyS = safeDivide(accumulationQty, netRemovalBoxesPerSecond);
  return safeDivide(timeToEmptyS, cycleTimePickS);
}

/**
 * Calcula os indicadores do Cycle Timer a partir dos inputs em segundos.
 *
 * Valores negativos são tratados como null (inválidos).
 *
 * @param {Object} input
 * @param {number} input.productionBpm
 * @param {number} input.boxesPerLayer
 * @param {number} input.layersPerPallet
 * @param {number} input.picksPerLayer
 * @param {number} input.slipSheetBottom
 * @param {number} input.slipSheetBetweenLayers
 * @param {number} input.palletPick
 * @param {number} input.cycleTimePickS
 * @param {number} input.cycleTimeSlipSheetS
 * @param {number} input.cycleTimePalletS
 * @param {number} input.palletTransitionTimeS
 *
 * @returns {Object} resultados com todos os campos calculados ou null em casos inválidos
 */
function computeCycleTimer(input) {
  function normalize(value) {
    if (typeof value !== "number" || !isFinite(value)) {
      return null;
    }
    if (value < 0) {
      return null;
    }
    return value;
  }

  var productionBpm = normalize(input.productionBpm);
  var boxesPerLayer = normalize(input.boxesPerLayer);
  var layersPerPallet = normalize(input.layersPerPallet);
  var picksPerLayer = normalize(input.picksPerLayer);
  var slipSheetBottom = normalize(input.slipSheetBottom);
  var slipSheetBetweenLayers = normalize(input.slipSheetBetweenLayers);
  var palletPick = normalize(input.palletPick);
  var cycleTimePickS = normalize(input.cycleTimePickS);
  var cycleTimeSlipSheetS = normalize(input.cycleTimeSlipSheetS);
  var cycleTimePalletS = normalize(input.cycleTimePalletS);
  var palletTransitionTimeS = normalize(input.palletTransitionTimeS) !== null ? normalize(input.palletTransitionTimeS) : 10;

  function componentTime(quantity, cycleTime) {
    if (
      quantity === null ||
      quantity === undefined ||
      cycleTime === null ||
      cycleTime === undefined
    ) {
      return null;
    }
    if (
      typeof quantity !== "number" ||
      typeof cycleTime !== "number" ||
      !isFinite(quantity) ||
      !isFinite(cycleTime)
    ) {
      return null;
    }
    // Regra física: só contribui se ambos os fatores forem > 0.
    if (quantity <= 0 || cycleTime <= 0) {
      return 0;
    }
    return quantity * cycleTime;
  }

  function componentCycles(quantity, cycleTime) {
    if (
      quantity === null ||
      quantity === undefined ||
      cycleTime === null ||
      cycleTime === undefined
    ) {
      return 0;
    }
    if (
      typeof quantity !== "number" ||
      typeof cycleTime !== "number" ||
      !isFinite(quantity) ||
      !isFinite(cycleTime)
    ) {
      return 0;
    }
    // Regra física: ciclo só existe quando quantidade e tempo são > 0.
    if (quantity <= 0 || cycleTime <= 0) {
      return 0;
    }
    return quantity;
  }

  // 1. totalBoxesOnPallet = boxesPerLayer * layersPerPallet
  var totalBoxesOnPallet = safeMultiply(boxesPerLayer, layersPerPallet);

  // 2. picksPerPallet = picksPerLayer * layersPerPallet
  var picksPerPallet = safeMultiply(picksPerLayer, layersPerPallet);

  // 3. gapBetweenBoxesS = 60 / productionBpm
  var gapBetweenBoxesS = safeDivide(60, productionBpm);

  // 4. boxesPerCycle = boxesPerLayer / picksPerLayer
  var boxesPerCycle =
    boxesPerLayer === null || picksPerLayer === null
      ? null
      : safeDivide(boxesPerLayer, picksPerLayer);

  // 5. totalCyclesPerPallet = ciclos efetivos de pick + slip sheet + pallet
  // (cada componente só entra quando quantidade > 0 e tempo > 0)
  var effectivePickCycles = componentCycles(picksPerPallet, cycleTimePickS);
  var totalSlipSheets = safeAdd(slipSheetBetweenLayers, slipSheetBottom);
  var effectiveSlipCycles = componentCycles(totalSlipSheets, cycleTimeSlipSheetS);
  var effectivePalletCycles = componentCycles(palletPick, cycleTimePalletS);
  var totalCyclesPerPallet =
    effectivePickCycles + effectiveSlipCycles + effectivePalletCycles;

  // 6. totalCycleTimePicksS = picksPerPallet * cycleTimePickS
  var totalCycleTimePicksS = componentTime(picksPerPallet, cycleTimePickS);

  // 7. totalCycleTimeSlipSheetS = (slipSheetBetweenLayers + slipSheetBottom) * cycleTimeSlipSheetS
  var totalCycleTimeSlipSheetS = componentTime(totalSlipSheets, cycleTimeSlipSheetS);

  // 8. totalCycleTimePalletsS = palletPick * cycleTimePalletS
  var totalCycleTimePalletsS = componentTime(palletPick, cycleTimePalletS);

  // 9. totalStackingTimeRobotS = totalCycleTimePicksS + totalCycleTimeSlipSheetS + totalCycleTimePalletsS
  var totalStackingTimeRobotS =
    totalCycleTimePicksS === null ||
    totalCycleTimeSlipSheetS === null ||
    totalCycleTimePalletsS === null
      ? null
      : totalCycleTimePicksS + totalCycleTimeSlipSheetS + totalCycleTimePalletsS;

  // 10. accumulationTimeToPalletExchangeS =
  //     cycleTimePickS + (cycleTimePalletS * palletPick) + (cycleTimeSlipSheetS * slipSheetBottom)
  var effectivePalletTransitionS = 0;
  if (palletPick !== null && palletPick > 0) {
    effectivePalletTransitionS = safeMultiply(cycleTimePalletS, palletPick);
  } else {
    effectivePalletTransitionS = palletTransitionTimeS;
  }

  var partPalletExchange =
    effectivePalletTransitionS === null
      ? null
      : safeAdd(cycleTimePickS, effectivePalletTransitionS);
  var accumulationTimeToPalletExchangeS =
    partPalletExchange === null
      ? null
      : safeAdd(
          partPalletExchange,
          safeMultiply(cycleTimeSlipSheetS, slipSheetBottom)
        );

  // 11. productNumberInSlipAccumulation = totalCycleTimeSlipSheetS / gapBetweenBoxesS
  var productNumberInSlipAccumulation =
    totalCycleTimeSlipSheetS === null || gapBetweenBoxesS === null
      ? null
      : safeDivide(totalCycleTimeSlipSheetS, gapBetweenBoxesS);

  // 13. productsNumberInPalletAccumulation = accumulationTimeToPalletExchangeS / gapBetweenBoxesS
  var productsNumberInPalletAccumulation =
    accumulationTimeToPalletExchangeS === null || gapBetweenBoxesS === null
      ? null
      : safeDivide(accumulationTimeToPalletExchangeS, gapBetweenBoxesS);

  // Remoção líquida na limpeza por ciclo de pick (mesma base para slip e pallet)
  var incomingBoxesPerSecond = safeDivide(productionBpm, 60);
  var robotRemovalBoxesPerSecond = safeDivide(boxesPerCycle, cycleTimePickS);
  var netRemovalBoxesPerSecond = safeSubtract(
    robotRemovalBoxesPerSecond,
    incomingBoxesPerSecond
  );

  // 12. cyclesToEmptySlipAccumulation — tempo para zerar fila / duração do ciclo de pick
  var cyclesToEmptySlipAccumulation = computeCyclesToEmptyWithNetRemoval(
    productNumberInSlipAccumulation,
    netRemovalBoxesPerSecond,
    cycleTimePickS
  );

  // 14. cyclesToEmptyPalletAccumulation
  var cyclesToEmptyPalletAccumulation = computeCyclesToEmptyWithNetRemoval(
    productsNumberInPalletAccumulation,
    netRemovalBoxesPerSecond,
    cycleTimePickS
  );

  // 15. totalTimeOfPalletStackingS = (totalBoxesOnPallet / productionBpm) * 60
  var timePerPalletMinutes =
    totalBoxesOnPallet === null
      ? null
      : safeDivide(totalBoxesOnPallet, productionBpm);
  var totalTimeOfPalletStackingS =
    timePerPalletMinutes === null ? null : safeMultiply(timePerPalletMinutes, 60);

  // 16. robotOccupancyRate = totalStackingTimeRobotS / totalTimeOfPalletStackingS
  var robotOccupancyRate =
    totalStackingTimeRobotS === null || totalTimeOfPalletStackingS === null
      ? null
      : safeDivide(totalStackingTimeRobotS, totalTimeOfPalletStackingS);

  // 17. cyclesNumberPerMinute =
  //     (totalCyclesPerPallet + cyclesToEmptySlipAccumulation + cyclesToEmptyPalletAccumulation)
  //     / (totalTimeOfPalletStackingS / 60)
  var cyclesNumerator =
    totalCyclesPerPallet === null ||
    cyclesToEmptySlipAccumulation === null ||
    cyclesToEmptyPalletAccumulation === null
      ? null
      : safeAdd(
          totalCyclesPerPallet,
          safeAdd(cyclesToEmptySlipAccumulation, cyclesToEmptyPalletAccumulation)
        );

  var palletTimeMinutes =
    totalTimeOfPalletStackingS === null
      ? null
      : safeDivide(totalTimeOfPalletStackingS, 60);

  var cyclesNumberPerMinute =
    cyclesNumerator === null || palletTimeMinutes === null
      ? null
      : safeDivide(cyclesNumerator, palletTimeMinutes);

  // 18. averageCycleTimeS = 60 / cyclesNumberPerMinute
  var averageCycleTimeS =
    cyclesNumberPerMinute === null
      ? null
      : safeDivide(60, cyclesNumberPerMinute);

  // 19. palletsPerHour = 60 / (totalBoxesOnPallet / productionBpm)
  var boxesPerPalletDiv =
    totalBoxesOnPallet === null
      ? null
      : safeDivide(totalBoxesOnPallet, productionBpm);
  var palletsPerHour =
    boxesPerPalletDiv === null ? null : safeDivide(60, boxesPerPalletDiv);

  var canClearAccumulation = null;
  if (cyclesToEmptyPalletAccumulation !== null && picksPerPallet !== null) {
    canClearAccumulation = cyclesToEmptyPalletAccumulation <= picksPerPallet;
  }

  return {
    totalBoxesOnPallet: totalBoxesOnPallet,
    picksPerPallet: picksPerPallet,
    gapBetweenBoxesS: gapBetweenBoxesS,
    boxesPerCycle: boxesPerCycle,
    totalCyclesPerPallet: totalCyclesPerPallet,
    totalCycleTimePicksS: totalCycleTimePicksS,
    totalCycleTimeSlipSheetS: totalCycleTimeSlipSheetS,
    totalCycleTimePalletsS: totalCycleTimePalletsS,
    totalStackingTimeRobotS: totalStackingTimeRobotS,
    accumulationTimeToPalletExchangeS: accumulationTimeToPalletExchangeS,
    productNumberInSlipAccumulation: productNumberInSlipAccumulation,
    cyclesToEmptySlipAccumulation: cyclesToEmptySlipAccumulation,
    productsNumberInPalletAccumulation: productsNumberInPalletAccumulation,
    cyclesToEmptyPalletAccumulation: cyclesToEmptyPalletAccumulation,
    netRemovalBoxesPerSecond: netRemovalBoxesPerSecond,
    totalTimeOfPalletStackingS: totalTimeOfPalletStackingS,
    robotOccupancyRate: robotOccupancyRate,
    cyclesNumberPerMinute: cyclesNumberPerMinute,
    averageCycleTimeS: averageCycleTimeS,
    palletsPerHour: palletsPerHour,
    effectivePalletTransitionS: effectivePalletTransitionS,
    canClearAccumulation: canClearAccumulation
  };
}

// Export opcional para ambientes de módulo (não interfere no uso via <script> simples)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    computeCycleTimer: computeCycleTimer,
    computeCyclesToEmptyWithNetRemoval: computeCyclesToEmptyWithNetRemoval
  };
}

