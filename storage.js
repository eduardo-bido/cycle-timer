// Persistência simples em localStorage para o cenário atual.

(function () {
  var STORAGE_KEY = "cycle-timer-scenario-v1";

  function isObject(value) {
    return value !== null && typeof value === "object";
  }

  function loadScenario() {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!isObject(data)) return null;
      return data; 
    } catch (e) {
      return null;
    }
  }

  function saveScenario(scenario) {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    if (!isObject(scenario)) return;
    try {
      var payload = JSON.stringify(scenario);
      window.localStorage.setItem(STORAGE_KEY, payload);
    } catch (e) {
      // falhas de quota ou JSON são ignoradas silenciosamente
    }
  }

  function clearScenario() {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }

  window.loadScenario = loadScenario;
  window.saveScenario = saveScenario;
  window.clearScenario = clearScenario;
})();

