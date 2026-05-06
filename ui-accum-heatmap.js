/**
 * Módulo: Heatmap de Limpeza de Acúmulo Multilinear & Termômetro de Saturação
 *
 * Renderiza uma matriz N_recipes × N_recipes para 2 linhas,
 * ou um Termômetro de Ocupação Global para 3 a 6 linhas.
 */
(function () {

  function getT() {
    return window.getCycleTimerI18nT || function (k) { return k; };
  }

  function parseNum(val) {
    if (val === null || val === undefined || val === "") return 0;
    var n = parseFloat(String(val).replace(",", "."));
    return isNaN(n) ? 0 : n;
  }

  // ─── Algoritmo de Colapso Multilinear (Para 2 Linhas - Heatmap) ──────────────
  function evalCollapseAlgorithm(rec1, rec2, rt1, rt2, palTransS) {
    if (!rec1 || !rec2 || !rt1 || !rt2) return { overall: "na", details: null };

    var prod1 = parseNum(rec1.productionBpm);
    var prod2 = parseNum(rec2.productionBpm);
    if (prod1 <= 0 || prod2 <= 0) return { overall: "na", details: null };

    var cxCam1 = parseNum(rec1.boxesPerLayer);
    var pickCam1 = parseNum(rec1.picksPerLayer);
    var tPick1 = parseNum(rt1.cycleTimePickS);
    var camPallet1 = parseNum(rec1.layersPerPallet);
    var palPick1 = parseNum(rec1.palletPick);
    var tPallet1 = parseNum(rt1.cycleTimePalletS);
    var slipsBottom1 = parseNum(rec1.slipSheetBottom);
    var slipsBetween1 = parseNum(rec1.slipSheetBetweenLayers);
    var tSlip1 = parseNum(rt1.cycleTimeSlipSheetS);

    var cxCam2 = parseNum(rec2.boxesPerLayer);
    var pickCam2 = parseNum(rec2.picksPerLayer);
    var tPick2 = parseNum(rt2.cycleTimePickS);
    var camPallet2 = parseNum(rec2.layersPerPallet);
    var palPick2 = parseNum(rec2.palletPick);
    var tPallet2 = parseNum(rt2.cycleTimePalletS);
    var slipsBottom2 = parseNum(rec2.slipSheetBottom);
    var slipsBetween2 = parseNum(rec2.slipSheetBetweenLayers);
    var tSlip2 = parseNum(rt2.cycleTimeSlipSheetS);

    if (cxCam1 <= 0 || pickCam1 <= 0 || tPick1 <= 0 || camPallet1 <= 0 ||
        cxCam2 <= 0 || pickCam2 <= 0 || tPick2 <= 0 || camPallet2 <= 0) {
      return { overall: "warn", details: null };
    }

    var pallet1Time = (palPick1 > 0 && tPallet1 > 0) ? (palPick1 * tPallet1) : palTransS;
    var pallet2Time = (palPick2 > 0 && tPallet2 > 0) ? (palPick2 * tPallet2) : palTransS;

    var slips1Time = (slipsBottom1 + slipsBetween1) * tSlip1;
    var slips2Time = (slipsBottom2 + slipsBetween2) * tSlip2;

    var tempoApagaoSeg = pallet1Time + slips1Time + pallet2Time + slips2Time + Math.max(tPick1, tPick2);

    var taxaChegadaTotalCxMin = prod1 + prod2;
    var acumuloInicial = taxaChegadaTotalCxMin * (tempoApagaoSeg / 60);

    var mediaCxPick1 = cxCam1 / pickCam1;
    var mediaCxPick2 = cxCam2 / pickCam2;
    var tempoCicloDuplo = tPick1 + tPick2;
    var taxaRemocaoRoboCxMin = ((mediaCxPick1 + mediaCxPick2) / tempoCicloDuplo) * 60;

    var taxaLimpezaLiquida = taxaRemocaoRoboCxMin - taxaChegadaTotalCxMin;

    if (taxaLimpezaLiquida <= 0) {
      return {
        overall: "fail",
        details: {
          apagaoS: tempoApagaoSeg,
          acumulo: acumuloInicial,
          liquida: taxaLimpezaLiquida,
          tLimpar: null,
          tLimite: null,
          msg: "Robô mais lento que as linhas"
        }
      };
    }

    var tempoParaLimparMin = acumuloInicial / taxaLimpezaLiquida;

    var tempoPallet1Min = (cxCam1 * camPallet1) / prod1;
    var tempoPallet2Min = (cxCam2 * camPallet2) / prod2;
    var tempoLimiteMin = Math.min(tempoPallet1Min, tempoPallet2Min);

    var overall = tempoParaLimparMin <= tempoLimiteMin ? "ok" : "fail";

    return {
      overall: overall,
      details: {
        apagaoS: tempoApagaoSeg,
        acumulo: acumuloInicial,
        liquida: taxaLimpezaLiquida,
        tLimpar: tempoParaLimparMin,
        tLimite: tempoLimiteMin,
        msg: overall === "ok" ? "Dentro do limite" : "Estoura limite do pallet"
      }
    };
  }

  // ─── Lógica do Termômetro de Saturação (Para 3 a 6 Linhas) ──────────────────
  function calculateLineOccupancy(recipe, rt, palTransS) {
    if (!recipe || !rt) return { weight: 0, tPickMin: 0, tSetupMin: 0, label: "Desligada", empty: true };
    var prod = parseNum(recipe.productionBpm);
    if (prod <= 0) return { weight: 0, tPickMin: 0, tSetupMin: 0, label: recipe.label || "Desligada", empty: true };

    var cxCam = parseNum(recipe.boxesPerLayer) || 1;
    var pickCam = parseNum(recipe.picksPerLayer) || 1;
    var cxPerPick = cxCam / pickCam;
    
    var tPick = parseNum(rt.cycleTimePickS);
    // Passo 1: Tempo Consumido em Picks por Minuto
    var tPickMin = (prod / cxPerPick) * tPick;

    var camPallet = parseNum(recipe.layersPerPallet) || 1;
    // Tempo de Vida do Pallet em Minutos
    var palletLifeTimeMin = (cxCam * camPallet) / prod;

    var palPick = parseNum(recipe.palletPick);
    var tPallet = parseNum(rt.cycleTimePalletS);
    var palletTime = (palPick > 0 && tPallet > 0) ? (palPick * tPallet) : palTransS;

    var slipsBottom = parseNum(recipe.slipSheetBottom);
    var slipsBetween = parseNum(recipe.slipSheetBetweenLayers);
    var tSlip = parseNum(rt.cycleTimeSlipSheetS);
    var slipsTime = (slipsBottom + slipsBetween) * tSlip;

    // Passo 2: Tempo Consumido em Setup por Minuto
    var tSetupMin = (1 / palletLifeTimeMin) * (palletTime + slipsTime);

    // Passo 3: O Peso Individual na Barra do Termômetro (%)
    var weight = ((tPickMin + tSetupMin) / 60) * 100;

    return {
      weight: weight,
      tPickMin: tPickMin,
      tSetupMin: tSetupMin,
      label: recipe.label,
      empty: false
    };
  }

  // ─── Renderização principal ───────────────────────────────────────────────────
  window.runAccumHeatmap = function () {
    var section = document.getElementById("accum-heatmap-section");
    var container = document.getElementById("accum-heatmap-container");
    if (!section || !container) return;

    var linesInput = document.getElementById("robot-lines-count");
    var maxLines = linesInput ? (parseInt(linesInput.value, 10) || 1) : 1;
    maxLines = Math.min(Math.max(maxLines, 1), 6);

    if (maxLines < 2) {
      section.hidden = true;
      return;
    }
    section.hidden = false;

    var recipes = [];
    if (typeof window.getCycleTimerRecipeOptions === "function") {
      recipes = window.getCycleTimerRecipeOptions();
    }
    if (recipes.length === 0) {
      section.hidden = true;
      return;
    }

    var palletTransitionEl = document.getElementById("robot-transition-time");
    var palTransS = palletTransitionEl ? (parseNum(palletTransitionEl.value) || 10) : 10;
    
    var t = getT();
    var currentMap = (typeof window.getCycleTimerLineRecipeMap === "function")
      ? window.getCycleTimerLineRecipeMap() : {};

    container.innerHTML = "";

    var headerDesc = section.querySelector(".panel-description");
    var headerTitle = section.querySelector(".panel-title");

    // ===== MODO: TERMÔMETRO DE SATURAÇÃO (3 a 6 Linhas) =====
    if (maxLines >= 3) {
      if (headerTitle) headerTitle.textContent = "Termômetro de Saturação (Carga do Robô)";
      if (headerDesc) headerDesc.textContent = "O robô possui 60s/min. Avaliando o peso total do setup selecionado nas " + maxLines + " linhas. Se a carga passar de 100%, o sistema colapsará no pior caso simultâneo.";

      var linesData = [];
      var totalStress = 0;

      for (var i = 1; i <= maxLines; i++) {
        var recipeId = currentMap[i];
        var recipe = null;
        if (recipeId && typeof window.getCycleTimerRecipeByRowId === "function") {
          recipe = window.getCycleTimerRecipeByRowId(recipeId);
        }
        var rtObj = (typeof window.getCycleTimerRobotTimesByLine === "function") 
          ? window.getCycleTimerRobotTimesByLine(i) 
          : { cycleTimePickS: 0, cycleTimeSlipSheetS: 0, cycleTimePalletS: 0 };
        
        var occ = calculateLineOccupancy(recipe, rtObj, palTransS);
        linesData.push({ line: i, data: occ });
        totalStress += occ.weight;
      }

      var thermoContainer = document.createElement("div");
      thermoContainer.className = "ah-thermometer-container";

      var barWrapper = document.createElement("div");
      barWrapper.className = "ah-thermo-bar-wrapper";
      
      var barFill = document.createElement("div");
      barFill.className = "ah-thermo-bar-fill";
      // Limit visually to 100% so it doesn't break out
      var visualWidth = Math.min(totalStress, 100);
      barFill.style.width = visualWidth + "%";
      
      var isColapso = totalStress > 100;
      if (isColapso) {
        barFill.style.backgroundColor = "var(--vs-danger, #ef4444)";
      } else if (totalStress > 85) {
        barFill.style.backgroundColor = "var(--vs-warning, #f59e0b)";
      } else {
        barFill.style.backgroundColor = "var(--vs-success, #10b981)";
      }

      var barText = document.createElement("div");
      barText.className = "ah-thermo-bar-text";
      barText.textContent = totalStress.toFixed(1) + "% DE CARGA";

      barWrapper.appendChild(barFill);
      barWrapper.appendChild(barText);
      thermoContainer.appendChild(barWrapper);

      var verdict = document.createElement("div");
      verdict.className = "ah-thermo-verdict " + (isColapso ? "ah-thermo-verdict--fail" : "ah-thermo-verdict--ok");
      if (isColapso) {
        verdict.innerHTML = "<strong>\u26A0 ALERTA:</strong> Capacidade de recuperação excedida. O sistema colapsará no próximo apagão simultâneo.";
      } else {
        verdict.innerHTML = "<strong>\u2713 OK:</strong> O sistema sobrevive ao apagão simultâneo.";
      }
      thermoContainer.appendChild(verdict);

      var list = document.createElement("ul");
      list.className = "ah-thermo-list";
      for (var j = 0; j < linesData.length; j++) {
        var li = document.createElement("li");
        var d = linesData[j].data;
        var weightStr = d.empty ? "0%" : d.weight.toFixed(1) + "%";
        var labelStr = d.label;
        if (!labelStr) labelStr = "Desligada";
        
        li.innerHTML = "<span>Linha " + linesData[j].line + ":</span> <strong>" + labelStr + "</strong> <span class='ah-thermo-weight'>" + weightStr + "</span>";
        list.appendChild(li);
      }
      thermoContainer.appendChild(list);

      container.appendChild(thermoContainer);
      return;
    }

    // ===== MODO: HEATMAP DE COLAPSO (2 Linhas) =====
    if (headerTitle) headerTitle.textContent = t("accum_heatmap_title");
    if (headerDesc) headerDesc.textContent = t("accum_heatmap_desc");

    var rtL1 = (typeof window.getCycleTimerRobotTimesByLine === "function")
      ? window.getCycleTimerRobotTimesByLine(1)
      : { cycleTimePickS: 0, cycleTimeSlipSheetS: 0, cycleTimePalletS: 0 };
    var rtL2 = (typeof window.getCycleTimerRobotTimesByLine === "function")
      ? window.getCycleTimerRobotTimesByLine(2)
      : { cycleTimePickS: 0, cycleTimeSlipSheetS: 0, cycleTimePalletS: 0 };

    var wrapper = document.createElement("div");
    wrapper.className = "ah-wrapper";

    var table = document.createElement("table");
    table.className = "ah-table";

    var thead = document.createElement("thead");
    var headerRow = document.createElement("tr");

    var cornerTh = document.createElement("th");
    cornerTh.className = "ah-corner";
    var cornerInner = document.createElement("div");
    cornerInner.className = "ah-corner-labels";
    var cornerL1 = document.createElement("span");
    cornerL1.textContent = t("output_line_prefix") + " 1";
    var cornerSep = document.createElement("span");
    cornerSep.className = "ah-corner-sep";
    cornerSep.textContent = "\u2572";
    var cornerL2 = document.createElement("span");
    cornerL2.textContent = t("output_line_prefix") + " 2";
    cornerInner.appendChild(cornerL1);
    cornerInner.appendChild(cornerSep);
    cornerInner.appendChild(cornerL2);
    cornerTh.appendChild(cornerInner);
    headerRow.appendChild(cornerTh);

    for (var ci = 0; ci < recipes.length; ci++) {
      var colHead = document.createElement("th");
      colHead.className = "ah-col-header";
      colHead.textContent = recipes[ci].label;
      colHead.title = recipes[ci].label;
      if (currentMap[2] === String(recipes[ci].id)) {
        colHead.classList.add("ah-col-header--active");
      }
      headerRow.appendChild(colHead);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    var tbody = document.createElement("tbody");
    for (var ri = 0; ri < recipes.length; ri++) {
      var recipeI = (typeof window.getCycleTimerRecipeByRowId === "function")
        ? window.getCycleTimerRecipeByRowId(recipes[ri].id) : null;

      var row = document.createElement("tr");

      var rowLabelTh = document.createElement("th");
      rowLabelTh.className = "ah-row-label";
      rowLabelTh.textContent = recipes[ri].label;
      rowLabelTh.title = recipes[ri].label;
      if (currentMap[1] === String(recipes[ri].id)) {
        rowLabelTh.classList.add("ah-row-label--active");
      }
      row.appendChild(rowLabelTh);

      for (var cj = 0; cj < recipes.length; cj++) {
        var recipeJ = (typeof window.getCycleTimerRecipeByRowId === "function")
          ? window.getCycleTimerRecipeByRowId(recipes[cj].id) : null;

        var result = evalCollapseAlgorithm(recipeI, recipeJ, rtL1, rtL2, palTransS);
        var overall = result.overall;
        var details = result.details;

        var cell = document.createElement("td");
        cell.className = "ah-cell";

        if (ri === cj) cell.classList.add("ah-cell--diagonal");

        if (currentMap[1] === String(recipes[ri].id) && currentMap[2] === String(recipes[cj].id)) {
          cell.classList.add("ah-cell--selected");
        }

        cell.classList.add("ah-cell--" + overall);

        var icon = document.createElement("span");
        icon.className = "ah-cell-icon";
        icon.textContent = overall === "ok" ? "\u2713" : (overall === "fail" ? "\u2717" : "\u2014");
        cell.appendChild(icon);

        var tooltipParts = [];
        if (recipeI) tooltipParts.push("L1: " + recipes[ri].label);
        if (recipeJ) tooltipParts.push("L2: " + recipes[cj].label);
        
        if (details) {
          tooltipParts.push("");
          tooltipParts.push("Apag\u00E3o Simult\u00E2neo: " + details.apagaoS.toFixed(1) + "s");
          tooltipParts.push("Ac\u00FAmulo Inicial: " + details.acumulo.toFixed(1) + " cx");
          tooltipParts.push("Taxa Limpeza L\u00EDq.: " + details.liquida.toFixed(1) + " cx/min");
          
          if (details.tLimpar !== null) {
            tooltipParts.push("Tempo p/ Limpar: " + details.tLimpar.toFixed(2) + " min");
            tooltipParts.push("Limite (Menor Pallet): " + details.tLimite.toFixed(2) + " min");
          }
          tooltipParts.push("Status: " + details.msg);
        } else {
          tooltipParts.push("Status: " + (overall === "warn" ? "Dados Incompletos" : "N/D"));
        }
        
        cell.title = tooltipParts.join("\n");

        (function (rId, cId) {
          cell.addEventListener("click", function () {
            var newMap = {};
            if (typeof window.getCycleTimerLineRecipeMap === "function") {
              var old = window.getCycleTimerLineRecipeMap();
              for (var k in old) newMap[k] = old[k];
            }
            newMap[1] = String(rId);
            newMap[2] = String(cId);
            if (typeof window.applyCycleTimerLineRecipeMap === "function") {
              window.applyCycleTimerLineRecipeMap(newMap);
            }
            if (typeof window.rebuildCycleTimerOutputGrids === "function") {
              window.rebuildCycleTimerOutputGrids();
            }
            if (window.showCycleTimerInsight) {
              window.showCycleTimerInsight("Combina\u00E7\u00E3o aplicada", recipes[ri - (ri - ri)].label + " / " + recipes[cj - (cj - cj)].label, "success");
            }
          });
        })(recipes[ri].id, recipes[cj].id);

        row.appendChild(cell);
      }
      tbody.appendChild(row);
    }
    table.appendChild(tbody);
    wrapper.appendChild(table);

    container.appendChild(wrapper);

    if (typeof window.initHelpTooltipsForRoot === "function") {
      window.initHelpTooltipsForRoot(container);
    }
  };

})();
