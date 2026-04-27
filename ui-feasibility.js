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
   * Renderiza a Card Matrix.
   */
  function renderCardMatrix(recipes, maxLines, container) {
    container.innerHTML = ""; // Limpa conteúdo anterior

    var t = window.getCycleTimerI18nT || function (k) { return k; };
    var currentMap = (typeof window.getCycleTimerLineRecipeMap === "function") 
      ? window.getCycleTimerLineRecipeMap() 
      : {};

    // 1. Linha de Cabeçalho (Eixo X - Linhas)
    var headerRow = document.createElement("div");
    headerRow.className = "fm-row fm-row--header";
    
    var corner = document.createElement("div");
    corner.className = "fm-sku-label fm-sku-label--header";
    corner.textContent = t("feasibility_col_recipe");
    headerRow.appendChild(corner);

    var headerCells = document.createElement("div");
    headerCells.className = "fm-cells-container";
    for (var L = 1; L <= maxLines; L++) {
      var hCell = document.createElement("div");
      hCell.className = "fm-header-cell";
      hCell.textContent = t("output_line_prefix") + " " + L;
      headerCells.appendChild(hCell);
    }
    headerRow.appendChild(headerCells);
    container.appendChild(headerRow);

    // 2. Linhas de SKU (Eixo Y)
    recipes.forEach(function (recipeData) {
      var recipe = (typeof window.getCycleTimerRecipeByRowId === "function")
        ? window.getCycleTimerRecipeByRowId(recipeData.id)
        : null;
      if (!recipe) return;

      var row = document.createElement("div");
      row.className = "fm-row";

      // Nome do SKU (Lateral)
      var skuLabel = document.createElement("div");
      skuLabel.className = "fm-sku-label";
      skuLabel.textContent = recipeData.label;
      row.appendChild(skuLabel);

      // Container de Cards de Resultado
      var cardsContainer = document.createElement("div");
      cardsContainer.className = "fm-cells-container";

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
        
        // Se produção ou tempo de pick for 0, o cálculo é tecnicamente 0 mas visualmente incompleto.
        // Mostramos '-' para evitar confusão se o dado fundamental não existir.
        var hasBaseData = recipe.productionBpm > 0 && robotTimes.cycleTimePickS > 0;
        if (!hasBaseData) occ = null;

        var statusClass = (typeof window.getCycleTimerOccupancyClass === "function")
          ? window.getCycleTimerOccupancyClass(occ)
          : "";

        var card = document.createElement("div");
        card.className = "fm-card";
        
        if (statusClass) {
          card.classList.add("fm-card--" + statusClass.replace("occ--", ""));
        }

        // Seleção ativa
        if (currentMap[lineIdx] === String(recipeData.id)) {
          card.classList.add("fm-card--selected");
        }

        var html = "";
        if (occ !== null && !isNaN(occ)) {
          html = '<div class="fm-card-value">' + (occ * 100).toFixed(1) + '%</div>';
        } else {
          html = '<div class="fm-card-value fm-card-value--empty">—</div>';
        }
        card.innerHTML = html;

        // Clique para aplicar
        (function (lIdx, rId) {
          card.addEventListener("click", function () {
            applyRecipeToLine(lIdx, rId);
          });
        })(lineIdx, recipeData.id);

        cardsContainer.appendChild(card);
      }
      row.appendChild(cardsContainer);
      container.appendChild(row);
    });
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
