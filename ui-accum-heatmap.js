/**
 * Módulo: Heatmap de Limpeza de Acúmulo Multilinear & Matriz Dinâmica
 *
 * Renderiza uma matriz N-dimensional mapeada em 2D usando Canvas Híbrido ou HTML Table.
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

  function getLang() {
    return window.APP_LANG || "pt";
  }

  // ─── Lógica do Termômetro de Saturação (Mantida apenas para uso legível ou cálculos individuais de ocupação se necessário) ───
  function calculateLineOccupancy(recipe, rt, palTransS) {
    if (!recipe || !rt) return { weight: 0, tPickMin: 0, tSetupMin: 0, label: "Desligada", empty: true };
    var prod = parseNum(recipe.productionBpm);
    if (prod <= 0) return { weight: 0, tPickMin: 0, tSetupMin: 0, label: recipe.label || "Desligada", empty: true };

    var cxCam = parseNum(recipe.boxesPerLayer) || 1;
    var pickCam = parseNum(recipe.picksPerLayer) || 1;
    var cxPerPick = cxCam / pickCam;
    
    var tPick = parseNum(rt.cycleTimePickS);
    var tPickMin = (prod / cxPerPick) * tPick;

    var camPallet = parseNum(recipe.layersPerPallet) || 1;
    var palletLifeTimeMin = (cxCam * camPallet) / prod;

    var palPick = parseNum(recipe.palletPick);
    var tPallet = parseNum(rt.cycleTimePalletS);
    var palletTime = (palPick > 0 && tPallet > 0) ? (palPick * tPallet) : palTransS;

    var slipsBottom = parseNum(recipe.slipSheetBottom);
    var slipsBetween = parseNum(recipe.slipSheetBetweenLayers);
    var tSlip = parseNum(rt.cycleTimeSlipSheetS);
    var slipsTime = (slipsBottom + slipsBetween) * tSlip;

    var tSetupMin = (1 / palletLifeTimeMin) * (palletTime + slipsTime);
    var weight = ((tPickMin + tSetupMin) / 60) * 100;

    return {
      weight: weight,
      tPickMin: tPickMin,
      tSetupMin: tSetupMin,
      label: recipe.label,
      empty: false
    };
  }

  // ─── Algoritmo de Colapso Multilinear Generalizado para N Linhas ────────────────
  function evalCollapseAlgorithmMultilinear(comboRecipes, robotTimesList, palTransS) {
    var validLines = [];
    for (var k = 0; k < comboRecipes.length; k++) {
      var rec = comboRecipes[k];
      var rt = robotTimesList[k];
      if (!rec || !rt) continue;

      var prod = parseNum(rec.productionBpm);
      if (prod <= 0) continue;

      var cxCam = parseNum(rec.boxesPerLayer);
      var pickCam = parseNum(rec.picksPerLayer);
      var tPick = parseNum(rt.cycleTimePickS);
      var camPallet = parseNum(rec.layersPerPallet);

      if (cxCam <= 0 || pickCam <= 0 || tPick <= 0 || camPallet <= 0) {
        return { overall: "warn", details: null };
      }

      validLines.push({
        lineIndex: k + 1,
        recipe: rec,
        rt: rt,
        prod: prod,
        cxCam: cxCam,
        pickCam: pickCam,
        tPick: tPick,
        camPallet: camPallet,
        palletPick: parseNum(rec.palletPick),
        tPallet: parseNum(rt.cycleTimePalletS),
        slipsBottom: parseNum(rec.slipSheetBottom),
        slipsBetween: parseNum(rec.slipSheetBetweenLayers),
        tSlip: parseNum(rt.cycleTimeSlipSheetS)
      });
    }

    if (validLines.length === 0) {
      return { overall: "na", details: null };
    }

    // 1. Tempo de Apagão Simultâneo
    var totalBlackoutS = 0;
    var maxPickS = 0;
    for (var i = 0; i < validLines.length; i++) {
      var vl = validLines[i];
      var palletTime = (vl.palletPick > 0 && vl.tPallet > 0) ? (vl.palletPick * vl.tPallet) : palTransS;
      var slipsTime = (vl.slipsBottom + vl.slipsBetween) * vl.tSlip;
      totalBlackoutS += (palletTime + slipsTime);
      if (vl.tPick > maxPickS) {
        maxPickS = vl.tPick;
      }
    }
    totalBlackoutS += maxPickS;

    // 2. Acúmulo Inicial total
    var totalArrivalBpm = 0;
    var initialAccumBoxes = 0;
    for (var i = 0; i < validLines.length; i++) {
      var vl = validLines[i];
      totalArrivalBpm += vl.prod;
      initialAccumBoxes += vl.prod * (totalBlackoutS / 60);
    }

    // 3. Taxa de Remoção Compartilhada (Ciclo Único com Picks em todas as linhas)
    var sharedCycleTimeS = 0;
    var totalBoxesPerSharedCycle = 0;
    for (var i = 0; i < validLines.length; i++) {
      var vl = validLines[i];
      sharedCycleTimeS += vl.tPick;
      totalBoxesPerSharedCycle += (vl.cxCam / vl.pickCam);
    }

    var robotRemovalRateBpm = (totalBoxesPerSharedCycle / sharedCycleTimeS) * 60;

    // 4. Taxa de Limpeza Líquida
    var netClearingRateBpm = robotRemovalRateBpm - totalArrivalBpm;

    if (netClearingRateBpm <= 0) {
      return {
        overall: "fail",
        details: {
          apagaoS: totalBlackoutS,
          acumulo: initialAccumBoxes,
          liquida: netClearingRateBpm,
          tLimpar: null,
          tLimite: null,
          msg: "Saturação do robô em regime compartilhado"
        }
      };
    }

    // 5. Tempo para Limpar Acúmulo
    var timeToClearMin = initialAccumBoxes / netClearingRateBpm;

    // 6. Tempo Limite (menor ciclo de pallet ativo)
    var minPalletLifeTimeMin = Infinity;
    for (var i = 0; i < validLines.length; i++) {
      var vl = validLines[i];
      var palletLifeTimeMin = (vl.cxCam * vl.camPallet) / vl.prod;
      if (palletLifeTimeMin < minPalletLifeTimeMin) {
        minPalletLifeTimeMin = palletLifeTimeMin;
      }
    }

    var overall = timeToClearMin <= minPalletLifeTimeMin ? "ok" : "fail";

    return {
      overall: overall,
      details: {
        apagaoS: totalBlackoutS,
        acumulo: initialAccumBoxes,
        liquida: netClearingRateBpm,
        tLimpar: timeToClearMin,
        tLimite: minPalletLifeTimeMin,
        msg: overall === "ok" ? "Dentro do limite de acúmulo" : "Estoura tempo limite do pallet"
      }
    };
  }

  // Helper para gerar o produto cartesiano
  function getCombinations(lines, recipes) {
    if (lines.length === 0) return [[]];
    var firstLine = lines[0];
    var restLines = lines.slice(1);
    var restCombos = getCombinations(restLines, recipes);
    var result = [];
    for (var i = 0; i < recipes.length; i++) {
      var r = recipes[i];
      for (var j = 0; j < restCombos.length; j++) {
        var combo = [r].concat(restCombos[j]);
        result.push(combo);
      }
    }
    return result;
  }

  // ─── Renderização Principal ───
  window.evalCollapseAlgorithmMultilinear = evalCollapseAlgorithmMultilinear;

  window.runAccumHeatmap = function () {
    var section = document.getElementById("accum-heatmap-section");
    var container = document.getElementById("accum-heatmap-container");
    if (!section || !container) return;

    var linesInput = document.getElementById("robot-lines-count");
    var maxLines = linesInput ? (parseInt(linesInput.value, 10) || 1) : 1;
    maxLines = Math.min(Math.max(maxLines, 1), 6);

    // Se houver menos de 2 linhas, desativa o heatmap e o card global
    var viabilityCard = document.getElementById("accum-viability-card");
    if (maxLines < 2) {
      section.hidden = true;
      if (viabilityCard) viabilityCard.hidden = true;
      return;
    }
    section.hidden = false;

    var baseRecipes = [];
    if (typeof window.getCycleTimerRecipeOptions === "function") {
      baseRecipes = window.getCycleTimerRecipeOptions();
    }
    if (baseRecipes.length === 0) {
      section.hidden = true;
      if (viabilityCard) viabilityCard.hidden = true;
      return;
    }

    // Pré-carrega todas as receitas completas para evitar lentidão e falta de dados
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
      } else {
        // Fallback caso a função falhe
        fullRecipes.push(bRec);
      }
    }

    var palletTransitionEl = document.getElementById("robot-transition-time");
    var palTransS = palletTransitionEl ? (parseNum(palletTransitionEl.value) || 10) : 10;
    
    var t = getT();
    var currentMap = (typeof window.getCycleTimerLineRecipeMap === "function")
      ? window.getCycleTimerLineRecipeMap() : {};

    container.innerHTML = "";

    var headerDesc = section.querySelector(".panel-description");
    var headerTitle = section.querySelector(".panel-title");

    if (headerTitle) headerTitle.textContent = t("accum_heatmap_title");
    if (headerDesc) {
      headerDesc.textContent = (getLang() === "en")
        ? "Evaluation of the robot's capacity to clear initial accumulation from simultaneous outages across all active lines."
        : "Avaliação da capacidade do robô de limpar o acúmulo inicial pós-apagão simultâneo em todas as linhas ativas.";
    }

    // Gerar eixos de divisão para N dimensões
    var activeLines = [];
    for (var i = 1; i <= maxLines; i++) {
      activeLines.push(i);
    }

    var numYLines = Math.ceil(activeLines.length / 2);
    var yLines = activeLines.slice(0, numYLines);
    var xLines = activeLines.slice(numYLines);

    // Gerar combinações
    var yCombinations = getCombinations(yLines, fullRecipes);
    var xCombinations = getCombinations(xLines, fullRecipes);

    var numRows = yCombinations.length;
    var numCols = xCombinations.length;
    var totalCells = numRows * numCols;

    // ─── 1. Pré-cálculo de todos os dados do Grid ───
    var gridData = [];
    var okCount = 0;
    var totalActiveCells = 0;

    for (var r = 0; r < numRows; r++) {
      gridData[r] = [];
      var yCombo = yCombinations[r];
      for (var c = 0; c < numCols; c++) {
        var xCombo = xCombinations[c];
        
        // Reconstrói a receita por linha para esta célula
        var fullCombo = [];
        for (var l = 1; l <= maxLines; l++) {
          var yIdx = yLines.indexOf(l);
          if (yIdx !== -1) {
            fullCombo[l - 1] = yCombo[yIdx];
          } else {
            var xIdx = xLines.indexOf(l);
            if (xIdx !== -1) {
              fullCombo[l - 1] = xCombo[xIdx];
            } else {
              fullCombo[l - 1] = null;
            }
          }
        }

        // Obtém tempos do robô por linha
        var rtList = [];
        for (var l = 1; l <= maxLines; l++) {
          var rtObj = (typeof window.getCycleTimerRobotTimesByLine === "function")
            ? window.getCycleTimerRobotTimesByLine(l)
            : { cycleTimePickS: 0, cycleTimeSlipSheetS: 0, cycleTimePalletS: 0 };
          rtList[l - 1] = rtObj;
        }

        var res = evalCollapseAlgorithmMultilinear(fullCombo, rtList, palTransS);
        gridData[r][c] = {
          yCombo: yCombo,
          xCombo: xCombo,
          fullCombo: fullCombo,
          result: res
        };

        if (res.overall !== "na" && res.overall !== "warn") {
          totalActiveCells++;
          if (res.overall === "ok") {
            okCount++;
          }
        }
      }
    }

    // ─── 2. Atualizar Card Global de Viabilidade ───
    if (viabilityCard) {
      viabilityCard.hidden = false;
      var pct = totalActiveCells > 0 ? (okCount / totalActiveCells) * 100 : 0;
      
      var viabilityTitleEl = viabilityCard.querySelector(".accum-viability-title");
      if (viabilityTitleEl) {
        viabilityTitleEl.textContent = (getLang() === "en") ? "Global System Robustness" : "Robustez Global do Sistema";
      }

      var viabilityTextEl = document.getElementById("accum-viability-text");
      var viabilityBarFillEl = document.getElementById("accum-viability-bar-fill");
      
      if (viabilityTextEl) {
        if (getLang() === "en") {
          viabilityTextEl.innerHTML = "<div style='display:flex; align-items: baseline; gap: 12px;'><span style='font-size: 24px; font-weight: 800; color: var(--vs-primary);'>" + pct.toFixed(1) + "%</span> <span style='font-size: 13px; color: #64748b;'>of combinations clear the accumulation (" + okCount + " of " + totalActiveCells + ")</span></div>";
        } else {
          viabilityTextEl.innerHTML = "<div style='display:flex; align-items: baseline; gap: 12px;'><span style='font-size: 24px; font-weight: 800; color: var(--vs-primary);'>" + pct.toFixed(1) + "%</span> <span style='font-size: 13px; color: #64748b;'>das combinações de receitas conseguem limpar o acúmulo (" + okCount + " de " + totalActiveCells + ")</span></div>";
        }
      }
      
      if (viabilityBarFillEl) {
        viabilityBarFillEl.style.width = pct + "%";
        viabilityBarFillEl.className = "accum-viability-bar-fill";
        if (pct > 80) {
          viabilityBarFillEl.classList.add("accum-viability-bar-fill--success");
        } else if (pct > 50) {
          viabilityBarFillEl.classList.add("accum-viability-bar-fill--warning");
        } else {
          viabilityBarFillEl.classList.add("accum-viability-bar-fill--danger");
        }
      }
    }

    // ─── 3. Extração e Renderização da "Lista de Problemas" ───
    var failedCombinations = [];
    for (var ri = 0; ri < numRows; ri++) {
      for (var ci = 0; ci < numCols; ci++) {
        var cell = gridData[ri][ci];
        if (cell.result.overall !== "ok") {
          failedCombinations.push(cell);
        }
      }
    }

    function applyCombination(cellData) {
      var newMap = {};
      if (typeof window.getCycleTimerLineRecipeMap === "function") {
        var old = window.getCycleTimerLineRecipeMap();
        for (var k in old) newMap[k] = old[k];
      }

      var combinationLabels = [];
      for (var l = 1; l <= maxLines; l++) {
        var rec = cellData.fullCombo[l - 1];
        if (rec) {
          newMap[l] = String(rec.id);
          combinationLabels.push("L" + l + ": " + rec.label);
        }
      }

      if (typeof window.applyCycleTimerLineRecipeMap === "function") {
        window.applyCycleTimerLineRecipeMap(newMap);
      }
      if (typeof window.rebuildCycleTimerOutputGrids === "function") {
        window.rebuildCycleTimerOutputGrids();
      }

      window.runAccumHeatmap();

      if (window.showCycleTimerInsight) {
        var insightTitle = (getLang() === "en") ? "Combination applied" : "Combinação aplicada";
        window.showCycleTimerInsight(insightTitle, combinationLabels.join(" | "), "success");
      }
    }

    var listContainer = document.createElement("div");
    listContainer.className = "heatmap-failures-list";
    listContainer.style.marginTop = "24px";
    listContainer.style.display = "flex";
    listContainer.style.flexDirection = "column";
    listContainer.style.gap = "4px";


    if (failedCombinations.length === 0) {
      var successMsg = document.createElement("div");
      successMsg.style.padding = "24px";
      successMsg.style.textAlign = "center";
      successMsg.style.color = "#10b981";
      successMsg.style.fontWeight = "600";
      successMsg.style.fontSize = "16px";
      successMsg.textContent = (getLang() === "en") 
        ? "🎉 All combinations successfully clear the accumulation!" 
        : "🎉 Todas as combinações limpam o acúmulo com sucesso!";
      listContainer.appendChild(successMsg);
    } else {
      var listTitle = document.createElement("div");
      listTitle.style.fontWeight = "600";
      listTitle.style.fontSize = "14px";
      listTitle.style.color = "#1e293b";
      listTitle.style.marginBottom = "8px";
      listTitle.textContent = (getLang() === "en")
        ? "Combinations failing to clear accumulation (" + failedCombinations.length + " found):"
        : "Combinações que não atendem limpeza de acúmulo (" + failedCombinations.length + " encontradas):";
      listContainer.appendChild(listTitle);

      var ul = document.createElement("ul");
      ul.style.listStyle = "none";
      ul.style.margin = "0";
      ul.style.padding = "0";
      listContainer.appendChild(ul);

      var maxFailuresToShow = 200;
      var displayedFailures = failedCombinations.slice(0, maxFailuresToShow);

      for (var i = 0; i < displayedFailures.length; i++) {
        var cData = displayedFailures[i];
        
        var li = document.createElement("li");
        li.style.display = "flex";
        li.style.alignItems = "baseline";
        li.style.padding = "6px 0";
        li.style.borderBottom = "1px solid #e2e8f0";
        li.style.fontSize = "13px";
        li.style.color = "#475569";
        li.style.cursor = "pointer";
        li.style.transition = "color 0.15s";
        
        var isCurrent = true;
        for (var l = 1; l <= maxLines; l++) {
          var activeRecId = currentMap[l];
          var comboRec = cData.fullCombo[l - 1];
          if (activeRecId) {
            if (!comboRec || String(comboRec.id) !== String(activeRecId)) {
              isCurrent = false;
              break;
            }
          } else {
            if (comboRec) {
              isCurrent = false;
              break;
            }
          }
        }

        if (isCurrent) {
          li.style.color = "#0f172a";
          li.style.fontWeight = "600";
          li.dataset.current = "true";
        }

        li.onmouseover = function() { this.style.color = "#0f172a"; };
        li.onmouseout = function() { if(!this.dataset.current) this.style.color = "#475569"; };

        var comboTexts = [];
        for (var lineIdx = 0; lineIdx < cData.fullCombo.length; lineIdx++) {
           var rec = cData.fullCombo[lineIdx];
           comboTexts.push("L" + (lineIdx + 1) + ": " + (rec ? rec.label : "Desligada"));
        }
        var textCombo = comboTexts.join(" | ");

        var textReason = "";
        if (cData.result.overall === "warn") {
          textReason = (getLang() === "en") ? "Incomplete data" : "Dados incompletos";
        }

        var dotColor = cData.result.overall === "fail" ? "#ef4444" : "#f59e0b";
        var dot = "<span style='color: " + dotColor + "; margin-right: 8px; font-size: 14px;'>●</span>";

        var suffix = textReason ? " <span style='color: #94a3b8; margin-left: 8px;'>— " + textReason + "</span>" : "";
        li.innerHTML = dot + "<span>" + textCombo + "</span>" + suffix;

        (function(boundData, el) {
          el.addEventListener("click", function() {
            applyCombination(boundData);
          });
        })(cData, li);

        ul.appendChild(li);
      }

      if (failedCombinations.length > maxFailuresToShow) {
         var moreMsg = document.createElement("div");
         moreMsg.style.textAlign = "center";
         moreMsg.style.padding = "12px";
         moreMsg.style.fontSize = "13px";
         moreMsg.style.color = "#64748b";
         moreMsg.textContent = (getLang() === "en")
           ? "...and " + (failedCombinations.length - maxFailuresToShow) + " more combinations not shown."
           : "...e outras " + (failedCombinations.length - maxFailuresToShow) + " combinações omitidas.";
         listContainer.appendChild(moreMsg);
      }
    }

    container.appendChild(listContainer);

    if (typeof window.initHelpTooltipsForRoot === "function") {
      window.initHelpTooltipsForRoot(container);
    }
  };

})();
