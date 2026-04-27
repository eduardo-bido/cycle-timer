// Camada de UI da aba INPUTS: captura mudanças e envia para app.js

function parseNumber(value) {
  if (value === null || value === undefined) return null;
  var trimmed = String(value).trim();
  if (trimmed === "") return 0;
  var normalized = trimmed.replace(",", ".");
  var n = parseFloat(normalized);
  return isNaN(n) ? null : n;
}

function isOperationalCycleTimeS(value) {
  return typeof value === "number" && isFinite(value) && value > 0;
}

/**
 * Tempos de ciclo de pallet/slip por linha robô (mesma convenção de id que ui-outputs.getRobotTimesByLine).
 */
function getRobotCycleTimeForLine(lineIndex, kind) {
  var suffix = lineIndex === 1 ? "" : "-l" + lineIndex;
  var id =
    kind === "pallet"
      ? "robot-cicloPalletMs" + suffix
      : "robot-cicloSlipsheetMs" + suffix;
  var el = document.getElementById(id);
  return el ? parseNumber(el.value) : null;
}

/**
 * Linhas robô (1..N) cuja receita selecionada é esta linha da planilha (data-row).
 * Se nenhuma linha aponta para a receita: usa a linha robô com o mesmo índice que data-row, se estiver visível.
 */
var recipePatchFromSync = null;

function getRobotLinesGatingRecipeRow(rowIdStr, maxLines, lineRecipeMap) {
  var rid = String(rowIdStr);
  var lines = [];
  if (lineRecipeMap) {
    for (var L = 1; L <= maxLines; L++) {
      if (String(lineRecipeMap[L]) === rid) {
        lines.push(L);
      }
    }
  }
  if (lines.length > 0) {
    return lines;
  }
  var r = parseInt(rid, 10);
  if (isFinite(r) && r >= 1 && r <= maxLines) {
    return [r];
  }
  return [];
}

/**
 * @param {HTMLElement} stack
 * @param {boolean} enabled
 * @param {string} hintId id estável para aria-describedby (ex.: recipe-sheet-hint-r1-pallet)
 */
function gateRecipeStack(stack, enabled, hintId) {
  var input = stack.querySelector("input.sheet-cell");
  var hint = stack.querySelector(".sheet-field-hint");
  if (!input) return;

  if (hint && hintId) {
    hint.id = hintId;
  }

  input.disabled = !enabled;
  input.classList.toggle("sheet-cell--gated", !enabled);

  if (hint) {
    if (enabled) {
      stack.classList.remove("sheet-field-stack--gated");
      stack.removeAttribute("tabindex");
      stack.removeAttribute("role");
      input.removeAttribute("aria-describedby");
      hint.classList.remove("sheet-field-hint--visible");
      hint.style.left = "";
      hint.style.top = "";
      hint.setAttribute("hidden", "hidden");
      hint.setAttribute("aria-hidden", "true");
    } else {
      stack.classList.add("sheet-field-stack--gated");
      stack.setAttribute("tabindex", "0");
      stack.setAttribute("role", "group");
      if (hint.id) {
        input.setAttribute("aria-describedby", hint.id);
      }
      hint.removeAttribute("hidden");
      hint.setAttribute("aria-hidden", "false");
    }
  } else {
    stack.classList.toggle("sheet-field-stack--gated", !enabled);
    if (enabled) {
      stack.removeAttribute("tabindex");
      stack.removeAttribute("role");
    }
  }
}

/**
 * Por linha da planilha: bloqueia colunas pallet/slip conforme tempos da(s) linha(s) robô associada(s).
 * Coerente com engine (cycleTime > 0 para operação).
 */
function syncRecipeDependentFields() {
  var linesInput = document.getElementById("robot-lines-count");
  var maxLines = 1;
  if (linesInput) {
    var parsed = parseInt(linesInput.value, 10);
    if (isFinite(parsed) && parsed > 0) {
      maxLines = Math.min(Math.max(parsed, 1), 6);
    }
  }

  var lineRecipeMap =
    typeof window.getCycleTimerLineRecipeMap === "function"
      ? window.getCycleTimerLineRecipeMap()
      : null;

  function allPalletOk(lines) {
    for (var i = 0; i < lines.length; i++) {
      if (!isOperationalCycleTimeS(getRobotCycleTimeForLine(lines[i], "pallet"))) {
        return false;
      }
    }
    return true;
  }

  function allSlipOk(lines) {
    for (var i = 0; i < lines.length; i++) {
      if (!isOperationalCycleTimeS(getRobotCycleTimeForLine(lines[i], "slip"))) {
        return false;
      }
    }
    return true;
  }

  var body = document.getElementById("recipes-sheet-body");
  if (!body) return;

  var rows = body.querySelectorAll("tr.sheet-row");
  for (var ri = 0; ri < rows.length; ri++) {
    var row = rows[ri];
    var rowId = row.getAttribute("data-row") || String(ri + 1);
    var gateLines = getRobotLinesGatingRecipeRow(rowId, maxLines, lineRecipeMap);

    var palletEnabled = gateLines.length === 0 || allPalletOk(gateLines);
    var slipEnabled = gateLines.length === 0 || allSlipOk(gateLines);

    var palletStacks = row.querySelectorAll(
      '.sheet-field-stack[data-recipe-gate="pallet"]'
    );
    var slipStacks = row.querySelectorAll(
      '.sheet-field-stack[data-recipe-gate="slip"]'
    );

    var patch = {};

    for (var pi = 0; pi < palletStacks.length; pi++) {
      var pInp = palletStacks[pi].querySelector("input.sheet-cell");
      // Apenas a visualização (hint e opacidade) é gerida via CSS; o valor não é apagado
    }

    for (var si = 0; si < slipStacks.length; si++) {
      var sInp = slipStacks[si].querySelector("input.sheet-cell");
      // Apenas a visualização (hint e opacidade) é gerida via CSS; o valor não é apagado
    }

    if (
      rowId === "1" &&
      typeof recipePatchFromSync === "function" &&
      Object.keys(patch).length > 0
    ) {
      recipePatchFromSync(patch);
    }

    var hintPrefix = "recipe-sheet-hint-r" + rowId;
    for (var pi2 = 0; pi2 < palletStacks.length; pi2++) {
      gateRecipeStack(palletStacks[pi2], palletEnabled, hintPrefix + "-pallet");
    }
    for (var si2 = 0; si2 < slipStacks.length; si2++) {
      gateRecipeStack(
        slipStacks[si2],
        slipEnabled,
        hintPrefix + "-slip-" + si2
      );
    }
  }
}

var recipeSheetNextRowCounter = 2;

function buildRecipeSheetRowTr(rowNumber) {
  var tr = document.createElement("tr");
  tr.className = "sheet-row";
  tr.setAttribute("data-row", String(rowNumber));

  function tdInput(type, inputmode, placeholder) {
    var td = document.createElement("td");
    var input = document.createElement("input");
    input.className = "sheet-cell";
    input.type = type;
    if (inputmode) input.setAttribute("inputmode", inputmode);
    if (placeholder) input.setAttribute("placeholder", placeholder);
    td.appendChild(input);
    return td;
  }

  function tdGatedStack(gateKind, i18nKey, hintSuffix) {
    var td = document.createElement("td");
    var stack = document.createElement("div");
    stack.className = "sheet-field-stack";
    stack.setAttribute("data-recipe-gate", gateKind);
    var input = document.createElement("input");
    input.className = "sheet-cell";
    input.type = "text";
    input.setAttribute("inputmode", "decimal");
    var hint = document.createElement("span");
    hint.className = "sheet-field-hint";
    hint.id = "recipe-sheet-hint-r" + rowNumber + "-" + hintSuffix;
    hint.setAttribute("hidden", "hidden");
    hint.setAttribute("data-i18n", i18nKey);
    stack.appendChild(input);
    stack.appendChild(hint);
    td.appendChild(stack);
    return td;
  }

  tr.appendChild(tdInput("text", "", "Ex.: SKU " + rowNumber));
  tr.appendChild(tdInput("text", "decimal", ""));
  tr.appendChild(tdInput("text", "decimal", ""));
  tr.appendChild(tdInput("text", "decimal", ""));
  tr.appendChild(tdInput("text", "decimal", ""));
  tr.appendChild(tdGatedStack("pallet", "input_hint_gated_pallet", "pallet"));
  tr.appendChild(tdGatedStack("slip", "input_hint_gated_slip", "slip-0"));
  tr.appendChild(tdGatedStack("slip", "input_hint_gated_slip", "slip-1"));

  var tdActions = document.createElement("td");
  tdActions.className = "sheet-cell-actions";
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "sheet-row-remove";
  btn.setAttribute("data-action", "remove-recipe-row");
  btn.setAttribute("aria-label", "Excluir receita");
  btn.textContent = "×";
  tdActions.appendChild(btn);
  tr.appendChild(tdActions);
  return tr;
}

function initInputsUI(api) {
  recipePatchFromSync = api.updateRecipe;
  var updateRecipe = api.updateRecipe;
  var updateRobotTimes = api.updateRobotTimes;

  // ----- Campos de Receita -----
  var elNomeReceita = document.getElementById("recipe-nome");
  var elProductionBpm = document.getElementById("recipe-taxaEntradaCxMin");
  var elBoxesPerLayer = document.getElementById("recipe-produtosPorCamada");
  var elLayersPerPallet = document.getElementById("recipe-camadasPorPallet");
  var elPicksPerLayer = document.getElementById("recipe-capturasPorCamada");
  var elSlipSheetBottom = document.getElementById("recipe-slipSheetBottom");
  var elSlipSheetBetweenLayers = document.getElementById(
    "recipe-slipSheetBetweenLayers"
  );
  var elPalletPick = document.getElementById("recipe-capturasPallet");

  if (elNomeReceita) {
    elNomeReceita.addEventListener("input", function () {
      updateRecipe({ nomeReceita: elNomeReceita.value || "" });
    });
  }

  if (elProductionBpm) {
    elProductionBpm.addEventListener("input", function () {
      updateRecipe({ productionBpm: parseNumber(elProductionBpm.value) });
    });
  }

  if (elBoxesPerLayer) {
    elBoxesPerLayer.addEventListener("input", function () {
      updateRecipe({ boxesPerLayer: parseNumber(elBoxesPerLayer.value) });
    });
  }

  if (elLayersPerPallet) {
    elLayersPerPallet.addEventListener("input", function () {
      updateRecipe({ layersPerPallet: parseNumber(elLayersPerPallet.value) });
    });
  }

  if (elPicksPerLayer) {
    elPicksPerLayer.addEventListener("input", function () {
      updateRecipe({ picksPerLayer: parseNumber(elPicksPerLayer.value) });
    });
  }

  if (elSlipSheetBottom) {
    elSlipSheetBottom.addEventListener("input", function () {
      // Observação: a coluna visual "Capturas de pallet" está posicionada
      // no DOM sobre o input de id "recipe-slipSheetBottom".
      // Para que o Pallet pick (engine) use o valor do usuário corretamente,
      // mapeamos este input visual para o campo palletPick do estado.
      updateRecipe({ palletPick: parseNumber(elSlipSheetBottom.value) });
    });
  }

  if (elSlipSheetBetweenLayers) {
    elSlipSheetBetweenLayers.addEventListener("input", function () {
      updateRecipe({
        // Observação: o input de id "recipe-slipSheetBetweenLayers" corresponde
        // visualmente à coluna "Slip sheet na base".
        // Logo, este valor alimenta slipSheetBottom (engine).
        slipSheetBottom: parseNumber(elSlipSheetBetweenLayers.value)
      });
    });
  }

  if (elPalletPick) {
    elPalletPick.addEventListener("input", function () {
      // Observação: o input de id "recipe-capturasPallet" corresponde
      // visualmente à coluna "Slip sheet entre camadas".
      // Logo, este valor alimenta slipSheetBetweenLayers (engine).
      updateRecipe({ slipSheetBetweenLayers: parseNumber(elPalletPick.value) });
    });
  }

  // ----- Planilha: adicionar novas receitas (linhas extras não conectadas ao cálculo ainda) -----
  var elAddRow = document.getElementById("recipes-add-row");
  var elSheetBody = document.getElementById("recipes-sheet-body");
  var elAddRowOverlay = document.getElementById("recipes-add-row-overlay");

  function attachAddRow(btn) {
    if (!btn || !elSheetBody) return;
    btn.addEventListener("click", function () {
      var tr = buildRecipeSheetRowTr(recipeSheetNextRowCounter);
      elSheetBody.appendChild(tr);
      tr.querySelectorAll("[data-i18n]").forEach(function (hintEl) {
        var k = hintEl.getAttribute("data-i18n");
        if (window.I18N && typeof window.I18N.t === "function") {
          hintEl.textContent = window.I18N.t(k);
        }
      });
      syncRecipeDependentFields();
      recipeSheetNextRowCounter += 1;
    });
  }

  attachAddRow(elAddRow);
  attachAddRow(elAddRowOverlay);

  // Remoção de receitas (com proteção para a linha 1: apenas limpa ao invés de remover)
  if (elSheetBody) {
    elSheetBody.addEventListener("click", function (e) {
      var target = e.target;
      if (!target || !target.closest) return;
      var btn = target.closest("button[data-action=\"remove-recipe-row\"]");
      if (!btn) return;
      var row = btn.closest("tr.sheet-row");
      if (!row) return;
      var rowId = row.getAttribute("data-row");
      if (rowId === "1") {
        var inputs = row.querySelectorAll("input");
        inputs.forEach(function (input) {
          input.value = "";
        });
        // Recalcula imediatamente com zeros quando a linha 1 é limpa.
        inputs.forEach(function (input) {
          input.dispatchEvent(new Event("input", { bubbles: true }));
        });
        syncRecipeDependentFields();
        return;
      }
      row.remove();
      syncRecipeDependentFields();
    });
  }

  // ----- Planilha: modo expandido (overlay) -----
  var elExpand = document.getElementById("recipes-expand");
  var elOverlay = document.getElementById("recipes-overlay");
  var elOverlayBody = document.getElementById("recipes-overlay-body");
  var elCollapse = document.getElementById("recipes-collapse");
  var elSheetWrap = document.querySelector("#inputs-view .sheet-wrap");

  var sheetOriginalParent = null;
  var sheetOriginalNextSibling = null;

  function openOverlay() {
    if (!elOverlay || !elOverlayBody || !elSheetWrap) return;
    if (elOverlay.classList.contains("is-open")) return;

    sheetOriginalParent = elSheetWrap.parentElement;
    sheetOriginalNextSibling = elSheetWrap.nextSibling;

    elOverlayBody.appendChild(elSheetWrap);
    elOverlay.classList.add("is-open");
    elOverlay.setAttribute("aria-hidden", "false");

    // foco inicial
    var firstInput = elOverlayBody.querySelector("input, select, textarea, button");
    if (firstInput) firstInput.focus();
  }

  function closeOverlay() {
    if (!elOverlay || !elOverlayBody || !elSheetWrap) return;
    if (!elOverlay.classList.contains("is-open")) return;

    if (sheetOriginalParent) {
      if (sheetOriginalNextSibling) {
        sheetOriginalParent.insertBefore(elSheetWrap, sheetOriginalNextSibling);
      } else {
        sheetOriginalParent.appendChild(elSheetWrap);
      }
    }

    elOverlay.classList.remove("is-open");
    elOverlay.setAttribute("aria-hidden", "true");

    if (elExpand) elExpand.focus();
  }

  if (elExpand) elExpand.addEventListener("click", openOverlay);
  if (elCollapse) elCollapse.addEventListener("click", closeOverlay);

  if (elOverlay) {
    elOverlay.addEventListener("click", function (e) {
      var t = e.target;
      if (t && t.getAttribute && t.getAttribute("data-overlay-close") === "1") {
        closeOverlay();
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeOverlay();
    }
  });

  // ----- Configuração do robô e tempos do robô -----
  var elProjectName = document.getElementById("project-name");
  var elRobotModel = document.getElementById("robot-model");
  var elLinesCount = document.getElementById("robot-lines-count");
  var elCycleTimePickS = document.getElementById("robot-cicloProdutoMs");
  var elCycleTimeSlipSheetS = document.getElementById("robot-cicloSlipsheetMs");
  var elCycleTimePalletS = document.getElementById("robot-cicloPalletMs");
  var elPalletTransitionTimeS = document.getElementById("robot-transition-time");

  // Sync Project Name to Outputs header
  if (elProjectName) {
    elProjectName.addEventListener("input", function() {
      var outPn = document.getElementById("output-project-name");
      if (outPn) {
        var v = elProjectName.value.trim();
        outPn.textContent = v ? " — " + v : "";
      }
    });
  }

  if (elRobotModel) {
    elRobotModel.addEventListener("change", function () {
      updateRobotTimes({ robo: elRobotModel.value || "" });
    });
  }

  function applyLinesVisibility() {
    var n = elLinesCount ? parseInt(elLinesCount.value, 10) : 1;
    if (!isFinite(n) || n < 1) n = 1;
    if (n > 6) n = 6;
    var fields = document.querySelectorAll("#inputs-view .robot-line-field[data-line]");
    var headers = document.querySelectorAll("#inputs-view .robot-line-header[data-line]");
    fields.forEach(function (field) {
      var line = parseInt(field.getAttribute("data-line"), 10);
      if (line <= n) {
        field.classList.add("is-visible");
      } else {
        field.classList.remove("is-visible");
      }
    });
    headers.forEach(function (header) {
      var line = parseInt(header.getAttribute("data-line"), 10);
      if (line <= n) {
        header.classList.add("is-visible");
      } else {
        header.classList.remove("is-visible");
      }
    });
    syncRecipeDependentFields();
  }

  if (elLinesCount) {
    elLinesCount.addEventListener("input", function () {
      applyLinesVisibility();
      if (typeof window.rebuildCycleTimerOutputGrids === "function") {
        window.rebuildCycleTimerOutputGrids();
      }
    });
    applyLinesVisibility();
  }

  if (elCycleTimePickS) {
    elCycleTimePickS.addEventListener("input", function () {
      updateRobotTimes({ cycleTimePickS: parseNumber(elCycleTimePickS.value) });
    });
  }

  if (elCycleTimeSlipSheetS) {
    elCycleTimeSlipSheetS.addEventListener("input", function () {
      updateRobotTimes({
        cycleTimeSlipSheetS: parseNumber(elCycleTimeSlipSheetS.value)
      });
    });
  }

  if (elCycleTimePalletS) {
    elCycleTimePalletS.addEventListener("input", function () {
      updateRobotTimes({
        cycleTimePalletS: parseNumber(elCycleTimePalletS.value)
      });
    });
  }

  if (elPalletTransitionTimeS) {
    elPalletTransitionTimeS.addEventListener("input", function () {
      updateRobotTimes({
        palletTransitionTimeS: parseNumber(elPalletTransitionTimeS.value)
      });
    });
  }
}

window.addEventListener("app-language-changed", function () {
  syncRecipeDependentFields();
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", syncRecipeDependentFields);
}

(function attachUniversalMatrixTriggers() {
  var iv = document.getElementById("inputs-view");
  if (!iv) return;

  iv.addEventListener("input", function (e) {
    var t = e.target;
    if (!t) return;

    var isRobotTime = t.id && t.id.indexOf("robot-ciclo") !== -1;
    var isRecipeCell = t.classList && t.classList.contains("sheet-cell");

    if (isRobotTime || isRecipeCell) {
      // Dispara a atualização da matriz de viabilidade
      if (typeof window.runFeasibilityMatrix === "function") {
        window.runFeasibilityMatrix();
      }
      
      // Se for um campo de tempo de robô, também sincroniza campos dependentes (cadeados)
      if (isRobotTime) {
        syncRecipeDependentFields();
      }
    }
  });
})();

(function initRecipeGatedHintPopovers() {
  var iv = document.getElementById("inputs-view");
  if (!iv) return;

  function hideGatedHint(stack) {
    var hint = stack.querySelector(".sheet-field-hint");
    if (!hint) return;
    hint.classList.remove("sheet-field-hint--visible");
    hint.style.left = "";
    hint.style.top = "";
  }

  function hideAllGatedHints() {
    iv.querySelectorAll(".sheet-field-hint.sheet-field-hint--visible").forEach(function (hint) {
      hint.classList.remove("sheet-field-hint--visible");
      hint.style.left = "";
      hint.style.top = "";
    });
  }

  function showGatedHint(stack) {
    var hint = stack.querySelector(".sheet-field-hint");
    if (!hint || !stack.classList.contains("sheet-field-stack--gated")) return;
    var r = stack.getBoundingClientRect();
    var pad = 8;
    var maxW = Math.min(280, window.innerWidth - 2 * pad);
    hint.style.maxWidth = maxW + "px";
    hint.classList.add("sheet-field-hint--visible");

    window.requestAnimationFrame(function () {
      if (!hint.classList.contains("sheet-field-hint--visible")) return;
      var h = hint.offsetHeight || 56;
      var belowTop = r.bottom + 6;
      var spaceBelow = window.innerHeight - pad - belowTop;
      var aboveTop = r.top - 6 - h;
      var placeBelow = spaceBelow >= h || aboveTop < pad;
      var topPx = placeBelow ? belowTop : Math.max(pad, r.top - 6 - h);
      var wUsed = Math.min(maxW, Math.max(hint.offsetWidth || maxW, 120));
      var leftPx = Math.max(pad, Math.min(r.left, window.innerWidth - wUsed - pad));
      hint.style.left = leftPx + "px";
      hint.style.top = topPx + "px";
    });
  }

  iv.addEventListener(
    "mouseover",
    function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var stack = t.closest(".sheet-field-stack--gated");
      if (!stack || !iv.contains(stack)) return;
      showGatedHint(stack);
    },
    true
  );

  iv.addEventListener(
    "mouseout",
    function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var stack = t.closest(".sheet-field-stack--gated");
      if (!stack || !iv.contains(stack)) return;
      var rel = e.relatedTarget;
      if (rel && stack.contains(rel)) return;
      hideGatedHint(stack);
    },
    true
  );

  iv.addEventListener("focusin", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t !== t.closest(".sheet-field-stack--gated")) return;
    var stack = t;
    if (!iv.contains(stack)) return;
    showGatedHint(stack);
  });

  iv.addEventListener("focusout", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var stack = t.closest(".sheet-field-stack--gated");
    if (!stack || !iv.contains(stack)) return;
    window.setTimeout(function () {
      if (!stack.contains(document.activeElement)) {
        hideGatedHint(stack);
      }
    }, 0);
  });

  function scrollHide() {
    hideAllGatedHints();
  }
  var sb = document.querySelector("#inputs-view .sidebar");
  if (sb) sb.addEventListener("scroll", scrollHide, true);
  var overlayBody = document.getElementById("recipes-overlay-body");
  if (overlayBody) overlayBody.addEventListener("scroll", scrollHide, true);
  document.addEventListener("scroll", scrollHide, true);
})();

// Preenche os campos da aba INPUTS a partir do estado atual (usado na carga inicial)
function applyInputsFromState(recipe, robotTimes) {
  function setValue(id, value) {
    var el = document.getElementById(id);
    if (!el) return;
    if (value === null || value === undefined) {
      // Para inputs numéricos, preenche com 0; para texto, mantém vazio.
      if (el.type === "number") {
        el.value = "0";
      } else {
        el.value = "";
      }
    } else {
      el.value = String(value);
    }
  }

  if (recipe) {
    setValue("recipe-nome", recipe.nomeReceita);
    setValue("recipe-taxaEntradaCxMin", recipe.productionBpm);
    setValue("recipe-produtosPorCamada", recipe.boxesPerLayer);
    setValue("recipe-camadasPorPallet", recipe.layersPerPallet);
    setValue("recipe-capturasPorCamada", recipe.picksPerLayer);
    // Reaplica mapeamento visual->estado (para manter coerência com engine)
    setValue("recipe-slipSheetBottom", recipe.palletPick);
    setValue("recipe-slipSheetBetweenLayers", recipe.slipSheetBottom);
    setValue("recipe-capturasPallet", recipe.slipSheetBetweenLayers);
  }

  if (robotTimes) {
    setValue("robot-model", robotTimes.robo);
    setValue("robot-cicloProdutoMs", robotTimes.cycleTimePickS);
    setValue("robot-cicloSlipsheetMs", robotTimes.cycleTimeSlipSheetS);
    setValue("robot-cicloPalletMs", robotTimes.cycleTimePalletS);
    setValue("robot-transition-time", robotTimes.palletTransitionTimeS);
  }

  syncRecipeDependentFields();
}

window.syncRecipeDependentFields = syncRecipeDependentFields;

window.cycleTimerRecipeSheet = {
  buildRowTr: buildRecipeSheetRowTr,
  getNextRowCounter: function () {
    return recipeSheetNextRowCounter;
  },
  setNextRowCounter: function (n) {
    if (typeof n === "number" && isFinite(n) && n >= 2) {
      recipeSheetNextRowCounter = Math.floor(n);
    } else {
      recipeSheetNextRowCounter = 2;
    }
  },
  applyHintsToRow: function (tr) {
    if (!tr) return;
    tr.querySelectorAll("[data-i18n]").forEach(function (hintEl) {
      var k = hintEl.getAttribute("data-i18n");
      if (window.I18N && typeof window.I18N.t === "function") {
        hintEl.textContent = window.I18N.t(k);
      }
    });
  }
};





// Excel keyboard navigation for recipe grid
(function() {
  document.addEventListener("keydown", function(e) {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown" && e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Enter") {
      return;
    }
    
    var t = e.target;
    if (!t || !t.classList || !t.classList.contains("sheet-cell")) return;
    
    if (t.type === "number" && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
    }
    
    var tr = t.closest("tr.sheet-row");
    if (!tr) return;
    
    var tbody = tr.parentElement;
    var currentTd = t.closest("td");
    
    var rowArray = Array.prototype.slice.call(tbody.querySelectorAll("tr.sheet-row"));
    var tdArray = Array.prototype.slice.call(tr.children);
    
    var rowIndex = rowArray.indexOf(tr);
    var colIndex = tdArray.indexOf(currentTd);
    
    if (e.key === "Enter") {
      e.preventDefault();
      rowIndex++;
    } else if (e.key === "ArrowUp") {
      rowIndex--;
    } else if (e.key === "ArrowDown") {
      rowIndex++;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      var canJump = false;
      try {
         var isAtStart = t.selectionStart === 0 && t.selectionEnd === 0;
         var isAtEnd = t.selectionStart === t.value.length && t.selectionEnd === t.value.length;
         var allSelected = t.selectionStart === 0 && t.selectionEnd === t.value.length;
         
         if (t.value === "" || allSelected) {
            canJump = true;
         } else if (e.key === "ArrowLeft" && isAtStart) {
            canJump = true;
         } else if (e.key === "ArrowRight" && isAtEnd) {
            canJump = true;
         }
      } catch (err) {
         canJump = true;
      }
      
      if (canJump) {
        e.preventDefault();
        if (e.key === "ArrowLeft") colIndex--;
        if (e.key === "ArrowRight") colIndex++;
      } else {
        return;
      }
    }
    
    if (rowIndex >= 0 && rowIndex < rowArray.length) {
      if (colIndex >= 0 && colIndex < tdArray.length) {
        var targetRow = rowArray[rowIndex];
        var targetTd = targetRow.children[colIndex];
        var nextInput = targetTd.querySelector(".sheet-cell:not([disabled])");
        if (nextInput) {
          nextInput.focus();
          try { nextInput.select(); } catch(err) {}
        }
      }
    }
  });

  // Track cell filling dynamically to mimic Excel color highlighting
  function checkCellFill(cell) {
    if (!cell) return;
    var val = cell.value.trim();
    if (val === "" || val === "0") {
      cell.classList.remove("sheet-cell--filled");
    } else {
      cell.classList.add("sheet-cell--filled");
    }
  }

  document.addEventListener("input", function(e) {
    if (e.target && e.target.classList && e.target.classList.contains("sheet-cell")) {
      checkCellFill(e.target);
    }
  });

  document.addEventListener("change", function(e) {
    if (e.target && e.target.classList && e.target.classList.contains("sheet-cell")) {
      checkCellFill(e.target);
    }
  });

  // Check initial state after possible snapshot loads
  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
      document.querySelectorAll(".sheet-cell").forEach(checkCellFill);
    }, 600);
  });
})();
