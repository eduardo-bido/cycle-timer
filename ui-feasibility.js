/**
 * Módulo de UI para a Card Matrix de Viabilidade Técnico-Operacional.
 * Eixo X (Superior): Linhas
 * Eixo Y (Lateral): SKUs
 */
(function () {
  /**
   * Ponto de entrada principal para (re)gerar a matriz em formato de cards.
   */
  window.runFeasibilityMatrix = function () {
    var container = document.getElementById("feasibility-matrix-container");
    var grid = document.getElementById("feasibility-matrix-grid");
    if (!container || !grid) return;

    var recipes = [];
    if (typeof window.getCycleTimerRecipeOptions === "function") {
      recipes = window.getCycleTimerRecipeOptions();
    }

    var linesInput = document.getElementById("robot-lines-count");
    var maxLines = 1;
    if (linesInput) {
      var parsed = parseInt(linesInput.value, 10);
      if (isFinite(parsed) && parsed > 0) {
        maxLines = Math.min(Math.max(parsed, 1), 6);
      }
    }

    if (recipes.length === 0) {
      container.hidden = true;
      return;
    }

    container.hidden = false;
    renderCardMatrix(recipes, maxLines, grid);
  };

  /**
   * Renderiza a Matriz em formato de Grid Moderno (sem tabelas pesadas).
   */
  function renderCardMatrix(recipes, maxLines, container) {
    container.innerHTML = ""; // Limpa conteúdo anterior

    var t = window.getCycleTimerI18nT || function (k) { return k; };
    var currentMap = (typeof window.getCycleTimerLineRecipeMap === "function") 
      ? window.getCycleTimerLineRecipeMap() 
      : {};

    var grid = document.createElement("div");
    grid.className = "fm-modern-grid";
    grid.style.gridTemplateColumns = "240px repeat(" + maxLines + ", 110px)";

    // 1. Cabeçalhos
    var headerCorner = document.createElement("div");
    headerCorner.className = "fm-modern-header-cell fm-modern-sku-cell";
    headerCorner.textContent = t("feasibility_col_recipe");
    grid.appendChild(headerCorner);

    for (var L = 1; L <= maxLines; L++) {
      var hCell = document.createElement("div");
      hCell.className = "fm-modern-header-cell";
      hCell.textContent = t("output_line_prefix") + " " + L;
      grid.appendChild(hCell);
    }

    // 2. Células de Dados
    recipes.forEach(function (recipeData) {
      var recipe = (typeof window.getCycleTimerRecipeByRowId === "function")
        ? window.getCycleTimerRecipeByRowId(recipeData.id)
        : null;
      if (!recipe) return;

      var skuLabel = document.createElement("div");
      skuLabel.className = "fm-modern-sku-cell";
      skuLabel.textContent = recipeData.label;
      grid.appendChild(skuLabel);

      for (var lineIdx = 1; lineIdx <= maxLines; lineIdx++) {
        var robotTimes = (typeof window.getCycleTimerRobotTimesByLine === "function")
          ? window.getCycleTimerRobotTimesByLine(lineIdx)
          : { cycleTimePickS: 0, cycleTimeSlipSheetS: 0, cycleTimePalletS: 0 };

        var res = null;
        if (typeof window.computeCycleTimer === "function") {
          res = window.computeCycleTimer({
            productionBpm: recipe.productionBpm,
            boxesPerLayer: recipe.boxesPerLayer,
            layersPerPallet: recipe.layersPerPallet,
            picksPerLayer: recipe.picksPerLayer,
            slipSheetBottom: recipe.slipSheetBottom,
            slipSheetBetweenLayers: recipe.slipSheetBetweenLayers,
            palletPick: recipe.palletPick,
            cycleTimePickS: robotTimes.cycleTimePickS,
            cycleTimeSlipSheetS: robotTimes.cycleTimeSlipSheetS,
            cycleTimePalletS: robotTimes.cycleTimePalletS
          });
        }

        var occ = (res && typeof res.robotOccupancyRate === "number") ? res.robotOccupancyRate : null;
        var hasBaseData = recipe.productionBpm > 0 && robotTimes.cycleTimePickS > 0;
        if (!hasBaseData) occ = null;

        var statusClass = (typeof window.getCycleTimerOccupancyClass === "function")
          ? window.getCycleTimerOccupancyClass(occ)
          : "";

        var cell = document.createElement("div");
        cell.className = "fm-modern-value-cell";

        if (statusClass) {
          cell.classList.add("fm-modern-text--" + statusClass.replace("occ--", ""));
        }

        if (currentMap[lineIdx] === String(recipeData.id)) {
          cell.classList.add("fm-modern-value-cell--selected");
        }

        if (occ !== null && !isNaN(occ)) {
          cell.innerHTML = "<span class='fm-dot'>●</span>" + (occ * 100).toFixed(1) + "%";
        } else {
          cell.textContent = "—";
          cell.classList.add("fm-modern-text--empty");
        }

        // Clique para aplicar
        (function (lIdx, rId) {
          cell.addEventListener("click", function () {
            applyRecipeToLine(lIdx, rId);
          });
        })(lineIdx, recipeData.id);

        grid.appendChild(cell);
      }
    });

    container.appendChild(grid);
  }

  /**
   * Aplica a receita à linha.
   */
  function applyRecipeToLine(lineIdx, recipeId) {
    if (typeof window.applyCycleTimerLineRecipeMap !== "function") return;
    
    var current = {};
    if (typeof window.getCycleTimerLineRecipeMap === "function") {
      var old = window.getCycleTimerLineRecipeMap();
      for (var k in old) current[k] = old[k];
    }
    
    current[lineIdx] = String(recipeId);
    window.applyCycleTimerLineRecipeMap(current);

    if (typeof window.rebuildCycleTimerOutputGrids === "function") {
      window.rebuildCycleTimerOutputGrids();
    }
    
    if (window.showCycleTimerInsight) {
      window.showCycleTimerInsight(
        "Sucesso", 
        "Linha " + lineIdx + " configurada.", 
        "success"
      );
    }
  }

})();
