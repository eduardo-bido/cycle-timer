// Motor matemÃ¡tico do Cycle Timer (planilha simplificada)
// FunÃ§Ã£o pura, sem acesso a DOM ou storage.

/**
 * Divide com seguranÃ§a, retornando null se o divisor for invÃ¡lido
 * ou se qualquer operando nÃ£o for um nÃºmero finito.
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
 * Ciclos para esvaziar acÃºmulo com remoÃ§Ã£o lÃ­quida (caixas/s retiradas âˆ’ caixas/s entrando).
 * accumulationQty em caixas; netRemovalBoxesPerSecond = robotRemoval âˆ’ incoming.
 * Se net â‰¤ 0 e acÃºmulo > 0: nÃ£o hÃ¡ soluÃ§Ã£o finita â†’ null (UI: nÃ£o atende).
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
 * Valores negativos sÃ£o tratados como null (invÃ¡lidos).
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
 * @returns {Object} resultados com todos os campos calculados ou null em casos invÃ¡lidos
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
  // Carga adicional de outras linhas no pior caso (Modo A multilinear).
  // Zero quando nÃ£o informado (cenÃ¡rio de 1 linha ou chamada legada).
  var worstCaseOtherLinesBurdenS = (typeof input.worstCaseOtherLinesBurdenS === "number" && isFinite(input.worstCaseOtherLinesBurdenS) && input.worstCaseOtherLinesBurdenS >= 0)
    ? input.worstCaseOtherLinesBurdenS
    : 0;

  function componentTime(quantity, cycleTime) {
    // quantity null/undefined = componente nÃ£o configurado (slip sheet, pallet pick).
    // Tratamos como 0 â€” nÃ£o contribui para o tempo total, mas NÃƒO bloqueia o cÃ¡lculo.
    if (quantity === null || quantity === undefined) {
      return 0;
    }
    // cycleTime null = dado de robÃ´ ausente â€” isso SIM bloqueia o cÃ¡lculo.
    if (cycleTime === null || cycleTime === undefined) {
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
    // Regra fÃ­sica: sÃ³ contribui se ambos os fatores forem > 0.
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
    // Regra fÃ­sica: ciclo sÃ³ existe quando quantidade e tempo sÃ£o > 0.
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
  // (cada componente sÃ³ entra quando quantidade > 0 e tempo > 0)
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
  // SÃ³ Ã© null se o componente obrigatÃ³rio (pick) for null; slip e pallet sÃ£o opcionais (default 0).
  var totalStackingTimeRobotS =
    totalCycleTimePicksS === null
      ? null
      : totalCycleTimePicksS +
        (totalCycleTimeSlipSheetS !== null ? totalCycleTimeSlipSheetS : 0) +
        (totalCycleTimePalletsS !== null ? totalCycleTimePalletsS : 0);

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

  // Se não há slip sheet na base, o tempo contribuído é 0, mesmo que o cicloTime seja null.
  var slipBottomTime = (slipSheetBottom > 0) ? safeMultiply(cycleTimeSlipSheetS, slipSheetBottom) : 0;

  var accumulationTimeToPalletExchangeS =
    partPalletExchange === null || slipBottomTime === null
      ? null
      : safeAdd(partPalletExchange, slipBottomTime);

  // 11. productNumberInSlipAccumulation = acÃºmulo gerado por UM evento de slip sheet nesta linha
  //     + carga total de parada de outras linhas no pior caso (pallet + slip_total + pick de cada outra linha).
  //     O robÃ´ pode estar servindo outras linhas entre dois slips consecutivos desta linha.
  var slipEventTimeS = (cycleTimeSlipSheetS !== null && cycleTimeSlipSheetS > 0) ? cycleTimeSlipSheetS : 0;
  var worstCaseSlipPauseS = slipEventTimeS + worstCaseOtherLinesBurdenS;
  var productNumberInSlipAccumulation =
    gapBetweenBoxesS === null || worstCaseSlipPauseS === 0
      ? 0
      : safeDivide(worstCaseSlipPauseS, gapBetweenBoxesS);

  // 13. productsNumberInPalletAccumulation = (accumulationTimeToPalletExchangeS + burden_outras_linhas) / gapBetweenBoxesS
  //     O robÃ´ pode estar servindo outras linhas durante a troca de pallet desta linha.
  var worstCasePalletPauseS = accumulationTimeToPalletExchangeS !== null
    ? accumulationTimeToPalletExchangeS + worstCaseOtherLinesBurdenS
    : null;
  var productsNumberInPalletAccumulation =
    worstCasePalletPauseS === null || gapBetweenBoxesS === null
      ? null
      : safeDivide(worstCasePalletPauseS, gapBetweenBoxesS);

  // RemoÃ§Ã£o lÃ­quida na limpeza por ciclo de pick (mesma base para slip e pallet)
  var incomingBoxesPerSecond = safeDivide(productionBpm, 60);
  var robotRemovalBoxesPerSecond = safeDivide(boxesPerCycle, cycleTimePickS);
  var netRemovalBoxesPerSecond = safeSubtract(
    robotRemovalBoxesPerSecond,
    incomingBoxesPerSecond
  );

  // 12. cyclesToEmptySlipAccumulation â€” tempo para zerar fila / duraÃ§Ã£o do ciclo de pick
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

  var palletTimeMinutes =
    totalTimeOfPalletStackingS === null
      ? null
      : safeDivide(totalTimeOfPalletStackingS, 60);

  var cyclesNumberPerMinute =
    totalCyclesPerPallet === null || palletTimeMinutes === null
      ? null
      : safeDivide(totalCyclesPerPallet, palletTimeMinutes);

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

  // 20. picksBetweenSlips = quantidade de picks disponÃ­veis para limpar um acÃºmulo de slip
  // Se totalSlipSheets = 2 em 10 camadas, temos 5 camadas de picks para limpar cada slip.
  var layersPerSlip = (totalSlipSheets !== null && totalSlipSheets > 0)
    ? safeDivide(layersPerPallet, totalSlipSheets)
    : layersPerPallet;
  var picksBetweenSlips = safeMultiply(picksPerLayer, layersPerSlip);

  var canClearAccumulation = {
    pallet: null,
    slip: null,
    overall: null
  };

  if (picksPerPallet !== null) {
    // Só é true se o acúmulo for explicitamente 0 OU se o robô conseguir limpar no prazo.
    // Se productsNumberInPalletAccumulation for null (erro de cálculo), tratamos como null.
    if (productsNumberInPalletAccumulation === 0) {
      canClearAccumulation.pallet = true;
    } else if ((typeof productsNumberInPalletAccumulation === "number" && isFinite(productsNumberInPalletAccumulation)) && (typeof cyclesToEmptyPalletAccumulation === "number" && isFinite(cyclesToEmptyPalletAccumulation))) {
      canClearAccumulation.pallet = (cyclesToEmptyPalletAccumulation <= picksPerPallet);
    } else if (productsNumberInPalletAccumulation > 0 && cyclesToEmptyPalletAccumulation === null) {
      // Remoção negativa
      canClearAccumulation.pallet = false;
    } else {
      canClearAccumulation.pallet = null;
    }
  }

  if (picksBetweenSlips !== null) {
    if (slipEventTimeS === 0 || productNumberInSlipAccumulation === 0) {
      canClearAccumulation.slip = true;
    } else if ((typeof productNumberInSlipAccumulation === "number" && isFinite(productNumberInSlipAccumulation)) && (typeof cyclesToEmptySlipAccumulation === "number" && isFinite(cyclesToEmptySlipAccumulation))) {
      canClearAccumulation.slip = (cyclesToEmptySlipAccumulation <= picksBetweenSlips);
    } else if (productNumberInSlipAccumulation > 0 && cyclesToEmptySlipAccumulation === null) {
      // Remoção negativa
      canClearAccumulation.slip = false;
    } else {
      canClearAccumulation.slip = null;
    }
  }

  // overall: só true se ambos são explicitamente true; se houver algum false, é false.
  if (canClearAccumulation.pallet === null && canClearAccumulation.slip === null) {
    canClearAccumulation.overall = null;
  } else if (canClearAccumulation.pallet === false || canClearAccumulation.slip === false) {
    canClearAccumulation.overall = false;
  } else {
    // Ambos são (true ou null), e ao menos um é true.
    canClearAccumulation.overall = (canClearAccumulation.pallet === true || canClearAccumulation.slip === true);
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
    worstCaseOtherLinesBurdenS: worstCaseOtherLinesBurdenS,
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
    picksBetweenSlips: picksBetweenSlips,
    canClearAccumulation: canClearAccumulation
  };
}

// Export opcional para ambientes de mÃ³dulo (nÃ£o interfere no uso via <script> simples)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    computeCycleTimer: computeCycleTimer,
    computeCyclesToEmptyWithNetRemoval: computeCyclesToEmptyWithNetRemoval
  };
}


