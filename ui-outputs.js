// Camada de UI da aba OUTPUTS: recebe resultados calculados e status e renderiza na tela.

(function () {
  // Estado local de UI: linha atualmente selecionada para análise (1-based)
  var currentLineIndex = 1;
  // Mapeamento LINHA -> RECEITA (por enquanto apenas UI, sem impacto no cálculo)
  var lineRecipeMap = {};
  var currentChartView = localStorage.getItem("cycle-timer-chart-view") || "stacked";

  window.getCycleTimerLineRecipeMap = function () {
    return lineRecipeMap;
  };

  function isValidNumber(value) {
    return typeof value === "number" && isFinite(value);
  }

  function t(key) {
    if (window.I18N && typeof window.I18N.t === "function") {
      return window.I18N.t(key);
    }
    return key;
  }

  function getOccupancyClassFromPercent(percent) {
    if (!isValidNumber(percent)) return null;
    if (percent < 90) return "occ--good";
    if (percent <= 95) return "occ--warn";
    return "occ--bad";
  }

  function getOccupancyClassFromRate(rate) {
    if (!isValidNumber(rate)) return null;
    return getOccupancyClassFromPercent(rate * 100);
  }

  function occupancyBarModifierFromOccClass(occClass) {
    if (occClass === "occ--good") return "bar-occupancy--good";
    if (occClass === "occ--warn") return "bar-occupancy--warn";
    if (occClass === "occ--bad") return "bar-occupancy--bad";
    return "bar-occupancy--neutral";
  }

  function isLineValidForGeneral(line) {
    if (!line || !line.recipe || !line.results || !line.recipeRowId) return false;
    var recipe = line.recipe;
    var robotTimes = line.robotTimes || {};

    function gt0(v) {
      return isValidNumber(v) && v > 0;
    }

    var picksPerPallet =
      gt0(recipe.picksPerLayer) && gt0(recipe.layersPerPallet)
        ? recipe.picksPerLayer * recipe.layersPerPallet
        : 0;
    var totalSlipSheets =
      (isValidNumber(recipe.slipSheetBottom) ? recipe.slipSheetBottom : 0) +
      (isValidNumber(recipe.slipSheetBetweenLayers) ? recipe.slipSheetBetweenLayers : 0);
    var palletPick = isValidNumber(recipe.palletPick) ? recipe.palletPick : 0;

    var validPickComponent = picksPerPallet > 0 && gt0(robotTimes.cycleTimePickS);
    var validSlipComponent = totalSlipSheets > 0 && gt0(robotTimes.cycleTimeSlipSheetS);
    var validPalletComponent = palletPick > 0 && gt0(robotTimes.cycleTimePalletS);
    var hasAnyValidMovement = validPickComponent || validSlipComponent || validPalletComponent;

    if (!hasAnyValidMovement) return false;

    return (
      isValidNumber(recipe.productionBpm) &&
      recipe.productionBpm > 0 &&
      isValidNumber(recipe.boxesPerLayer) &&
      recipe.boxesPerLayer > 0 &&
      isValidNumber(recipe.layersPerPallet) &&
      recipe.layersPerPallet > 0 &&
      isValidNumber(recipe.picksPerLayer) &&
      recipe.picksPerLayer > 0
    );
  }

  function sumOfNumbers(arr) {
    var sum = 0;
    var any = false;
    for (var k = 0; k < arr.length; k++) {
      if (!isValidNumber(arr[k])) continue;
      any = true;
      sum += arr[k];
    }
    return any ? sum : null;
  }

  function computeGeneralAggregatesFromLines(lines) {
    var occVals = [];
    var cyclesVals = [];
    var reqVals = [];
    var avVals = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (!isLineValidForGeneral(line)) continue;
      var r = line && line.results;
      if (!r) continue;

      var occ = r.robotOccupancyRate;
      var req = r.totalTimeOfPalletStackingS;
      var av = r.totalStackingTimeRobotS;

      if (isValidNumber(occ)) occVals.push(occ);
      if (isValidNumber(r.cyclesNumberPerMinute)) cyclesVals.push(r.cyclesNumberPerMinute);
      if (isValidNumber(req)) reqVals.push(req);
      if (isValidNumber(av)) avVals.push(av);
    }

    var reqGeneral = sumOfNumbers(reqVals);
    var avGeneral = sumOfNumbers(avVals);
    var marginGeneral =
      isValidNumber(reqGeneral) && isValidNumber(avGeneral) ? reqGeneral - avGeneral : null;
    var cyclesPerMinGeneral = sumOfNumbers(cyclesVals);
    var occGeneral = sumOfNumbers(occVals);

    var occClass = null;
    if (isValidNumber(occGeneral)) {
      occClass = getOccupancyClassFromPercent(occGeneral * 100);
    }

    return {
      occGeneral: occGeneral,
      occClass: occClass,
      cyclesPerMinGeneral: cyclesPerMinGeneral,
      reqGeneral: reqGeneral,
      avGeneral: avGeneral,
      marginGeneral: marginGeneral
    };
  }

  // Números genéricos com 2 casas (uso onde não há especificação diferente)
  function formatNumber2(value) {
    if (!isValidNumber(value)) return "—";
    return value.toFixed(2);
  }

  // Inteiros (0 casas decimais)
  function formatInteger(value) {
    if (!isValidNumber(value)) return "—";
    return Math.round(value).toString();
  }

  // Segundos / valores fracionados com 2 casas
  function formatSeconds(value) {
    return formatNumber2(value);
  }

  function formatAccumulationQuantity(value) {
    return isValidNumber(value) ? formatNumber2(value) : "—";
  }

  /**
   * @param {"slip"|"pallet"} slipOrPallet
   * @returns {{ text: string, fail: boolean }}
   */
  function formatClearanceCyclesCell(results, slipOrPallet) {
    var qty =
      slipOrPallet === "slip"
        ? results.productNumberInSlipAccumulation
        : results.productsNumberInPalletAccumulation;
    var cycles =
      slipOrPallet === "slip"
        ? results.cyclesToEmptySlipAccumulation
        : results.cyclesToEmptyPalletAccumulation;
    var availablePicks = results.picksPerPallet;
    var net = results.netRemovalBoxesPerSecond;

    if (isValidNumber(qty) && qty > 0 && isValidNumber(net) && net <= 0) {
      return { text: t("output_clearance_not_feasible"), fail: true };
    }
    if (isValidNumber(cycles)) {
      var text = formatNumber2(cycles);
      var fail = false;
      if (slipOrPallet === "pallet" && isValidNumber(availablePicks)) {
          text += " / " + formatInteger(availablePicks);
          fail = cycles > availablePicks;
      }
      return { text: text, fail: fail };
    }
    return { text: "—", fail: false };
  }

  // Percentual com 1 casa decimal (ex: 40.7 %)
  function formatPercentage(value) {
    if (!isValidNumber(value)) return "—";
    var percent = value * 100;
    return percent.toFixed(1) + " %";
  }

  // Pallets/hour com 1 casa decimal
  function formatPalletsPerHour(value) {
    if (!isValidNumber(value)) return "—";
    return value.toFixed(1);
  }

  // Indicador principal (status)
  var elOccupancyValue = document.getElementById("out-robot-occupancy");
  var elStatus = document.getElementById("out-status");
  var elKpiPalletsPerHour = document.getElementById("out-kpi-palletsPerHour");
  var elKpiAverageCycle = document.getElementById("out-kpi-averageCycleTimeS");

  // Painel de validação na aba INPUTS (direita)
  var rt = {
    okBadge: document.getElementById("rt-okBadge"),
    occupancyPct: document.getElementById("rt-occupancyPct"),
    cyclesPerMin: document.getElementById("rt-cyclesPerMin"),
    accumBadge: document.getElementById("rt-accumBadge")
  };

  // Production data (inputs)
  var prodMap = {
    productionBpm: document.getElementById("out-productionBpm"),
    boxesPerLayer: document.getElementById("out-boxesPerLayer"),
    layersPerPallet: document.getElementById("out-layersPerPallet"),
    picksPerLayer: document.getElementById("out-picksPerLayer"),
    slipSheetBottom: document.getElementById("out-slipSheetBottom"),
    slipSheetBetweenLayers: document.getElementById(
      "out-slipSheetBetweenLayers"
    ),
    palletPick: document.getElementById("out-palletPick")
  };

  // Fixed times (inputs)
  var timesMap = {
    cycleTimePickS: document.getElementById("out-cycleTimePickS"),
    cycleTimeSlipSheetS: document.getElementById("out-cycleTimeSlipSheetS"),
    cycleTimePalletS: document.getElementById("out-cycleTimePalletS")
  };

  // Results (engine)
  var resMap = {
    totalBoxesOnPallet: document.getElementById("out-totalBoxesOnPallet"),
    picksPerPallet: document.getElementById("out-picksPerPallet"),
    gapBetweenBoxesS: document.getElementById("out-gapBetweenBoxesS"),
    boxesPerCycle: document.getElementById("out-boxesPerCycle"),
    totalCyclesPerPallet: document.getElementById("out-totalCyclesPerPallet"),
    totalCycleTimePicksS: document.getElementById(
      "out-totalCycleTimePicksS"
    ),
    totalCycleTimeSlipSheetS: document.getElementById(
      "out-totalCycleTimeSlipSheetS"
    ),
    totalCycleTimePalletsS: document.getElementById(
      "out-totalCycleTimePalletsS"
    ),
    totalStackingTimeRobotS: document.getElementById(
      "out-totalStackingTimeRobotS"
    ),
    accumulationTimeToPalletExchangeS: document.getElementById(
      "out-accumulationTimeToPalletExchangeS"
    ),
    productNumberInSlipAccumulation: document.getElementById(
      "out-productNumberInSlipAccumulation"
    ),
    cyclesToEmptySlipAccumulation: document.getElementById(
      "out-cyclesToEmptySlipAccumulation"
    ),
    productsNumberInPalletAccumulation: document.getElementById(
      "out-productsNumberInPalletAccumulation"
    ),
    cyclesToEmptyPalletAccumulation: document.getElementById(
      "out-cyclesToEmptyPalletAccumulation"
    ),
    totalTimeOfPalletStackingS: document.getElementById(
      "out-totalTimeOfPalletStackingS"
    ),
    robotOccupancyRate: document.getElementById("out-robotOccupancyRate"),
    cyclesNumberPerMinute: document.getElementById("out-cyclesNumberPerMinute"),
    averageCycleTimeS: document.getElementById("out-averageCycleTimeS"),
    palletsPerHour: document.getElementById("out-palletsPerHour")
  };

  // Elementos do topo do output (aba INPUTS)
  var elChartLineLabel = document.getElementById("output-chart-line-label");
  var elGeneralChart = document.getElementById("general-chart");
  var elLineRecipeGrid = document.getElementById("output-line-recipe-grid");
  var elLinesOverviewGrid = document.getElementById("output-lines-grid");

  var elGenRequired = document.getElementById("gen-requiredCycleS");
  var elGenAvailable = document.getElementById("gen-availableCycleS");
  var elGenMargin = document.getElementById("gen-marginCycleS");

  function parseNumber(value) {
    if (value === null || value === undefined) return null;
    var trimmed = String(value).trim();
    if (trimmed === "") return null;
    var normalized = trimmed.replace(",", ".");
    var n = parseFloat(normalized);
    return isNaN(n) ? null : n;
  }

  function updateLineContext() {
    if (elChartLineLabel) {
      elChartLineLabel.textContent = t("output_chart_compare_lines");
    }
  }

  // Obtém lista de receitas cadastradas na planilha (aba INPUTS)
  function getRecipeOptions() {
    var body = document.getElementById("recipes-sheet-body");
    if (!body) return [];

    var rows = body.querySelectorAll("tr.sheet-row");
    var options = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var rowId = row.getAttribute("data-row") || String(i + 1);
      var nameInput = row.querySelector("td:first-child input");
      var rawName = nameInput && nameInput.value ? nameInput.value.trim() : "";
      var displayName = rawName || t("output_recipe_prefix") + " " + rowId;
      options.push({
        id: rowId,
        label: displayName
      });
    }
    return options;
  }

  function getRecipeByRowId(rowId) {
    var body = document.getElementById("recipes-sheet-body");
    if (!body) return null;
    var row = body.querySelector('tr.sheet-row[data-row="' + rowId + '"]');
    if (!row) return null;

    var inputs = row.querySelectorAll("td input.sheet-cell");
    if (!inputs || inputs.length < 8) return null;

    return {
      nomeReceita: inputs[0].value ? String(inputs[0].value) : "",
      productionBpm: parseNumber(inputs[1].value),
      boxesPerLayer: parseNumber(inputs[2].value),
      layersPerPallet: parseNumber(inputs[3].value),
      picksPerLayer: parseNumber(inputs[4].value),
      // Observação: os inputs na linha seguem a ordem dos <td> no DOM, que
      // está desalinhada com os títulos visuais. Para corrigir Pallet pick,
      // aplicamos o mapeamento consistente com o engine.
      // td6 (inputs[5]) -> visual "Capturas de pallet" -> palletPick
      // td7 (inputs[6]) -> visual "Slip sheet na base" -> slipSheetBottom
      // td8 (inputs[7]) -> visual "Slip sheet entre camadas" -> slipSheetBetweenLayers
      slipSheetBottom: parseNumber(inputs[6].value),
      slipSheetBetweenLayers: parseNumber(inputs[7].value),
      palletPick: parseNumber(inputs[5].value)
    };
  }

  function getRobotTimesByLine(lineIndex) {
    function v(id) {
      var el = document.getElementById(id);
      return el ? parseNumber(el.value) : null;
    }

    var suffix = lineIndex === 1 ? "" : "-l" + lineIndex;
    return {
      cycleTimePickS: v("robot-cicloProdutoMs" + suffix),
      cycleTimeSlipSheetS: v("robot-cicloSlipsheetMs" + suffix),
      cycleTimePalletS: v("robot-cicloPalletMs" + suffix)
    };
  }

  function computeLineResults() {
    if (typeof computeCycleTimer !== "function") return [];

    var linesInput = document.getElementById("robot-lines-count");
    var maxLines = 1;
    if (linesInput) {
      var parsed = parseInt(linesInput.value, 10);
      if (isFinite(parsed) && parsed > 0) {
        maxLines = Math.min(Math.max(parsed, 1), 6);
      }
    }

    var out = [];
    for (var lineIndex = 1; lineIndex <= maxLines; lineIndex++) {
      var mappedRowId = lineRecipeMap[lineIndex];
      // Se não foi associado, não calcula (mantém placeholder no gráfico)
      if (!mappedRowId) {
        out.push({
          lineIndex: lineIndex,
          recipeRowId: null,
          recipe: null,
          robotTimes: null,
          results: null
        });
        continue;
      }

      var recipe = getRecipeByRowId(mappedRowId);
      var robotTimes = getRobotTimesByLine(lineIndex);

      var engineInput = {
        productionBpm: recipe ? recipe.productionBpm : null,
        boxesPerLayer: recipe ? recipe.boxesPerLayer : null,
        layersPerPallet: recipe ? recipe.layersPerPallet : null,
        picksPerLayer: recipe ? recipe.picksPerLayer : null,
        slipSheetBottom: recipe ? recipe.slipSheetBottom : null,
        slipSheetBetweenLayers: recipe ? recipe.slipSheetBetweenLayers : null,
        palletPick: recipe ? recipe.palletPick : null,
        cycleTimePickS: robotTimes.cycleTimePickS,
        cycleTimeSlipSheetS: robotTimes.cycleTimeSlipSheetS,
        cycleTimePalletS: robotTimes.cycleTimePalletS
      };

      var results = computeCycleTimer(engineInput);
      out.push({
        lineIndex: lineIndex,
        recipeRowId: mappedRowId,
        recipe: recipe,
        robotTimes: robotTimes,
        results: results
      });
    }
    return out;
  }

  function setText(el, text) {
    if (!el) return;
    el.textContent = text;
  }

  function renderGeneralKpisFromLines(lines) {
    var g = computeGeneralAggregatesFromLines(lines);
    var reqGeneral = g.reqGeneral;
    var avGeneral = g.avGeneral;
    var marginGeneral = g.marginGeneral;
    var cyclesPerMinGeneral = g.cyclesPerMinGeneral;
    var occGeneral = g.occGeneral;
    var occClass = g.occClass;

    if (rt.okBadge) {
      // Remove qualquer texto e classes textuais de status legado.
      rt.okBadge.textContent = "";
      rt.okBadge.classList.remove("status--ok", "status--limit", "status--fail", "status--na");
    }

    var canClearAccumGeneral = true;
    var hasValidLines = false;
    for (var i = 0; i < lines.length; i++) {
      if (isLineValidForGeneral(lines[i])) {
         hasValidLines = true;
         if (lines[i].results && lines[i].results.canClearAccumulation === false) {
            canClearAccumGeneral = false;
         }
      }
    }

    if (rt.accumBadge) {
      if (!hasValidLines) {
        rt.accumBadge.textContent = "—";
        rt.accumBadge.className = "output-exec-kpi-value";
      } else if (canClearAccumGeneral) {
        rt.accumBadge.textContent = "✅";
        rt.accumBadge.className = "output-exec-kpi-value txt-ok";
      } else {
        rt.accumBadge.textContent = "❌";
        rt.accumBadge.className = "output-exec-kpi-value txt-fail";
      }
    }

    if (rt.occupancyPct) {
      if (isValidNumber(occGeneral)) {
        rt.occupancyPct.textContent = formatPercentage(occGeneral);
        var occupancyKpiCard = rt.occupancyPct.closest(".output-exec-kpi");
        rt.occupancyPct.classList.remove("occ--good", "occ--warn", "occ--bad");
        if (occClass) rt.occupancyPct.classList.add(occClass);
        if (occupancyKpiCard) {
          occupancyKpiCard.classList.remove("occ--good", "occ--warn", "occ--bad");
          if (occClass) occupancyKpiCard.classList.add(occClass);
        }
        if (rt.okBadge) {
          rt.okBadge.classList.remove("occ--good", "occ--warn", "occ--bad");
          if (occClass) rt.okBadge.classList.add(occClass);
        }
      } else {
        rt.occupancyPct.textContent = "—";
        var occupancyKpiCardEmpty = rt.occupancyPct.closest(".output-exec-kpi");
        rt.occupancyPct.classList.remove("occ--good", "occ--warn", "occ--bad");
        if (occupancyKpiCardEmpty) {
          occupancyKpiCardEmpty.classList.remove("occ--good", "occ--warn", "occ--bad");
        }
      }
    }
    if (rt.cyclesPerMin) {
      rt.cyclesPerMin.textContent = isValidNumber(cyclesPerMinGeneral)
        ? formatSeconds(cyclesPerMinGeneral)
        : "—";
    }

    // KPIs adicionais no bloco Geral (soma real das linhas válidas)
    setText(elGenRequired, isValidNumber(reqGeneral) ? formatSeconds(reqGeneral) : "—");
    setText(elGenAvailable, isValidNumber(avGeneral) ? formatSeconds(avGeneral) : "—");
    setText(elGenMargin, isValidNumber(marginGeneral) ? formatSeconds(marginGeneral) : "—");

    // Insights (toast macOS-like): debounce + edge-trigger vivem no módulo de toast.
    if (
      typeof window !== "undefined" &&
      window.CycleTimerInsights &&
      typeof window.CycleTimerInsights.scheduleUpdate === "function"
    ) {
      window.CycleTimerInsights.scheduleUpdate({ general: g, lines: lines });
    }
  }

  function renderGeneralChart(lines) {
    if (!elGeneralChart) return;

    var chartLines = [];
    for (var li = 0; li < lines.length; li++) {
      var ln = lines[li];
      if (!ln || !ln.recipeRowId || !ln.results) continue;
      chartLines.push(ln);
    }

    if (chartLines.length === 0) {
      if (elChartLineLabel) {
        elChartLineLabel.textContent = t("output_chart_select_recipe_hint");
        elChartLineLabel.style.display = "flex";
      }
      var existingEmpty = elGeneralChart.querySelector("svg.general-bars");
      if (existingEmpty) existingEmpty.remove();
      var chartBoxEmpty = elGeneralChart.closest(".output-chart-box");
      if (chartBoxEmpty) {
        chartBoxEmpty.style.height = "";
      }
      return;
    }

    if (elChartLineLabel) elChartLineLabel.style.display = "none";
    var existingSvg = elGeneralChart.querySelector("svg.general-bars");
    if (existingSvg) existingSvg.remove();

    if (currentChartView === "stacked") {
      renderStackedChart(chartLines);
    } else {
      renderComparisonChart(chartLines, lines.length);
    }

    if (window.initHelpTooltipsUnder) {
      var svg = elGeneralChart.querySelector("svg.general-bars");
      if (svg) window.initHelpTooltipsUnder(svg);
    }
  }

  function renderStackedChart(chartLines) {
    var chartBox = elGeneralChart.closest(".output-chart-box");
    var pad = 12;
    var barH = 54;
    var legendH = 24;
    var gap = 12;
    
    var innerNeeded = pad * 2 + barH + gap + legendH;
    if (chartBox) {
      chartBox.style.height = Math.ceil(innerNeeded + 12) + "px";
    }

    var w = elGeneralChart.clientWidth || 760;
    var h = elGeneralChart.clientHeight || innerNeeded;
    var x0 = pad;
    var maxBarW = w - pad * 2;

    var svgns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgns, "svg");
    svg.setAttribute("class", "general-bars");
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");

    // Background track (100%)
    var rail = document.createElementNS(svgns, "rect");
    rail.setAttribute("x", x0);
    rail.setAttribute("y", pad);
    rail.setAttribute("width", maxBarW);
    rail.setAttribute("height", barH);
    rail.setAttribute("rx", "10");
    rail.setAttribute("fill", "#e5e7eb"); // Cinza claro
    svg.appendChild(rail);

    var currentX = x0;
    var totalOcc = 0;
    
    // Tons de verde para as linhas
    var greens = [
      "#2f855a", // Linha 1
      "#38a169", // Linha 2
      "#48bb78", // Linha 3
      "#68d391", // Linha 4
      "#9ae6b4", // Linha 5
      "#c6f6d5"  // Linha 6
    ];

    for (var i = 0; i < chartLines.length; i++) {
      var line = chartLines[i];
      var occ = line.results ? line.results.robotOccupancyRate : 0;
      if (!isValidNumber(occ) || occ <= 0) continue;

      var segmentW = occ * maxBarW;
      // Se ultrapassar 100%, clipa visualmente para o rail mas guarda o total
      var visualW = segmentW;
      if (currentX + segmentW > x0 + maxBarW) {
        visualW = Math.max(0, x0 + maxBarW - currentX);
      }

      if (visualW > 0.5) {
        var rect = document.createElementNS(svgns, "rect");
        rect.setAttribute("x", currentX);
        rect.setAttribute("y", pad);
        rect.setAttribute("width", visualW);
        rect.setAttribute("height", barH);
        // Rounded corners apenas nas extremidades
        if (i === 0 && currentX + visualW < x0 + maxBarW) {
          rect.setAttribute("rx", "10"); // Placeholder, SVG rect rx applies to all
        }
        rect.setAttribute("fill", greens[i % greens.length]);
        
        // Tooltip hint
        rect.setAttribute("class", "help-node");
        rect.setAttribute("data-help-key", "lineOccupancy");
        rect.setAttribute("tabindex", "0");
        
        svg.appendChild(rect);

        // Label minimalista dentro ou sobre o segmento se couber
        if (visualW > 40) {
          var txt = document.createElementNS(svgns, "text");
          txt.setAttribute("x", currentX + visualW / 2);
          txt.setAttribute("y", pad + barH / 2 + 5);
          txt.setAttribute("text-anchor", "middle");
          txt.setAttribute("fill", i < 3 ? "#ffffff" : "#1a3a2a");
          txt.setAttribute("font-size", "11");
          txt.setAttribute("font-weight", "800");
          txt.textContent = "L" + line.lineIndex;
          svg.appendChild(txt);
        }
      }

      currentX += segmentW;
      totalOcc += occ;
    }

    // Se ultrapassou 100%, mostra um indicador de excesso
    if (totalOcc > 1) {
      var overW = Math.min(20, (totalOcc - 1) * maxBarW);
      var overRect = document.createElementNS(svgns, "rect");
      overRect.setAttribute("x", x0 + maxBarW - 4);
      overRect.setAttribute("y", pad);
      overRect.setAttribute("width", 4);
      overRect.setAttribute("height", barH);
      overRect.setAttribute("fill", "#dc2626"); // Vermelho
      svg.appendChild(overRect);
    }

    // Legenda sutil abaixo
    var legendY = pad + barH + gap + 14;
    var legendText = document.createElementNS(svgns, "text");
    legendText.setAttribute("x", w / 2);
    legendText.setAttribute("y", legendY);
    legendText.setAttribute("text-anchor", "middle");
    legendText.setAttribute("font-size", "12");
    legendText.setAttribute("font-weight", "700");
    legendText.setAttribute("fill", "#6b7280");
    legendText.textContent = t("output_chart_view_stacked") + ": " + formatPercentage(totalOcc);
    svg.appendChild(legendText);

    elGeneralChart.appendChild(svg);
  }

  function renderComparisonChart(chartLines, totalPossibleLines) {
    var pad = 8;
    var legendBlock = 19;
    var gapLegendToBars = 4;
    var contentTop = pad + legendBlock + gapLegendToBars;
    var contentBottom = 4;

    var totalLines = totalPossibleLines || chartLines.length;
    var barH = totalLines <= 1 ? 37 : totalLines === 2 ? 33 : totalLines === 3 ? 29 : 27;
    
    var lineGap = 5;
    if (totalLines <= 1) lineGap = 0;
    else if (totalLines === 2) lineGap = 7;
    
    var usedHeight = chartLines.length * barH + (chartLines.length > 0 ? (chartLines.length - 1) * lineGap : 0);
    var innerNeeded = contentTop + usedHeight + contentBottom;

    var chartBox = elGeneralChart.closest(".output-chart-box");
    if (chartBox) {
      chartBox.style.height = Math.ceil(innerNeeded + 12) + "px";
    }

    var w = elGeneralChart.clientWidth || 760;
    var h = elGeneralChart.clientHeight || Math.max(80, innerNeeded);
    var labelW = 72;
    var contentLeft = pad;
    var maxBarW = Math.max(260, w - pad * 2 - labelW);

    var lineH = barH + lineGap;
    var startY = contentTop;

    var svgns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgns, "svg");
    svg.setAttribute("class", "general-bars");
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");

    var legendY = pad + 1;
    var legendLabelText = t("output_chart_legend_occupancy");
    var legendApproxW = Math.min(280, 14 + legendLabelText.length * 6.5);
    var legendStartX = contentLeft + labelW + Math.max(0, Math.floor((maxBarW - legendApproxW) / 2));

    // Legend
    var lg = document.createElementNS(svgns, "g");
    lg.setAttribute("class", "help-node chart-legend-item");
    lg.setAttribute("data-help-key", "chartLegendOccupancy");
    lg.setAttribute("tabindex", "0");
    
    var dot = document.createElementNS(svgns, "circle");
    dot.setAttribute("cx", String(legendStartX + 5));
    dot.setAttribute("cy", String(legendY + 6));
    dot.setAttribute("r", "5.25");
    dot.setAttribute("class", "bar-occupancy bar-occupancy--good");
    lg.appendChild(dot);

    var lt = document.createElementNS(svgns, "text");
    lt.setAttribute("class", "chart-legend-label");
    lt.setAttribute("x", String(legendStartX + 18));
    lt.setAttribute("y", String(legendY + 11));
    lt.setAttribute("font-size", "11.5");
    lt.setAttribute("font-weight", "700");
    lt.textContent = legendLabelText;
    lg.appendChild(lt);
    svg.appendChild(lg);

    for (var i = 0; i < chartLines.length; i++) {
      var line = chartLines[i];
      var yBase = startY + i * lineH;

      var lbl = document.createElementNS(svgns, "text");
      lbl.setAttribute("class", "chart-line-label");
      lbl.setAttribute("x", contentLeft);
      lbl.setAttribute("y", yBase + barH - 5);
      lbl.setAttribute("font-size", "13");
      lbl.setAttribute("font-weight", "800");
      lbl.textContent = t("output_line_prefix") + " " + line.lineIndex;
      svg.appendChild(lbl);

      var x0 = contentLeft + labelW;
      var rail = document.createElementNS(svgns, "rect");
      rail.setAttribute("x", x0);
      rail.setAttribute("y", yBase);
      rail.setAttribute("width", maxBarW);
      rail.setAttribute("height", barH);
      rail.setAttribute("rx", "6");
      rail.setAttribute("class", "bar-track");
      svg.appendChild(rail);

      var occV = line.results ? line.results.robotOccupancyRate : null;
      if (isValidNumber(occV)) {
        var fillW = occV > 1 ? maxBarW : Math.max(0, occV) * maxBarW;
        var occClassLine = getOccupancyClassFromPercent(occV * 100);
        var fillMod = occV > 1 ? "bar-occupancy--over" : occupancyBarModifierFromOccClass(occClassLine);

        if (fillW > 0.5) {
          var fillR = document.createElementNS(svgns, "rect");
          fillR.setAttribute("x", x0);
          fillR.setAttribute("y", yBase);
          fillR.setAttribute("width", fillW);
          fillR.setAttribute("height", barH);
          fillR.setAttribute("rx", "6");
          fillR.setAttribute("class", "bar-occupancy " + fillMod);
          svg.appendChild(fillR);
        }
      }
    }

    elGeneralChart.appendChild(svg);
  }


  function rebuildLineRecipeGrid() {
    if (!elLineRecipeGrid) return;

    // Quantidade de linhas configuradas
    var linesInput = document.getElementById("robot-lines-count");
    var maxLines = 1;
    if (linesInput) {
      var parsed = parseInt(linesInput.value, 10);
      if (isFinite(parsed) && parsed > 0) {
        maxLines = Math.min(Math.max(parsed, 1), 6);
      }
    }

    // Opções de receita atuais
    var recipeOptions = getRecipeOptions();

    // Limpa grade anterior
    while (elLineRecipeGrid.firstChild) {
      elLineRecipeGrid.removeChild(elLineRecipeGrid.firstChild);
    }

    for (var lineIndex = 1; lineIndex <= maxLines; lineIndex++) {
      var item = document.createElement("div");
      item.className = "output-line-recipe-item";

      var label = document.createElement("div");
      label.className = "output-line-recipe-label";
      label.textContent = t("output_line_prefix") + " " + lineIndex;
      item.appendChild(label);

      var select = document.createElement("select");
      select.className = "output-line-recipe-select";
      select.setAttribute("data-line", String(lineIndex));

      var placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = t("output_line_select_recipe");
      select.appendChild(placeholder);

      for (var j = 0; j < recipeOptions.length; j++) {
        var optData = recipeOptions[j];
        var opt = document.createElement("option");
        opt.value = optData.id;
        opt.textContent = optData.label;
        select.appendChild(opt);
      }

      // Preserva associação já escolhida, se existir
      var currentMapped = lineRecipeMap[lineIndex];
      if (currentMapped) {
        select.value = currentMapped;
      }

      select.addEventListener("change", (function (line) {
        return function (e) {
          var val = e.target.value || "";
          lineRecipeMap[line] = val;
          // Atualiza "Geral" imediatamente ao trocar associação
          var lines = computeLineResults();
          renderGeneralChart(lines);
          renderGeneralKpisFromLines(lines);
          rebuildLinesOverviewGrid();
          if (typeof window.syncRecipeDependentFields === "function") {
            window.syncRecipeDependentFields();
          }
        };
      })(lineIndex));

      item.appendChild(select);
      elLineRecipeGrid.appendChild(item);
    }

    if (typeof window.syncRecipeDependentFields === "function") {
      window.syncRecipeDependentFields();
    }
  }

  // Cria blocos de overview técnico por linha (abaixo do "Geral")
  function rebuildLinesOverviewGrid() {
    if (!elLinesOverviewGrid) return;

    // Quantidade de linhas configuradas
    var linesInput = document.getElementById("robot-lines-count");
    var maxLines = 1;
    if (linesInput) {
      var parsed = parseInt(linesInput.value, 10);
      if (isFinite(parsed) && parsed > 0) {
        maxLines = Math.min(Math.max(parsed, 1), 6);
      }
    }

    // Opções de receita atuais (para mostrar nome no card)
    var recipeOptions = getRecipeOptions();
    var recipeLabelById = {};
    for (var i = 0; i < recipeOptions.length; i++) {
      recipeLabelById[recipeOptions[i].id] = recipeOptions[i].label;
    }

    // Calcula uma vez por rebuild (<=6 linhas)
    var linesComputed = computeLineResults();
    var lineDataByIndex = {};
    for (var ci = 0; ci < linesComputed.length; ci++) {
      lineDataByIndex[linesComputed[ci].lineIndex] = linesComputed[ci];
    }

    while (elLinesOverviewGrid.firstChild) {
      elLinesOverviewGrid.removeChild(elLinesOverviewGrid.firstChild);
    }

    elLinesOverviewGrid.classList.remove(
      "output-lines-grid--kpis-compact",
      "output-lines-grid--kpis-dense"
    );
    if (maxLines >= 4) {
      elLinesOverviewGrid.classList.add("output-lines-grid--kpis-dense");
    } else if (maxLines === 3) {
      elLinesOverviewGrid.classList.add("output-lines-grid--kpis-compact");
    }

    function addLabelWithHelp(labelText, helpKey) {
      var label = document.createElement("div");
      label.className = "output-line-row-label";

      var text = document.createElement("span");
      text.textContent = labelText;
      label.appendChild(text);

      if (helpKey) {
        var help = document.createElement("span");
        help.className = "help-icon help-icon--tiny";
        help.setAttribute("data-help-key", helpKey);
        help.setAttribute("aria-label", t("tooltip_helpTitle"));
        help.textContent = "?";
        label.appendChild(help);
      }

      return label;
    }

    function addRow(container, labelText, valueText, helpKey, valueExtraClass) {
      var row = document.createElement("div");
      row.className = "output-line-row";
      var label = addLabelWithHelp(labelText, helpKey);

      var value = document.createElement("div");
      value.className =
        "output-line-row-value" +
        (valueExtraClass ? " " + valueExtraClass : "");
      value.textContent = valueText;

      row.appendChild(label);
      row.appendChild(value);
      container.appendChild(row);
    }

    function formatOptionalSeconds(v) {
      // Mantém o mesmo padrão já usado no resto do UI
      return isValidNumber(v) ? formatSeconds(v) : "—";
    }

    function formatOptionalInteger(v) {
      return isValidNumber(v) ? formatInteger(v) : "—";
    }

    function formatOptionalPercentage(v) {
      return isValidNumber(v) ? formatPercentage(v) : "—";
    }

    function formatOptionalPalletsPerHour(v) {
      return isValidNumber(v) ? formatPalletsPerHour(v) : "—";
    }

    for (var lineIndex = 1; lineIndex <= maxLines; lineIndex++) {
      var card = document.createElement("div");
      card.className = "vs-card vs-card--compact output-line-card";

      var header = document.createElement("div");
      header.className = "vs-card__header output-line-card-header";

      var lineEl = document.createElement("span");
      lineEl.className = "output-line-card-line";
      lineEl.textContent = t("output_line_prefix") + " " + lineIndex;
      header.appendChild(lineEl);
      card.appendChild(header);

      var mappedId = lineRecipeMap[lineIndex];
      var lineEntry = lineDataByIndex[lineIndex];

      // Se não houver receita associada, não renderiza blocos
      if (!mappedId || !lineEntry || !lineEntry.results || !lineEntry.recipe) {
        elLinesOverviewGrid.appendChild(card);
        continue;
      }
      card.classList.add("output-line-card--ready");

      var body = document.createElement("div");
      body.className = "output-line-card-body";

      var recipe = lineEntry.recipe;
      var robotTimes = lineEntry.robotTimes;
      var r = lineEntry.results;
      var recipeLabel = recipeLabelById[mappedId] || "—";

      // TOPO (RESULTADOS PRINCIPAIS) — faixa horizontal sem caixas individuais
      var topBand = document.createElement("div");
      topBand.className = "output-line-topband";

      var occ = r.robotOccupancyRate;
      var occCls = getOccupancyClassFromRate(occ);

      function makeItem(label, valueText, valueClass, helpKey) {
        var item = document.createElement("div");
        item.className = "output-line-topband-item";

        var l = document.createElement("div");
        l.className = "output-line-topband-label";
        var lText = document.createElement("span");
        lText.className = "output-line-topband-label-text";
        lText.textContent = label;
        l.appendChild(lText);
        if (helpKey) {
          var lHelp = document.createElement("span");
          lHelp.className = "help-icon help-icon--tiny";
          lHelp.setAttribute("data-help-key", helpKey);
          lHelp.setAttribute("aria-label", t("tooltip_helpTitle"));
          lHelp.textContent = "?";
          l.appendChild(lHelp);
        }

        var v = document.createElement("div");
        v.className = "output-line-topband-value";
        if (valueClass) v.classList.add.apply(v.classList, valueClass.split(" "));
        v.textContent = valueText || "—";

        item.appendChild(l);
        item.appendChild(v);
        return item;
      }

      // Valores consolidados por linha (sem criar novas métricas)
      var reqS = r.totalTimeOfPalletStackingS;

      var slipAccum = r.productNumberInSlipAccumulation;
      var palletAccum = r.productsNumberInPalletAccumulation;
      var maxAccumProducts = null;
      var accumCandidates = [];
      if (isValidNumber(slipAccum)) accumCandidates.push(slipAccum);
      if (isValidNumber(palletAccum)) accumCandidates.push(palletAccum);
      if (accumCandidates.length) {
        maxAccumProducts = Math.max.apply(null, accumCandidates);
      }

      var occValue = formatPercentage(occ);
      var occItem = makeItem(
        t("output_top_occupancy").toUpperCase(),
        occValue,
        occCls ? occCls : "",
        "robotOccupancyRate"
      );
      if (occCls) occItem.classList.add("occ-signal", occCls);

      // Ciclos/min
      var cpmValue = isValidNumber(r.cyclesNumberPerMinute)
        ? formatSeconds(r.cyclesNumberPerMinute)
        : "—";
      var cpmItem = makeItem(
        t("output_top_cycles_min").toUpperCase(),
        cpmValue,
        "",
        "cyclesNumberPerMinute"
      );

      // Tempo necessário
      var reqValue = formatOptionalSeconds(reqS);
      var reqItem = makeItem(
        t("output_top_required_time").toUpperCase(),
        reqValue,
        "",
        "totalTimeOfPalletStackingS"
      );

      // Maior quantidade de produtos entre os pontos de acúmulo da linha
      var maxAccumValue = formatOptionalInteger(maxAccumProducts);
      var maxAccumItem = makeItem(
        t("output_top_max_accum_products").toUpperCase(),
        maxAccumValue,
        "",
        "lineMaxProductsInAccumulation"
      );

      topBand.appendChild(occItem);
      topBand.appendChild(cpmItem);
      topBand.appendChild(reqItem);
      topBand.appendChild(maxAccumItem);

      var lineCardContent = document.createElement("div");
      lineCardContent.className = "vs-card__content output-line-card__content";
      lineCardContent.appendChild(topBand);

      // A) Receita/produção (sem título de seção, apenas divisor sutil)
      var sectionA = document.createElement("div");
      sectionA.className = "output-line-section output-line-section--identity";
      var sectionAInner = document.createElement("div");
      sectionAInner.className = "output-line-section-body";
      addRow(sectionAInner, t("output_row_recipe_name"), recipeLabel, "skuName");
      addRow(
        sectionAInner,
        t("output_row_production_bpm"),
        isValidNumber(recipe.productionBpm) ? formatNumber2(recipe.productionBpm) : "—",
        "productionBpm"
      );
      sectionA.appendChild(sectionAInner);
      body.appendChild(sectionA);

      // B) Production data
      var sectionB = document.createElement("div");
      sectionB.className = "output-line-section output-line-section--production";
      var sectionBInner = document.createElement("div");
      sectionBInner.className = "output-line-section-body";
      addRow(sectionBInner, t("output_row_boxes_per_layer"), formatOptionalInteger(recipe.boxesPerLayer), "boxesPerLayer");
      addRow(sectionBInner, t("output_row_layers_per_pallet"), formatOptionalInteger(recipe.layersPerPallet), "layersPerPallet");
      addRow(sectionBInner, t("output_row_quantity_of_picks"), formatOptionalInteger(recipe.picksPerLayer), "picksPerLayer");
      addRow(sectionBInner, t("output_row_slip_bottom"), formatOptionalInteger(recipe.slipSheetBottom), "slipSheetBottom");
      addRow(sectionBInner, t("output_row_slip_between"), formatOptionalInteger(recipe.slipSheetBetweenLayers), "slipSheetBetweenLayers");
      addRow(sectionBInner, t("output_row_pallet_pick"), formatOptionalInteger(recipe.palletPick), "palletPick");
      sectionB.appendChild(sectionBInner);
      body.appendChild(sectionB);

      // C) Fixed times
      var sectionC = document.createElement("div");
      sectionC.className = "output-line-section output-line-section--times";
      var sectionCInner = document.createElement("div");
      sectionCInner.className = "output-line-section-body";
      addRow(sectionCInner, t("output_row_cycle_pick"), formatOptionalSeconds(robotTimes.cycleTimePickS), "cycleTimePickS");
      addRow(sectionCInner, t("output_row_cycle_slip"), formatOptionalSeconds(robotTimes.cycleTimeSlipSheetS), "cycleTimeSlipSheetS");
      addRow(sectionCInner, t("output_row_cycle_pallet"), formatOptionalSeconds(robotTimes.cycleTimePalletS), "cycleTimePalletS");
      sectionC.appendChild(sectionCInner);
      body.appendChild(sectionC);

      // D) Results
      var sectionD = document.createElement("div");
      sectionD.className = "output-line-section output-line-section--results";
      var sectionDInner = document.createElement("div");
      sectionDInner.className = "output-line-section-body";
      addRow(sectionDInner, t("output_row_total_boxes_pallet"), formatOptionalInteger(r.totalBoxesOnPallet), "totalBoxesOnPallet");
      addRow(sectionDInner, t("output_row_picks_pallet"), formatOptionalInteger(r.picksPerPallet), "picksPerPallet");
      addRow(sectionDInner, t("output_row_gap_between_boxes"), formatOptionalSeconds(r.gapBetweenBoxesS), "gapBetweenBoxesS");
      addRow(sectionDInner, t("output_row_boxes_per_cycle"), isValidNumber(r.boxesPerCycle) ? formatSeconds(r.boxesPerCycle) : "—", "boxesPerCycle");
      addRow(sectionDInner, t("output_row_total_cycles_pallet"), formatOptionalInteger(r.totalCyclesPerPallet), "totalCyclesPerPallet");
      sectionD.appendChild(sectionDInner);
      body.appendChild(sectionD);

      // E) Derived times
      var sectionE = document.createElement("div");
      sectionE.className = "output-line-section output-line-section--derived";
      var sectionEInner = document.createElement("div");
      sectionEInner.className = "output-line-section-body";
      addRow(sectionEInner, t("output_row_total_time_picks"), formatOptionalSeconds(r.totalCycleTimePicksS), "totalCycleTimePicksS");
      addRow(sectionEInner, t("output_row_total_time_slip"), formatOptionalSeconds(r.totalCycleTimeSlipSheetS), "totalCycleTimeSlipSheetS");
      addRow(sectionEInner, t("output_row_total_time_pallet"), formatOptionalSeconds(r.totalCycleTimePalletsS), "totalCycleTimePalletsS");
      addRow(sectionEInner, t("output_row_total_robot_time"), formatOptionalSeconds(r.totalStackingTimeRobotS), "totalStackingTimeRobotS");
      sectionE.appendChild(sectionEInner);
      body.appendChild(sectionE);

      // F) Accumulation
      var sectionF = document.createElement("div");
      sectionF.className = "output-line-section output-line-section--accumulation";
      var sectionFInner = document.createElement("div");
      sectionFInner.className = "output-line-section-body";
      addRow(sectionFInner, t("output_row_accum_time_exchange"), formatOptionalSeconds(r.accumulationTimeToPalletExchangeS), "accumulationTimeToPalletExchangeS");
      addRow(sectionFInner, t("output_row_pallet_transition"), formatOptionalSeconds(r.effectivePalletTransitionS), "palletTransitionTime");
      
      var canClearText = r.canClearAccumulation === true ? (t("output_accum_ok") || "Sim") : (r.canClearAccumulation === false ? (t("output_accum_fail") || "Não") : "—");
      var canClearClass = r.canClearAccumulation === true ? "txt-ok" : (r.canClearAccumulation === false ? "txt-fail" : "");
      addRow(sectionFInner, t("output_row_can_clear_accum"), canClearText, "canClearAccumulation", canClearClass);
      
      addRow(sectionFInner, t("output_row_net_removal"), isValidNumber(r.netRemovalBoxesPerSecond) ? formatNumber2(r.netRemovalBoxesPerSecond) : "—", "netRemovalBoxesPerSecond");

      addRow(
        sectionFInner,
        t("output_row_products_accum_slip"),
        formatAccumulationQuantity(r.productNumberInSlipAccumulation),
        "productNumberInSlipAccumulation"
      );
      var slipClear = formatClearanceCyclesCell(r, "slip");
      addRow(
        sectionFInner,
        t("output_row_cycles_clear_slip"),
        slipClear.text,
        "cyclesToEmptySlipAccumulation",
        slipClear.fail ? "output-line-row-value--clearance-fail" : ""
      );
      addRow(
        sectionFInner,
        t("output_row_products_accum_pallet"),
        formatAccumulationQuantity(r.productsNumberInPalletAccumulation),
        "productsNumberInPalletAccumulation"
      );
      var palClear = formatClearanceCyclesCell(r, "pallet");
      addRow(
        sectionFInner,
        t("output_row_cycles_clear_pallet"),
        palClear.text,
        "cyclesToEmptyPalletAccumulation",
        palClear.fail ? "output-line-row-value--clearance-fail" : ""
      );
      sectionF.appendChild(sectionFInner);
      body.appendChild(sectionF);

      // G) Performance
      var sectionG = document.createElement("div");
      sectionG.className = "output-line-section output-line-section--performance";
      var sectionGInner = document.createElement("div");
      sectionGInner.className = "output-line-section-body";
      addRow(sectionGInner, t("output_row_required_time"), formatOptionalSeconds(r.totalTimeOfPalletStackingS), "totalTimeOfPalletStackingS");
      addRow(sectionGInner, t("output_row_robot_occupancy"), formatOptionalPercentage(r.robotOccupancyRate), "robotOccupancyRate");
      addRow(sectionGInner, t("output_row_cycles_per_minute"), isValidNumber(r.cyclesNumberPerMinute) ? formatSeconds(r.cyclesNumberPerMinute) : "—", "cyclesNumberPerMinute");
      addRow(sectionGInner, t("output_row_average_cycle_time"), formatOptionalSeconds(r.averageCycleTimeS), "averageCycleTimeS");
      addRow(sectionGInner, t("output_row_pallets_hour"), formatOptionalPalletsPerHour(r.palletsPerHour), "palletsPerHour");
      sectionG.appendChild(sectionGInner);
      body.appendChild(sectionG);

      lineCardContent.appendChild(body);
      card.appendChild(lineCardContent);
      elLinesOverviewGrid.appendChild(card);
    }

    if (typeof window.initHelpTooltipsForRoot === "function") {
      window.initHelpTooltipsForRoot(elLinesOverviewGrid);
    }
  }

  var outputHeaderInitialized = false;

  function initOutputHeader() {
    if (outputHeaderInitialized) return;
    outputHeaderInitialized = true;
    rebuildLineRecipeGrid();
    rebuildLinesOverviewGrid();
    runFeasibilityMatrix();

    var toggleBtn = document.getElementById("chart-view-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        currentChartView = currentChartView === "stacked" ? "comparison" : "stacked";
        localStorage.setItem("cycle-timer-chart-view", currentChartView);
        var lines = computeLineResults();
        renderGeneralChart(lines);
      });
    }

    // Render inicial do "Geral" (pode ficar em placeholder se nada estiver associado)
    var initialLines = computeLineResults();
    renderGeneralChart(initialLines);
    renderGeneralKpisFromLines(initialLines);

    // Se a quantidade de linhas mudar na aba de INPUTS, refaz as grades
    var linesInput = document.getElementById("robot-lines-count");
    if (linesInput) {
      linesInput.addEventListener("input", function () {
        rebuildLineRecipeGrid();
        rebuildLinesOverviewGrid();
        var lines = computeLineResults();
        renderGeneralChart(lines);
        renderGeneralKpisFromLines(lines);
        if (typeof window.syncRecipeDependentFields === "function") {
          window.syncRecipeDependentFields();
        }
      });
    }

    // Se as receitas forem editadas/adicionadas/removidas, refaz as opções dos selects
    var recipesBody = document.getElementById("recipes-sheet-body");
    if (recipesBody) {
      recipesBody.addEventListener("input", function () {
        rebuildLineRecipeGrid();
        rebuildLinesOverviewGrid();
        var lines = computeLineResults();
        renderGeneralChart(lines);
        renderGeneralKpisFromLines(lines);
        if (typeof window.syncRecipeDependentFields === "function") {
          window.syncRecipeDependentFields();
        }
      });
      recipesBody.addEventListener("click", function () {
        rebuildLineRecipeGrid();
        rebuildLinesOverviewGrid();
        var lines = computeLineResults();
        renderGeneralChart(lines);
        renderGeneralKpisFromLines(lines);
        if (typeof window.syncRecipeDependentFields === "function") {
          window.syncRecipeDependentFields();
        }
      });
    }

    // Tempos do robô por linha: ao editar, atualiza "Geral" (sem mexer em inputs/estado)
    var timesPick = document.getElementById("robot-times-pick");
    var timesSlip = document.getElementById("robot-times-slipsheet");
    var timesPallet = document.getElementById("robot-times-pallet");
    function onTimesInput() {
      var lines = computeLineResults();
      renderGeneralChart(lines);
      renderGeneralKpisFromLines(lines);
      rebuildLinesOverviewGrid();
      if (typeof window.syncRecipeDependentFields === "function") {
        window.syncRecipeDependentFields();
      }
    }
    if (timesPick) timesPick.addEventListener("input", onTimesInput);
    if (timesSlip) timesSlip.addEventListener("input", onTimesInput);
    if (timesPallet) timesPallet.addEventListener("input", onTimesInput);

    window.addEventListener("app-language-changed", function () {
      rebuildLineRecipeGrid();
      rebuildLinesOverviewGrid();
      var lines = computeLineResults();
      renderGeneralChart(lines);
      renderGeneralKpisFromLines(lines);
      if (typeof window.syncRecipeDependentFields === "function") {
        window.syncRecipeDependentFields();
      }
    });
  }

  function renderOutputs(results, status, recipe, robotTimes) {
    var outputsView = document.getElementById("outputs-view");
    // Indicador principal
    if (elOccupancyValue) {
      var occ =
        results && typeof results.robotOccupancyRate === "number"
          ? results.robotOccupancyRate
          : null;
      elOccupancyValue.textContent = formatPercentage(occ);
    }

    if (elStatus) {
      // Status implícito apenas pela cor da ocupação (sem texto).
      elStatus.textContent = "";

      var occPct = null;
      if (results && typeof results.robotOccupancyRate === "number") {
        occPct = results.robotOccupancyRate * 100;
      }

      elStatus.classList.remove(
        "occ--good",
        "occ--warn",
        "occ--bad",
        "status--ok",
        "status--limit",
        "status--fail",
        "status--na"
      );
      if (!isValidNumber(occPct)) {
        elStatus.classList.add("status--na");
      } else {
        var statusOccClass = getOccupancyClassFromPercent(occPct);
        if (statusOccClass) elStatus.classList.add(statusOccClass);
      }
    }

    // Observação: o indicador do topo do bloco "Geral" é controlado por
    // renderGeneralKpisFromLines() (cor por ocupação). Removemos o texto legacy.

    // Production data (somente leitura)
    if (recipe) {
      if (prodMap.productionBpm) {
        prodMap.productionBpm.textContent = formatNumber2(recipe.productionBpm);
      }
      if (prodMap.boxesPerLayer) {
        prodMap.boxesPerLayer.textContent = formatInteger(recipe.boxesPerLayer);
      }
      if (prodMap.layersPerPallet) {
        prodMap.layersPerPallet.textContent = formatInteger(
          recipe.layersPerPallet
        );
      }
      if (prodMap.picksPerLayer) {
        prodMap.picksPerLayer.textContent = formatInteger(
          recipe.picksPerLayer
        );
      }
      if (prodMap.slipSheetBottom) {
        prodMap.slipSheetBottom.textContent = formatInteger(
          recipe.slipSheetBottom
        );
      }
      if (prodMap.slipSheetBetweenLayers) {
        prodMap.slipSheetBetweenLayers.textContent = formatInteger(
          recipe.slipSheetBetweenLayers
        );
      }
      if (prodMap.palletPick) {
        prodMap.palletPick.textContent = formatInteger(recipe.palletPick);
      }
    } else {
      Object.keys(prodMap).forEach(function (key) {
        if (prodMap[key]) prodMap[key].textContent = "—";
      });
    }

    // Fixed times (somente leitura)
    if (robotTimes) {
      if (timesMap.cycleTimePickS) {
        timesMap.cycleTimePickS.textContent = formatSeconds(
          robotTimes.cycleTimePickS
        );
      }
      if (timesMap.cycleTimeSlipSheetS) {
        timesMap.cycleTimeSlipSheetS.textContent = formatSeconds(
          robotTimes.cycleTimeSlipSheetS
        );
      }
      if (timesMap.cycleTimePalletS) {
        timesMap.cycleTimePalletS.textContent = formatSeconds(
          robotTimes.cycleTimePalletS
        );
      }
    } else {
      Object.keys(timesMap).forEach(function (key) {
        if (timesMap[key]) timesMap[key].textContent = "—";
      });
    }

    // Resultados
    if (!results) {
      Object.keys(resMap).forEach(function (key) {
        if (resMap[key]) resMap[key].textContent = "—";
      });
      if (resMap.cyclesToEmptySlipAccumulation) {
        resMap.cyclesToEmptySlipAccumulation.classList.remove("output-cell--clearance-fail");
      }
      if (resMap.cyclesToEmptyPalletAccumulation) {
        resMap.cyclesToEmptyPalletAccumulation.classList.remove("output-cell--clearance-fail");
      }
      if (elKpiPalletsPerHour) elKpiPalletsPerHour.textContent = "—";
      if (elKpiAverageCycle) elKpiAverageCycle.textContent = "—";

      // painel right (inputs)
      Object.keys(rt).forEach(function (k) {
        if (!rt[k]) return;
        rt[k].textContent = "—";
      });
      return;
    }

    if (resMap.totalBoxesOnPallet) {
      resMap.totalBoxesOnPallet.textContent = formatInteger(
        results.totalBoxesOnPallet
      );
    }
    if (resMap.picksPerPallet) {
      resMap.picksPerPallet.textContent = formatInteger(results.picksPerPallet);
    }
    if (resMap.gapBetweenBoxesS) {
      resMap.gapBetweenBoxesS.textContent = formatSeconds(
        results.gapBetweenBoxesS
      );
    }
    if (resMap.boxesPerCycle) {
      resMap.boxesPerCycle.textContent = formatSeconds(results.boxesPerCycle);
    }
    if (resMap.totalCyclesPerPallet) {
      resMap.totalCyclesPerPallet.textContent = formatInteger(
        results.totalCyclesPerPallet
      );
    }
    if (resMap.totalCycleTimePicksS) {
      resMap.totalCycleTimePicksS.textContent = formatSeconds(
        results.totalCycleTimePicksS
      );
    }
    if (resMap.totalCycleTimeSlipSheetS) {
      resMap.totalCycleTimeSlipSheetS.textContent = formatSeconds(
        results.totalCycleTimeSlipSheetS
      );
    }
    if (resMap.totalCycleTimePalletsS) {
      resMap.totalCycleTimePalletsS.textContent = formatSeconds(
        results.totalCycleTimePalletsS
      );
    }
    if (resMap.totalStackingTimeRobotS) {
      resMap.totalStackingTimeRobotS.textContent = formatSeconds(
        results.totalStackingTimeRobotS
      );
    }
    if (resMap.accumulationTimeToPalletExchangeS) {
      resMap.accumulationTimeToPalletExchangeS.textContent = formatSeconds(
        results.accumulationTimeToPalletExchangeS
      );
    }
    if (resMap.productNumberInSlipAccumulation) {
      resMap.productNumberInSlipAccumulation.textContent = formatAccumulationQuantity(
        results.productNumberInSlipAccumulation
      );
    }
    if (resMap.cyclesToEmptySlipAccumulation) {
      var slipCell = formatClearanceCyclesCell(results, "slip");
      resMap.cyclesToEmptySlipAccumulation.textContent = slipCell.text;
      resMap.cyclesToEmptySlipAccumulation.classList.toggle(
        "output-cell--clearance-fail",
        slipCell.fail
      );
    }
    if (resMap.productsNumberInPalletAccumulation) {
      resMap.productsNumberInPalletAccumulation.textContent = formatAccumulationQuantity(
        results.productsNumberInPalletAccumulation
      );
    }
    if (resMap.cyclesToEmptyPalletAccumulation) {
      var palCell = formatClearanceCyclesCell(results, "pallet");
      resMap.cyclesToEmptyPalletAccumulation.textContent = palCell.text;
      resMap.cyclesToEmptyPalletAccumulation.classList.toggle(
        "output-cell--clearance-fail",
        palCell.fail
      );
    }
    if (resMap.totalTimeOfPalletStackingS) {
      resMap.totalTimeOfPalletStackingS.textContent = formatSeconds(
        results.totalTimeOfPalletStackingS
      );
    }
    if (resMap.robotOccupancyRate) {
      resMap.robotOccupancyRate.textContent = formatPercentage(
        results.robotOccupancyRate
      );
    }
    if (resMap.cyclesNumberPerMinute) {
      resMap.cyclesNumberPerMinute.textContent = formatSeconds(
        results.cyclesNumberPerMinute
      );
    }
    if (resMap.averageCycleTimeS) {
      resMap.averageCycleTimeS.textContent = formatSeconds(
        results.averageCycleTimeS
      );
    }
    if (resMap.palletsPerHour) {
      resMap.palletsPerHour.textContent = formatPalletsPerHour(
        results.palletsPerHour
      );
    }

    // KPIs do cabeçalho
    if (elKpiPalletsPerHour) {
      elKpiPalletsPerHour.textContent = formatPalletsPerHour(
        results.palletsPerHour
      );
    }
    if (elKpiAverageCycle) {
      elKpiAverageCycle.textContent = formatSeconds(results.averageCycleTimeS);
    }

    // Preenche painel de validação (aba INPUTS) com métricas existentes
    if (rt.occupancyPct) {
      rt.occupancyPct.textContent = formatPercentage(results.robotOccupancyRate);
    }
    if (rt.cyclesPerMin) {
      rt.cyclesPerMin.textContent = formatSeconds(results.cyclesNumberPerMinute);
    }
    // Observação: o antigo feed técnico (Números críticos / SECTION_EXPLAIN / Detalhe)
    // foi removido da UI. A consolidação do bloco GERAL e os cards multi-linear por linha
    // permanecem ativos e são renderizados ao final.

    // destaque visual leve quando os resultados são atualizados
    if (outputsView) {
      outputsView.classList.remove("output-updated");
      // força reflow para reiniciar a animação
      // eslint-disable-next-line no-unused-expressions
      outputsView.offsetHeight;
      outputsView.classList.add("output-updated");
    }

    // Atualiza contexto textual da linha selecionada após novo cálculo
    updateLineContext();

    // GERAL (consolidação oficial) deve sobrescrever o painel do topo
    // que foi preenchido pelo cenário global do app.js.
    var lines = computeLineResults();
    renderGeneralChart(lines);
    renderGeneralKpisFromLines(lines);

    // Garante que a matriz de viabilidade seja atualizada sempre que os outputs mudarem (ex: tempo do robô)
    if (typeof window.runFeasibilityMatrix === "function") {
      window.runFeasibilityMatrix();
    }
  }

  // expõe função global usada por app.js
  window.renderOutputs = renderOutputs;
  window.getCycleTimerRobotTimesByLine = getRobotTimesByLine;

  // Helpers para o novo módulo de viabilidade
  window.getCycleTimerRecipeOptions = getRecipeOptions;
  window.getCycleTimerRecipeByRowId = getRecipeByRowId;
  window.getCycleTimerIsValidNumber = isValidNumber;
  window.getCycleTimerI18nT = t;
  window.getCycleTimerOccupancyClass = getOccupancyClassFromRate;

  /**
   * Snapshot para exportação PDF: linhas com rótulo de receita e agregados Geral.
   */
  window.getCycleTimerExportPayload = function () {
    var lines = computeLineResults();
    var options = getRecipeOptions();
    var labelsByRowId = {};
    var oi;
    for (oi = 0; oi < options.length; oi++) {
      labelsByRowId[String(options[oi].id)] = options[oi].label;
    }
    var outLines = [];
    var li;
    for (li = 0; li < lines.length; li++) {
      var ln = lines[li];
      var disp = "—";
      if (ln.recipeRowId != null && String(ln.recipeRowId) !== "") {
        var rid = String(ln.recipeRowId);
        if (labelsByRowId[rid]) {
          disp = labelsByRowId[rid];
        } else if (ln.recipe && ln.recipe.nomeReceita) {
          disp = ln.recipe.nomeReceita;
        } else {
          disp = t("output_recipe_prefix") + " " + rid;
        }
      }
      outLines.push({
        lineIndex: ln.lineIndex,
        recipeRowId: ln.recipeRowId,
        recipe: ln.recipe,
        robotTimes: ln.robotTimes,
        results: ln.results,
        recipeDisplayLabel: disp
      });
    }
    return {
      lines: outLines,
      general: computeGeneralAggregatesFromLines(lines)
    };
  };

  window.collectCycleTimerRecipesFromSheet = function () {
    var body = document.getElementById("recipes-sheet-body");
    if (!body) return [];
    var rows = body.querySelectorAll("tr.sheet-row");
    var out = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var rowId = row.getAttribute("data-row") || String(i + 1);
      var r = getRecipeByRowId(rowId);
      if (!r) continue;
      out.push({
        rowId: String(rowId),
        nomeReceita: r.nomeReceita,
        productionBpm: r.productionBpm,
        boxesPerLayer: r.boxesPerLayer,
        layersPerPallet: r.layersPerPallet,
        picksPerLayer: r.picksPerLayer,
        slipSheetBottom: r.slipSheetBottom,
        slipSheetBetweenLayers: r.slipSheetBetweenLayers,
        palletPick: r.palletPick
      });
    }
    return out;
  };

  window.rebuildCycleTimerOutputGrids = function () {
    rebuildLineRecipeGrid();
    rebuildLinesOverviewGrid();
    var lines = computeLineResults();
    renderGeneralChart(lines);
    renderGeneralKpisFromLines(lines);
    if (typeof window.runFeasibilityMatrix === "function") {
      window.runFeasibilityMatrix();
    }
    if (typeof window.syncRecipeDependentFields === "function") {
      window.syncRecipeDependentFields();
    }
  };



  window.applyCycleTimerLineRecipeMap = function (map) {
    var k;
    for (k in lineRecipeMap) {
      if (Object.prototype.hasOwnProperty.call(lineRecipeMap, k)) {
        delete lineRecipeMap[k];
      }
    }
    if (!map || typeof map !== "object") return;
    for (k in map) {
      if (!Object.prototype.hasOwnProperty.call(map, k)) continue;
      var lineIdx = parseInt(k, 10);
      if (!isFinite(lineIdx) || lineIdx < 1 || lineIdx > 6) continue;
      var val = map[k];
      if (val != null && String(val) !== "") {
        lineRecipeMap[lineIdx] = String(val);
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      initOutputHeader();
    });
  } else {
    initOutputHeader();
  }
})();

