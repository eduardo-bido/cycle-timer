// Orquestrador da aplicação: estado central + navegação + integração com UI e engine.
(function () {
  // ---- Estado central em memória ----
  var state = {
    recipe: {
      nomeReceita: "",
      productionBpm: 0,
      boxesPerLayer: 0,
      layersPerPallet: 0,
      picksPerLayer: 0,
      slipSheetBottom: 0,
      slipSheetBetweenLayers: 0,
      palletPick: 0
    },
    robotTimes: {
      robo: "",
      cycleTimePickS: 0,
      cycleTimeSlipSheetS: 0,
      cycleTimePalletS: 0,
      palletTransitionTimeS: 10
    },
    results: null,
    status: "—"
  };

  function buildScenarioPayload() {
    if (typeof window.buildCycleTimerExportPayload === "function") {
      return window.buildCycleTimerExportPayload();
    }
    return {
      recipe: state.recipe,
      robotTimes: state.robotTimes
    };
  }

  // ---- Navegação entre abas ----
  var tabs = document.querySelectorAll(".app-tab");
  var inputsView = document.getElementById("inputs-view");
  var outputsView = document.getElementById("outputs-view");
  var helpView = document.getElementById("help-view");
  var lastMainTab = "inputs";

  function setActiveTab(tabName) {
    if (tabName === "inputs" || tabName === "outputs") {
      lastMainTab = tabName;
    }
    tabs.forEach(function (tab) {
      var isActive = tab.getAttribute("data-tab") === tabName;
      tab.classList.toggle("app-tab--active", isActive);
    });

    inputsView.classList.remove("view--active");
    inputsView.setAttribute("hidden", "hidden");
    outputsView.classList.remove("view--active");
    outputsView.setAttribute("hidden", "hidden");
    if (helpView) {
      helpView.classList.remove("view--active");
      helpView.setAttribute("hidden", "hidden");
    }

    if (tabName === "inputs") {
      inputsView.classList.add("view--active");
      inputsView.removeAttribute("hidden");
    } else if (tabName === "outputs") {
      outputsView.classList.add("view--active");
      outputsView.removeAttribute("hidden");
    } else if (tabName === "help" && helpView) {
      helpView.classList.add("view--active");
      helpView.removeAttribute("hidden");
      if (typeof renderHelpPage === "function") {
        renderHelpPage();
      }
    }
  }
  
  window.setActiveAppTab = setActiveTab;

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var tabName = tab.getAttribute("data-tab");
      if (!tabName) return;
      setActiveTab(tabName);
    });
  });

  var helpBackBtn = document.getElementById("cycle-timer-help-back");
  if (helpBackBtn) {
    helpBackBtn.addEventListener("click", function () {
      setActiveTab(lastMainTab);
    });
  }

  // ---- Atualização de estado e cálculo ----

  function computeStatus(occupancy) {
    if (occupancy === null || occupancy === undefined || !isFinite(occupancy)) {
      return "—";
    }
    if (occupancy < 0.7) return "ATENDE";
    if (occupancy <= 0.9) return "LIMITE";
    return "NÃO ATENDE";
  }

  function recomputeResults() {
    if (typeof computeCycleTimer !== "function") {
      state.results = null;
      state.status = "—";
      renderOutputs(state.results, state.status, state.recipe, state.robotTimes);
      return;
    }

    var engineInput = {
      productionBpm: state.recipe.productionBpm,
      boxesPerLayer: state.recipe.boxesPerLayer,
      layersPerPallet: state.recipe.layersPerPallet,
      picksPerLayer: state.recipe.picksPerLayer,
      slipSheetBottom: state.recipe.slipSheetBottom,
      slipSheetBetweenLayers: state.recipe.slipSheetBetweenLayers,
      palletPick: state.recipe.palletPick,
      cycleTimePickS: state.robotTimes.cycleTimePickS,
      cycleTimeSlipSheetS: state.robotTimes.cycleTimeSlipSheetS,
      cycleTimePalletS: state.robotTimes.cycleTimePalletS,
      palletTransitionTimeS: state.robotTimes.palletTransitionTimeS
    };

    var results = computeCycleTimer(engineInput);
    state.results = results;

    var occupancy = results && results.robotOccupancyRate;
    state.status = computeStatus(occupancy);

    renderOutputs(state.results, state.status, state.recipe, state.robotTimes);
  }

  function updateRecipe(patch) {
    for (var key in patch) {
      if (!Object.prototype.hasOwnProperty.call(patch, key)) continue;
      if (!Object.prototype.hasOwnProperty.call(state.recipe, key)) continue;
      state.recipe[key] = patch[key];
    }
    if (typeof saveScenario === "function") {
      saveScenario(buildScenarioPayload());
    }
    recomputeResults();
  }

  function updateRobotTimes(patch) {
    for (var key in patch) {
      if (!Object.prototype.hasOwnProperty.call(patch, key)) continue;
      if (!Object.prototype.hasOwnProperty.call(state.robotTimes, key)) continue;
      state.robotTimes[key] = patch[key];
    }
    if (typeof saveScenario === "function") {
      saveScenario(buildScenarioPayload());
    }
    recomputeResults();
  }

  // ---- Inicialização das UIs ----
  // Carrega cenário salvo, se existir
  if (typeof loadScenario === "function") {
    var loaded = loadScenario();
    if (loaded) {
      if (loaded.schemaVersion && typeof window.applyCycleTimerSnapshot === "function") {
        // Atualiza estado de forma síncrona para que a carga inicial da UI (applyInputsFromState)
        // já venha com os dados da primeira linha, evitando que side-effects (como sync de campos)
        // disparem salvamentos de dados vazios sobre o snapshot válido.
        if (loaded.scenario) {
          var s = loaded.scenario;
          if (Array.isArray(s.recipes)) {
            var r1 = null;
            for (var i = 0; i < s.recipes.length; i++) {
              if (String(s.recipes[i].rowId) === "1") {
                r1 = s.recipes[i];
                break;
              }
            }
            if (r1) {
              for (var rk in r1) {
                if (Object.prototype.hasOwnProperty.call(state.recipe, rk)) {
                  state.recipe[rk] = r1[rk];
                }
              }
            }
          }
          if (Array.isArray(s.lineRobotTimes) && s.lineRobotTimes.length > 0) {
            var t1 = s.lineRobotTimes[0];
            for (var tk in t1) {
              if (Object.prototype.hasOwnProperty.call(state.robotTimes, tk)) {
                state.robotTimes[tk] = t1[tk];
              }
            }
          }
          if (s.robotModel) {
            state.robotTimes.robo = s.robotModel;
          }
        }

        setTimeout(function() {
          window.applyCycleTimerSnapshot(loaded);
        }, 0);
      } else if (loaded.recipe && loaded.robotTimes) {
        for (var rk in loaded.recipe) {
          if (Object.prototype.hasOwnProperty.call(state.recipe, rk)) {
            state.recipe[rk] = loaded.recipe[rk];
          }
        }
        for (var tk in loaded.robotTimes) {
          if (Object.prototype.hasOwnProperty.call(state.robotTimes, tk)) {
            state.robotTimes[tk] = loaded.robotTimes[tk];
          }
        }
      }
    }
  }

  window.triggerCycleTimerRecompute = recomputeResults;

  if (typeof initInputsUI === "function") {
    initInputsUI({
      updateRecipe: updateRecipe,
      updateRobotTimes: updateRobotTimes
    });
  }

  // Preenche os campos da aba INPUTS com o estado atual (carregado ou padrão)
  if (typeof applyInputsFromState === "function") {
    applyInputsFromState(state.recipe, state.robotTimes);
  }

  // Render inicial dos outputs (placeholders)
  if (typeof renderOutputs === "function") {
    recomputeResults();
  }

  // Abre na aba INPUTS por padrão
  setActiveTab("inputs");

  window.applyCycleTimerImportedCore = function (recipe, robotTimes) {
    if (recipe && typeof recipe === "object") {
      for (var rk in recipe) {
        if (!Object.prototype.hasOwnProperty.call(recipe, rk)) continue;
        if (!Object.prototype.hasOwnProperty.call(state.recipe, rk)) continue;
        state.recipe[rk] = recipe[rk];
      }
    }
    if (robotTimes && typeof robotTimes === "object") {
      for (var tk in robotTimes) {
        if (!Object.prototype.hasOwnProperty.call(robotTimes, tk)) continue;
        if (!Object.prototype.hasOwnProperty.call(state.robotTimes, tk)) continue;
        state.robotTimes[tk] = robotTimes[tk];
      }
    }
    if (typeof saveScenario === "function") {
      saveScenario(buildScenarioPayload());
    }
    if (typeof applyInputsFromState === "function") {
      applyInputsFromState(state.recipe, state.robotTimes);
    }
    recomputeResults();
  };
})();


