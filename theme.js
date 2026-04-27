// Toggle de tema (light/dark) simples e persistente.
(function () {
  var STORAGE_KEY = "cycle-timer-theme";

  function getTheme() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "dark" || saved === "light") return saved;
    } catch (e) {}
    return "light";
  }

  function setTheme(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
  }

  function themeLabelKeys() {
    var theme =
      document.documentElement.getAttribute("data-theme") || getTheme();
    return theme === "dark"
      ? { title: "theme_toggle_to_light", aria: "theme_toggle_to_light" }
      : { title: "theme_toggle_to_dark", aria: "theme_toggle_to_dark" };
  }

  function tTheme(key) {
    if (window.I18N && typeof window.I18N.t === "function") {
      return window.I18N.t(key);
    }
    return key === "theme_toggle_to_light"
      ? "Alternar para modo claro"
      : "Alternar para modo escuro";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    setTheme(theme);

    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("data-theme", theme);
      var keys = themeLabelKeys();
      btn.setAttribute("title", tTheme(keys.title));
      btn.setAttribute("aria-label", tTheme(keys.aria));
    }
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute("data-theme") || getTheme();
    var next = current === "dark" ? "light" : "dark";
    applyTheme(next);
  }

  function initThemeToggle() {
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", toggleTheme);
    }
    applyTheme(getTheme());
    window.addEventListener("app-language-changed", function () {
      applyTheme(document.documentElement.getAttribute("data-theme") || getTheme());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeToggle);
  } else {
    initThemeToggle();
  }

  window.applyCycleTimerTheme = function (theme) {
    if (theme !== "dark" && theme !== "light") return;
    applyTheme(theme);
  };
})();

