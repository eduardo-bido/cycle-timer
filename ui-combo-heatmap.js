/**
 * Módulo: Heatmap de Combinações de SKUs (Campo Minado)
 *
 * Renderiza um grid NxN no Output mostrando todas as combinações de receitas
 * entre as linhas ativas. Cada célula indica se a combinação atende (verde)
 * ou não atende (vermelho) a capacidade do robô (ocupação ≤ 95%).
 *
 * Visível apenas quando numberOfLines >= 2.
 */
(function () {

  function getT() {
    return window.getCycleTimerI18nT || function (k) { return k; };
  }

  function getLang() {
    return window.APP_LANG || "pt";
  }

  function parseNum(val) {
    if (val === null || val === undefined || val === "") return 0;
    var n = parseFloat(String(val).replace(",", "."));
    return isNaN(n) ? 0 : n;
  }

  /**
   * Calcula a ocupação combinada de um par de receitas (uma por linha).
   * Retorna { totalOcc, line1Occ, line2Occ, status }
   */
  function computePairOccupancy(recipes, maxLines, palTransS) {
    var totalOcc = 0;
    var lineOccs = [];

    // Fase 1: coletar burden de cada linha
    var linePauseContrib = {};
    for (var ly = 0; ly < maxLines; ly++) {
      var lineIdx = ly + 1;
      var rec = recipes[ly];
      var rt = (typeof window.getCycleTimerRobotTimesByLine === "function")
        ? window.getCycleTimerRobotTimesByLine(lineIdx)
        : { cycleTimePickS: 0, cycleTimeSlipSheetS: 0, cycleTimePalletS: 0 };

      if (!rec || !rt) {
        linePauseContrib[lineIdx] = { palletBurdenS: 0, slipBurdenS: 0, pickBurdenS: 0 };
        continue;
      }

      var palletPick = parseNum(rec.palletPick);
      var tPallet = parseNum(rt.cycleTimePalletS);
      var palletBurden = (palletPick > 0 && tPallet > 0) ? palletPick * tPallet : palTransS;

      var slipBottom = parseNum(rec.slipSheetBottom);
      var slipBetween = parseNum(rec.slipSheetBetweenLayers);
      var tSlip = parseNum(rt.cycleTimeSlipSheetS);
      var slipBurden = (slipBottom + slipBetween) * tSlip;

      var pickBurden = parseNum(rt.cycleTimePickS);

      linePauseContrib[lineIdx] = {
        palletBurdenS: palletBurden,
        slipBurdenS: slipBurden,
        pickBurdenS: pickBurden
      };
    }

    // Fase 2: calcular ocupação por linha com burden das outras
    for (var i = 0; i < maxLines; i++) {
      var lineIndex = i + 1;
      var recipe = recipes[i];
      var robotTimes = (typeof window.getCycleTimerRobotTimesByLine === "function")
        ? window.getCycleTimerRobotTimesByLine(lineIndex)
        : { cycleTimePickS: 0, cycleTimeSlipSheetS: 0, cycleTimePalletS: 0 };

      if (!recipe || parseNum(recipe.productionBpm) <= 0) {
        lineOccs.push(0);
        continue;
      }

      // Somar burden das outras linhas
      var otherBurden = 0;
      for (var ox = 1; ox <= maxLines; ox++) {
        if (ox === lineIndex) continue;
        var c = linePauseContrib[ox];
        if (c) otherBurden += c.palletBurdenS + c.slipBurdenS + c.pickBurdenS;
      }

      var engineInput = {
        productionBpm: recipe.productionBpm,
        boxesPerLayer: recipe.boxesPerLayer,
        layersPerPallet: recipe.layersPerPallet,
        picksPerLayer: recipe.picksPerLayer,
        slipSheetBottom: recipe.slipSheetBottom,
        slipSheetBetweenLayers: recipe.slipSheetBetweenLayers,
        palletPick: recipe.palletPick,
        cycleTimePickS: robotTimes.cycleTimePickS,
        cycleTimeSlipSheetS: robotTimes.cycleTimeSlipSheetS,
        cycleTimePalletS: robotTimes.cycleTimePalletS,
        palletTransitionTimeS: palTransS,
        worstCaseOtherLinesBurdenS: otherBurden
      };

      if (typeof window.computeCycleTimer === "function") {
        var res = window.computeCycleTimer(engineInput);
        var occ = (res && typeof res.robotOccupancyRate === "number") ? res.robotOccupancyRate : 0;
        lineOccs.push(occ);
        totalOcc += occ;
      } else {
        lineOccs.push(0);
      }
    }

    return {
      totalOcc: totalOcc,
      lineOccs: lineOccs,
      status: totalOcc <= 0.95 ? "ok" : "fail"
    };
  }

  // ─── Renderização Principal ───
  window.runComboHeatmap = function () {
    var section = document.getElementById("combo-heatmap-section");
    var container = document.getElementById("combo-heatmap-container");
    var summary = document.getElementById("combo-heatmap-summary");
    if (!section || !container) return;

    var linesInput = document.getElementById("robot-lines-count");
    var maxLines = linesInput ? (parseInt(linesInput.value, 10) || 1) : 1;
    maxLines = Math.min(Math.max(maxLines, 1), 6);

    // Visível apenas com 2+ linhas
    if (maxLines < 2) {
      section.hidden = true;
      return;
    }
    section.hidden = false;

    var baseRecipes = [];
    if (typeof window.getCycleTimerRecipeOptions === "function") {
      baseRecipes = window.getCycleTimerRecipeOptions();
    }
    if (baseRecipes.length === 0) {
      section.hidden = true;
      return;
    }

    // Pré-carregar todas as receitas completas
    var fullRecipes = [];
    for (var idx = 0; idx < baseRecipes.length; idx++) {
      var bRec = baseRecipes[idx];
      var fRec = null;
      if (typeof window.getCycleTimerRecipeByRowId === "function") {
        fRec = window.getCycleTimerRecipeByRowId(bRec.id);
      }
      if (fRec) {
        fRec.id = bRec.id;
        fRec.label = bRec.label;
        fullRecipes.push(fRec);
      }
    }

    if (fullRecipes.length === 0) {
      section.hidden = true;
      return;
    }

    var palletTransitionEl = document.getElementById("robot-transition-time");
    var palTransS = palletTransitionEl ? (parseNum(palletTransitionEl.value) || 10) : 10;

    var t = getT();
    var currentMap = (typeof window.getCycleTimerLineRecipeMap === "function")
      ? window.getCycleTimerLineRecipeMap() : {};

    // ─── Pré-cálculo de todas as combinações ───
    // Para 2 linhas: grid simples NxN (Linha 1 = colunas, Linha 2 = linhas)
    // Para 3+ linhas: as linhas extras ficam fixas com a receita atualmente mapeada
    var gridData = [];
    var okCount = 0;
    var failCount = 0;
    var totalCells = 0;

    for (var row = 0; row < fullRecipes.length; row++) {
      gridData[row] = [];
      for (var col = 0; col < fullRecipes.length; col++) {
        // Montar array de receitas por linha
        var recipesForCombo = [];
        for (var lx = 1; lx <= maxLines; lx++) {
          if (lx === 1) {
            recipesForCombo.push(fullRecipes[col]);
          } else if (lx === 2) {
            recipesForCombo.push(fullRecipes[row]);
          } else {
            // Linhas 3+ usam a receita mapeada atualmente
            var mappedId = currentMap[lx];
            var mappedRec = null;
            if (mappedId) {
              for (var mx = 0; mx < fullRecipes.length; mx++) {
                if (String(fullRecipes[mx].id) === String(mappedId)) {
                  mappedRec = fullRecipes[mx];
                  break;
                }
              }
            }
            recipesForCombo.push(mappedRec);
          }
        }

        var result = computePairOccupancy(recipesForCombo, maxLines, palTransS);
        gridData[row][col] = {
          line1Recipe: fullRecipes[col],
          line2Recipe: fullRecipes[row],
          result: result
        };

        totalCells++;
        if (result.status === "ok") {
          okCount++;
        } else {
          failCount++;
        }
      }
    }

    // ─── Renderizar Summary Card ───
    if (summary) {
      summary.innerHTML = "";

      var pct = totalCells > 0 ? (okCount / totalCells) * 100 : 0;

      var summaryInner = document.createElement("div");
      summaryInner.className = "combo-heatmap-summary-inner";

      // Stats row
      var statsRow = document.createElement("div");
      statsRow.className = "combo-heatmap-stats";

      var pctEl = document.createElement("span");
      pctEl.className = "combo-heatmap-stats-pct";
      pctEl.textContent = pct.toFixed(1) + "%";

      var descEl = document.createElement("span");
      descEl.className = "combo-heatmap-stats-desc";
      descEl.textContent = (getLang() === "en")
        ? "of combinations meet capacity (" + okCount + " of " + totalCells + ")"
        : "das combinações atendem a capacidade (" + okCount + " de " + totalCells + ")";

      statsRow.appendChild(pctEl);
      statsRow.appendChild(descEl);
      summaryInner.appendChild(statsRow);

      // Progress bar
      var barWrap = document.createElement("div");
      barWrap.className = "combo-heatmap-bar-wrap";

      var barFill = document.createElement("div");
      barFill.className = "combo-heatmap-bar-fill";
      barFill.style.width = pct + "%";
      if (pct > 80) {
        barFill.classList.add("combo-heatmap-bar-fill--success");
      } else if (pct > 50) {
        barFill.classList.add("combo-heatmap-bar-fill--warning");
      } else {
        barFill.classList.add("combo-heatmap-bar-fill--danger");
      }

      barWrap.appendChild(barFill);
      summaryInner.appendChild(barWrap);

      // Legend chips
      var legendRow = document.createElement("div");
      legendRow.className = "combo-heatmap-legend";

      var okChip = document.createElement("span");
      okChip.className = "combo-heatmap-legend-chip combo-heatmap-legend-chip--ok";
      okChip.innerHTML = "<span class='combo-heatmap-legend-dot combo-heatmap-legend-dot--ok'></span>" +
        (getLang() === "en" ? "Meets ≤95%" : "Atende ≤95%") +
        " <strong>(" + okCount + ")</strong>";

      var failChip = document.createElement("span");
      failChip.className = "combo-heatmap-legend-chip combo-heatmap-legend-chip--fail";
      failChip.innerHTML = "<span class='combo-heatmap-legend-dot combo-heatmap-legend-dot--fail'></span>" +
        (getLang() === "en" ? "Exceeds >95%" : "Não atende >95%") +
        " <strong>(" + failCount + ")</strong>";

      legendRow.appendChild(okChip);
      legendRow.appendChild(failChip);
      summaryInner.appendChild(legendRow);

      summary.appendChild(summaryInner);
    }

    // ─── Renderizar Grid Table ───
    container.innerHTML = "";

    var tableWrap = document.createElement("div");
    tableWrap.className = "combo-heatmap-table-wrap";

    var table = document.createElement("table");
    table.className = "combo-heatmap-table";

    // Eixo labels
    var line1Label = (getLang() === "en") ? "Line 1" : "Linha 1";
    var line2Label = (getLang() === "en") ? "Line 2" : "Linha 2";

    // Header row (corner + SKU names for Line 1)
    var thead = document.createElement("thead");

    // Axis label row
    var axisRow = document.createElement("tr");
    var axisCorner = document.createElement("th");
    axisCorner.className = "combo-heatmap-corner";
    axisCorner.rowSpan = 2;
    // Diagonal label for corner
    axisCorner.innerHTML = "<div class='combo-heatmap-corner-inner'>" +
      "<span class='combo-heatmap-corner-x'>→ " + line1Label + "</span>" +
      "<span class='combo-heatmap-corner-y'>↓ " + line2Label + "</span>" +
      "</div>";
    axisRow.appendChild(axisCorner);

    // Sku header cells for line 1
    var headerRow = document.createElement("tr");
    for (var hi = 0; hi < fullRecipes.length; hi++) {
      var th = document.createElement("th");
      th.className = "combo-heatmap-col-header";
      var headerSpan = document.createElement("span");
      headerSpan.className = "combo-heatmap-col-header-text";
      headerSpan.textContent = fullRecipes[hi].label || ("SKU " + fullRecipes[hi].id);
      th.appendChild(headerSpan);
      axisRow.appendChild(th);
    }

    thead.appendChild(axisRow);
    table.appendChild(thead);

    // Body (each row = one SKU on Line 2)
    var tbody = document.createElement("tbody");

    for (var ri = 0; ri < fullRecipes.length; ri++) {
      var tr = document.createElement("tr");

      // Row header (SKU name for Line 2)
      var rowTh = document.createElement("th");
      rowTh.className = "combo-heatmap-row-header";
      rowTh.textContent = fullRecipes[ri].label || ("SKU " + fullRecipes[ri].id);
      tr.appendChild(rowTh);

      for (var ci = 0; ci < fullRecipes.length; ci++) {
        var cellData = gridData[ri][ci];
        var td = document.createElement("td");
        td.className = "combo-heatmap-cell";

        var isOk = cellData.result.status === "ok";
        td.classList.add(isOk ? "combo-heatmap-cell--ok" : "combo-heatmap-cell--fail");

        // Check if this is the currently active combination
        var isActive = (
          String(currentMap[1]) === String(cellData.line1Recipe.id) &&
          String(currentMap[2]) === String(cellData.line2Recipe.id)
        );
        if (isActive) {
          td.classList.add("combo-heatmap-cell--active");
        }

        // Occupancy text
        var occText = (cellData.result.totalOcc * 100).toFixed(1) + "%";
        // O texto não é mais adicionado na célula, apenas no tooltip

        // Tooltip
        var tooltipParts = [];
        tooltipParts.push(line1Label + ": " + (cellData.line1Recipe.label || "SKU " + cellData.line1Recipe.id));
        tooltipParts.push(line2Label + ": " + (cellData.line2Recipe.label || "SKU " + cellData.line2Recipe.id));
        tooltipParts.push((getLang() === "en" ? "Combined occupancy: " : "Ocupação combinada: ") + occText);
        if (cellData.result.lineOccs.length >= 2) {
          tooltipParts.push(line1Label + ": " + (cellData.result.lineOccs[0] * 100).toFixed(1) + "%");
          tooltipParts.push(line2Label + ": " + (cellData.result.lineOccs[1] * 100).toFixed(1) + "%");
        }
        td.title = tooltipParts.join("\n");

        // Click handler
        (function (l1Id, l2Id) {
          td.addEventListener("click", function () {
            applyCombination(l1Id, l2Id);
          });
        })(cellData.line1Recipe.id, cellData.line2Recipe.id);

        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    tableWrap.appendChild(table);
    container.appendChild(tableWrap);
  };

  function applyCombination(line1RecipeId, line2RecipeId) {
    var newMap = {};
    if (typeof window.getCycleTimerLineRecipeMap === "function") {
      var old = window.getCycleTimerLineRecipeMap();
      for (var k in old) {
        if (Object.prototype.hasOwnProperty.call(old, k)) {
          newMap[k] = old[k];
        }
      }
    }

    newMap[1] = String(line1RecipeId);
    newMap[2] = String(line2RecipeId);

    if (typeof window.applyCycleTimerLineRecipeMap === "function") {
      window.applyCycleTimerLineRecipeMap(newMap);
    }
    if (typeof window.rebuildCycleTimerOutputGrids === "function") {
      window.rebuildCycleTimerOutputGrids();
    }

    if (window.showCycleTimerInsight) {
      var title = (getLang() === "en") ? "Combination applied" : "Combinação aplicada";
      window.showCycleTimerInsight(title, "L1 + L2", "success");
    }
  }

})();
