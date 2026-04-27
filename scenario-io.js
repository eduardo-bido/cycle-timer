(function () {
  var SCHEMA_VERSION = 1;

  function t(key) {
    if (window.I18N && typeof window.I18N.t === "function") {
      return window.I18N.t(key);
    }
    return key;
  }

  function isPlainObject(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
  }

  function coerceFiniteNumber(v, fallback) {
    if (typeof v === "number" && isFinite(v)) return v;
    if (typeof v === "string" && String(v).trim() !== "") {
      var n = parseFloat(String(v).replace(",", "."));
      if (isFinite(n)) return n;
    }
    return fallback;
  }

  function validateScenarioPayload(obj) {
    if (!isPlainObject(obj)) {
      return { ok: false, code: "scenario_err_not_object" };
    }
    if (obj.schemaVersion !== SCHEMA_VERSION) {
      return { ok: false, code: "scenario_err_schema_version" };
    }
    if (!isPlainObject(obj.scenario)) {
      return { ok: false, code: "scenario_err_scenario_missing" };
    }
    var s = obj.scenario;

    var n = parseInt(s.numberOfLines, 10);
    if (!isFinite(n) || n < 1 || n > 6) {
      return { ok: false, code: "scenario_err_lines_count" };
    }

    if (typeof s.robotModel !== "string") {
      return { ok: false, code: "scenario_err_robot_model" };
    }

    var palletTransitionTimeS = coerceFiniteNumber(s.palletTransitionTimeS, 10);

    if (!Array.isArray(s.recipes) || s.recipes.length === 0) {
      return { ok: false, code: "scenario_err_recipes" };
    }

    var seenIds = {};
    var hasRow1 = false;
    /** @type {Array<{rowId: string, nomeReceita: string, productionBpm: number, boxesPerLayer: number, layersPerPallet: number, picksPerLayer: number, slipSheetBottom: number, slipSheetBetweenLayers: number, palletPick: number}>} */
    var recipesNorm = [];
    for (var i = 0; i < s.recipes.length; i++) {
      var rec = s.recipes[i];
      if (!isPlainObject(rec)) {
        return { ok: false, code: "scenario_err_recipe_shape" };
      }
      var rid = rec.rowId != null ? String(rec.rowId).trim() : "";
      if (!rid) {
        return { ok: false, code: "scenario_err_recipe_rowid" };
      }
      if (seenIds[rid]) {
        return { ok: false, code: "scenario_err_recipe_duplicate" };
      }
      seenIds[rid] = true;
      if (rid === "1") hasRow1 = true;

      recipesNorm.push({
        rowId: rid,
        nomeReceita: rec.nomeReceita != null ? String(rec.nomeReceita) : "",
        productionBpm: coerceFiniteNumber(rec.productionBpm, null),
        boxesPerLayer: coerceFiniteNumber(rec.boxesPerLayer, null),
        layersPerPallet: coerceFiniteNumber(rec.layersPerPallet, null),
        picksPerLayer: coerceFiniteNumber(rec.picksPerLayer, null),
        slipSheetBottom: coerceFiniteNumber(rec.slipSheetBottom, null),
        slipSheetBetweenLayers: coerceFiniteNumber(rec.slipSheetBetweenLayers, null),
        palletPick: coerceFiniteNumber(rec.palletPick, null)
      });
    }

    // Removed hasRow1 validation to avoid throwing alerts when a user clears all recipes before a page refresh

    if (!Array.isArray(s.lineRobotTimes)) {
      return { ok: false, code: "scenario_err_line_times" };
    }
    if (s.lineRobotTimes.length !== n) {
      return { ok: false, code: "scenario_err_line_times_len" };
    }

    var timeByLine = {};
    for (var j = 0; j < s.lineRobotTimes.length; j++) {
      var lt = s.lineRobotTimes[j];
      if (!isPlainObject(lt)) {
        return { ok: false, code: "scenario_err_line_times_item" };
      }
      var li = parseInt(lt.lineIndex, 10);
      if (!isFinite(li) || li < 1 || li > n) {
        return { ok: false, code: "scenario_err_line_times_index" };
      }
      if (timeByLine[li]) {
        return { ok: false, code: "scenario_err_line_times_dup" };
      }
      timeByLine[li] = {
        lineIndex: li,
        cycleTimePickS: coerceFiniteNumber(lt.cycleTimePickS, null),
        cycleTimeSlipSheetS: coerceFiniteNumber(lt.cycleTimeSlipSheetS, null),
        cycleTimePalletS: coerceFiniteNumber(lt.cycleTimePalletS, null)
      };
    }

    for (var L = 1; L <= n; L++) {
      if (!timeByLine[L]) {
        return { ok: false, code: "scenario_err_line_times_gap" };
      }
    }

    var lineTimesNorm = [];
    for (var L2 = 1; L2 <= n; L2++) {
      lineTimesNorm.push(timeByLine[L2]);
    }

    if (!isPlainObject(s.lineRecipeMap)) {
      return { ok: false, code: "scenario_err_line_map" };
    }

    var mapNorm = {};
    for (var mk in s.lineRecipeMap) {
      if (!Object.prototype.hasOwnProperty.call(s.lineRecipeMap, mk)) continue;
      var lineIx = parseInt(mk, 10);
      if (!isFinite(lineIx) || lineIx < 1 || lineIx > n) {
        return { ok: false, code: "scenario_err_line_map_key" };
      }
      var mapped = s.lineRecipeMap[mk];
      if (mapped == null || String(mapped).trim() === "") {
        continue;
      }
      var mds = String(mapped).trim();
      if (!seenIds[mds]) {
        return { ok: false, code: "scenario_err_line_map_target" };
      }
      mapNorm[String(lineIx)] = mds;
    }

    var prefNorm = {};
    if (obj.preferences != null) {
      if (!isPlainObject(obj.preferences)) {
        return { ok: false, code: "scenario_err_preferences" };
      }
      if (obj.preferences.language === "pt" || obj.preferences.language === "en") {
        prefNorm.language = obj.preferences.language;
      }
      if (obj.preferences.theme === "light" || obj.preferences.theme === "dark") {
        prefNorm.theme = obj.preferences.theme;
      }
    }

    var recipeRow1Engine = null;
    for (var ri = 0; ri < recipesNorm.length; ri++) {
      if (recipesNorm[ri].rowId === "1") {
        var r1 = recipesNorm[ri];
        recipeRow1Engine = {
          nomeReceita: r1.nomeReceita,
          productionBpm: r1.productionBpm,
          boxesPerLayer: r1.boxesPerLayer,
          layersPerPallet: r1.layersPerPallet,
          picksPerLayer: r1.picksPerLayer,
          slipSheetBottom: r1.slipSheetBottom,
          slipSheetBetweenLayers: r1.slipSheetBetweenLayers,
          palletPick: r1.palletPick
        };
        break;
      }
    }

    if (!recipeRow1Engine) {
      recipeRow1Engine = {
        nomeReceita: "",
        productionBpm: null,
        boxesPerLayer: null,
        layersPerPallet: null,
        picksPerLayer: null,
        slipSheetBottom: null,
        slipSheetBetweenLayers: null,
        palletPick: null
      };
    }

    return {
      ok: true,
      data: {
        preferences: prefNorm,
        scenario: {
          numberOfLines: n,
          robotModel: s.robotModel,
          palletTransitionTimeS: palletTransitionTimeS,
          recipes: recipesNorm,
          lineRobotTimes: lineTimesNorm,
          lineRecipeMap: mapNorm
        },
        recipeRow1Engine: recipeRow1Engine
      }
    };
  }

  function readNumberOfLines() {
    var el = document.getElementById("robot-lines-count");
    var num = el ? parseInt(el.value, 10) : 1;
    if (!isFinite(num) || num < 1) num = 1;
    if (num > 6) num = 6;
    return num;
  }

  function nzTime(v) {
    if (v != null && typeof v === "number" && isFinite(v)) return v;
    return null;
  }

  function buildExportPayload() {
    var n = readNumberOfLines();
    var recipes =
      typeof window.collectCycleTimerRecipesFromSheet === "function"
        ? window.collectCycleTimerRecipesFromSheet()
        : [];
    var map =
      typeof window.getCycleTimerLineRecipeMap === "function"
        ? window.getCycleTimerLineRecipeMap()
        : {};
    var robotEl = document.getElementById("robot-model");
    var robotModel = robotEl && robotEl.value ? String(robotEl.value) : "";
    
    var transitionEl = document.getElementById("robot-transition-time");
    var transitionTime = transitionEl ? parseFloat(transitionEl.value) : 10;
    if (!isFinite(transitionTime) || transitionTime < 0) transitionTime = 10;
    
    var projEl = document.getElementById("project-name");
    var projectName = projEl && projEl.value ? String(projEl.value) : "";

    var lineTimes = [];
    for (var i = 1; i <= n; i++) {
      var rt =
        typeof window.getCycleTimerRobotTimesByLine === "function"
          ? window.getCycleTimerRobotTimesByLine(i)
          : null;
      lineTimes.push({
        lineIndex: i,
        cycleTimePickS: nzTime(rt ? rt.cycleTimePickS : 0),
        cycleTimeSlipSheetS: nzTime(rt ? rt.cycleTimeSlipSheetS : 0),
        cycleTimePalletS: nzTime(rt ? rt.cycleTimePalletS : 0)
      });
    }

    var mapOut = {};
    for (var k in map) {
      if (!Object.prototype.hasOwnProperty.call(map, k)) continue;
      var ki = parseInt(k, 10);
      if (!isFinite(ki) || ki < 1 || ki > n) continue;
      var v = map[k];
      if (v != null && String(v) !== "") {
        mapOut[String(ki)] = String(v);
      }
    }

    var lang =
      window.I18N && typeof window.I18N.getLang === "function"
        ? window.I18N.getLang()
        : "pt";
    var themeAttr = document.documentElement.getAttribute("data-theme");
    var theme = themeAttr === "dark" ? "dark" : "light";

    return {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      preferences: {
        language: lang === "en" ? "en" : "pt",
        theme: theme
      },
      scenario: {
        projectName: projectName,
        numberOfLines: n,
        robotModel: robotModel,
        palletTransitionTimeS: transitionTime,
        recipes: recipes,
        lineRobotTimes: lineTimes,
        lineRecipeMap: mapOut
      }
    };
  }

  async function triggerDownload(filename, content, mimeType) {
    mimeType = mimeType || "application/json;charset=utf-8";

    if (typeof window.showSaveFilePicker === "function") {
      try {
        const extension = filename.split(".").pop();
        const acceptType = mimeType.split(";")[0];
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: extension.toUpperCase() + " Files",
              accept: { [acceptType]: ["." + extension] }
            }
          ]
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
        console.warn("showSaveFilePicker failed, using fallback", err);
      }
    }

    var blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function fillRecipeRowFromEngine(tr, r) {
    var inputs = tr.querySelectorAll("td input.sheet-cell");
    if (!inputs || inputs.length < 8) return;
    inputs[0].value = r.nomeReceita != null ? String(r.nomeReceita) : "";
    function formatVal(v) {
      return (v === null || v === undefined) ? "" : String(v);
    }
    inputs[1].value = formatVal(r.productionBpm);
    inputs[2].value = formatVal(r.boxesPerLayer);
    inputs[3].value = formatVal(r.layersPerPallet);
    inputs[4].value = formatVal(r.picksPerLayer);
    inputs[5].value = formatVal(r.palletPick);
    inputs[6].value = formatVal(r.slipSheetBottom);
    inputs[7].value = formatVal(r.slipSheetBetweenLayers);
  }

  function setRobotFieldForLine(lineIndex, baseId, value) {
    var id = lineIndex === 1 ? baseId : baseId + "-l" + lineIndex;
    var el = document.getElementById(id);
    if (!el) return;
    el.value = (value === null || value === undefined) ? "" : String(value);
  }

  function applyImportedSnapshot(data) {
    if (!data) return;

    // Se recebermos o payload "cru" (exportado), validamos para obter a estrutura completa da data
    // que inclui o recipeRow1Engine separado para o core do app.
    if (!data.recipeRow1Engine && data.scenario && data.schemaVersion) {
      var v = validateScenarioPayload(data);
      if (v.ok) {
        data = v.data;
      }
    }

    var pref = data.preferences || {};
    if (pref.language === "pt" || pref.language === "en") {
      if (window.I18N && typeof window.I18N.applyLanguage === "function") {
        window.I18N.applyLanguage(pref.language);
      }
    }
    if (pref.theme === "light" || pref.theme === "dark") {
      if (typeof window.applyCycleTimerTheme === "function") {
        window.applyCycleTimerTheme(pref.theme);
      }
    }

    var s = data.scenario;
    var body = document.getElementById("recipes-sheet-body");
    var sheet = window.cycleTimerRecipeSheet;

    if (!body || !sheet || typeof sheet.buildRowTr !== "function") {
      alert(t("scenario_err_apply_missing_ui"));
      return;
    }

    while (body.lastElementChild && body.firstElementChild !== body.lastElementChild) {
      body.removeChild(body.lastElementChild);
    }

    var others = [];
    for (var rj = 0; rj < s.recipes.length; rj++) {
      if (s.recipes[rj].rowId !== "1") {
        others.push(s.recipes[rj]);
      }
    }
    others.sort(function (a, b) {
      return parseInt(a.rowId, 10) - parseInt(b.rowId, 10);
    });

    for (var oi = 0; oi < others.length; oi++) {
      var rec = others[oi];
      var rowNum = parseInt(rec.rowId, 10);
      if (!isFinite(rowNum) || rowNum < 2) {
        alert(t("scenario_err_recipe_rowid"));
        return;
      }
      var tr = sheet.buildRowTr(rowNum);
      fillRecipeRowFromEngine(tr, rec);
      sheet.applyHintsToRow(tr);
      body.appendChild(tr);
    }

    var maxRow = 1;
    for (var mj = 0; mj < s.recipes.length; mj++) {
      var nr = parseInt(s.recipes[mj].rowId, 10);
      if (isFinite(nr) && nr > maxRow) maxRow = nr;
    }
    sheet.setNextRowCounter(maxRow + 1);

    // 1. Restaura inputs base
    var pn = document.getElementById("project-name");
    if (pn) {
      pn.value = s.projectName || "";
      var outPn = document.getElementById("output-project-name");
      if (outPn) outPn.textContent = s.projectName ? " — " + s.projectName : "";
    }

    var rm = document.getElementById("robot-model");
    if (rm) {
      rm.value = s.robotModel || "";
    }

    var rtt = document.getElementById("robot-transition-time");
    if (rtt) {
      rtt.value = s.palletTransitionTimeS != null ? String(s.palletTransitionTimeS) : "10";
    }

    for (var L2 = 1; L2 <= s.numberOfLines; L2++) {
      var lt = s.lineRobotTimes[L2 - 1];
      setRobotFieldForLine(L2, "robot-cicloProdutoMs", lt.cycleTimePickS);
      setRobotFieldForLine(L2, "robot-cicloSlipsheetMs", lt.cycleTimeSlipSheetS);
      setRobotFieldForLine(L2, "robot-cicloPalletMs", lt.cycleTimePalletS);
    }

    var times1 = s.lineRobotTimes[0];
    var robotCore = {
      robo: s.robotModel || "",
      cycleTimePickS: times1.cycleTimePickS,
      cycleTimeSlipSheetS: times1.cycleTimeSlipSheetS,
      cycleTimePalletS: times1.cycleTimePalletS,
      palletTransitionTimeS: s.palletTransitionTimeS != null ? s.palletTransitionTimeS : 10
    };

    // 2. Restaura a linha 1 no estado e no DOM
    if (typeof window.applyCycleTimerImportedCore === "function") {
      window.applyCycleTimerImportedCore(data.recipeRow1Engine, robotCore);
    }

    // 3. Agora dispara eventos que podem causar re-sincronização (os tempos já estão lá)
    var elLines = document.getElementById("robot-lines-count");
    if (elLines) {
      elLines.value = String(s.numberOfLines);
      elLines.dispatchEvent(new Event("input", { bubbles: true }));
    }

    if (typeof window.applyCycleTimerLineRecipeMap === "function") {
      window.applyCycleTimerLineRecipeMap(s.lineRecipeMap);
    }
    if (typeof window.rebuildCycleTimerOutputGrids === "function") {
      window.rebuildCycleTimerOutputGrids();
    }
  }

  function initScenarioIo() {
    var ex = document.getElementById("scenario-export-btn");
    var im = document.getElementById("scenario-import-btn");
    var fi = document.getElementById("scenario-import-file");
    if (ex) {
      ex.addEventListener("click", async function () {
        try {
          var payload = buildExportPayload();
          
          var d = new Date();
          var pad = function(n) { return n < 10 ? "0" + n : n; };
          var stamp = pad(d.getDate()) + "-" + pad(d.getMonth() + 1);

          var pn = payload.scenario && payload.scenario.projectName ? payload.scenario.projectName : "";
          var safeName = pn.replace(/[^a-z0-9]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase();
          
          var fileName = safeName ? (safeName + "-cycle-timer-" + stamp + ".json") : ("cycle-timer-scenario-" + stamp + ".json");

          await triggerDownload(
            fileName,
            JSON.stringify(payload, null, 2),
            "application/json;charset=utf-8"
          );
        } catch (err) {
          alert(t("scenario_err_export_failed"));
        }
      });
    }
    if (im && fi) {
      im.addEventListener("click", function () {
        fi.value = "";
        fi.click();
      });
      fi.addEventListener("change", function () {
        var f = fi.files && fi.files[0];
        if (!f) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var raw = String(reader.result || "");
            if (raw.trim() === "") {
              alert(t("scenario_err_empty_file"));
              return;
            }
            var parsed = JSON.parse(raw);
            var v = validateScenarioPayload(parsed);
            if (!v.ok) {
              alert(t(v.code));
              return;
            }
            applyImportedSnapshot(v.data);
          } catch (_e) {
            alert(t("scenario_err_parse"));
          }
        };
        reader.onerror = function () {
          alert(t("scenario_err_read_file"));
        };
        reader.readAsText(f);
      });
    }

    var rbt = document.getElementById("scenario-reset-btn");
    if (rbt) {
      rbt.addEventListener("click", function () {
        if (!confirm("Tem certeza que deseja apagar todos os dados atuais e iniciar um novo projeto?")) return;
        
        var emptyData = {
          preferences: { language: window.I18N ? window.I18N.getLang() : "pt", theme: document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light" },
          scenario: {
            projectName: "",
            numberOfLines: 1,
            robotModel: "",
            palletTransitionTimeS: 10,
            recipes: [{
              rowId: "1", nomeReceita: "", productionBpm: null, boxesPerLayer: null, layersPerPallet: null, picksPerLayer: null, slipSheetBottom: null, slipSheetBetweenLayers: null, palletPick: null
            }],
            lineRobotTimes: [{ lineIndex: 1, cycleTimePickS: null, cycleTimeSlipSheetS: null, cycleTimePalletS: null }],
            lineRecipeMap: {}
          },
          recipeRow1Engine: {
            nomeReceita: "", productionBpm: null, boxesPerLayer: null, layersPerPallet: null, picksPerLayer: null, slipSheetBottom: null, slipSheetBetweenLayers: null, palletPick: null
          }
        };
        applyImportedSnapshot(emptyData);
      });
    }
  }

  if (typeof window !== "undefined") {
    window.cycleTimerValidateScenarioPayload = validateScenarioPayload;
    window.buildCycleTimerExportPayload = buildExportPayload;
    window.applyCycleTimerSnapshot = applyImportedSnapshot;
    window.cycleTimerTriggerDownload = triggerDownload;
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initScenarioIo);
    } else {
      initScenarioIo();
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      SCHEMA_VERSION: SCHEMA_VERSION,
      validateScenarioPayload: validateScenarioPayload
    };
  }
})();
