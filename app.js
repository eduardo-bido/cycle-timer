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
  var loaded = typeof loadScenario === "function" ? loadScenario() : null;

  function finishInitialization(useLoadedData) {
    if (useLoadedData && loaded) {
      if (loaded.schemaVersion && typeof window.applyCycleTimerSnapshot === "function") {
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
        if (typeof applyInputsFromState === "function") {
          applyInputsFromState(state.recipe, state.robotTimes);
        }
        recomputeResults();
      }
    } else {
      if (typeof applyInputsFromState === "function") {
        applyInputsFromState(state.recipe, state.robotTimes);
      }
      recomputeResults();
    }
  }

  window.triggerCycleTimerRecompute = recomputeResults;

  if (typeof initInputsUI === "function") {
    initInputsUI({
      updateRecipe: updateRecipe,
      updateRobotTimes: updateRobotTimes
    });
  }

  // Welcome Modal Interception
  var welcomeModal = document.getElementById("welcome-modal");
  var btnContinue = document.getElementById("welcome-btn-continue");
  var btnLoad = document.getElementById("welcome-btn-load");
  var btnNew = document.getElementById("welcome-btn-new");

  function closeWelcome() {
    if (welcomeModal) {
      welcomeModal.setAttribute("hidden", "hidden");
      welcomeModal.setAttribute("aria-hidden", "true");
    }
    setActiveTab("inputs");
  }

  if (welcomeModal && btnLoad && btnNew) {
    welcomeModal.removeAttribute("hidden");
    welcomeModal.removeAttribute("aria-hidden");

    if (loaded && loaded.scenario && loaded.scenario.recipes) {
      if (btnContinue) {
        btnContinue.removeAttribute("hidden");
        btnContinue.addEventListener("click", function() {
          closeWelcome();
          finishInitialization(true);
        });
      }
    }

    btnNew.addEventListener("click", function() {
       closeWelcome();
       if (typeof window.clearScenario === "function") window.clearScenario();
       if (typeof window.resetCycleTimerToEmpty === "function") {
         window.resetCycleTimerToEmpty();
       } else {
         finishInitialization(false);
       }
    });

    btnLoad.addEventListener("click", function() {
      var fileInput = document.getElementById("scenario-import-file");
      if (fileInput) fileInput.click();
      closeWelcome();
      // If the user cancels the file dialog, the app will just initialize empty.
      finishInitialization(false);
    });
  } else {
    finishInitialization(true);
    setActiveTab("inputs");
  }

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
    if (typeof applyInputsFromState === "function") {
      applyInputsFromState(state.recipe, state.robotTimes);
    }
    if (typeof saveScenario === "function") {
      saveScenario(buildScenarioPayload());
    }
    recomputeResults();
  };
})();


