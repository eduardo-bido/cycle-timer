(function () {
  function closeMenu() {
    var menu = document.getElementById("header-settings-menu");
    var btn = document.getElementById("header-settings-toggle");
    if (menu) {
      menu.hidden = true;
    }
    if (btn) {
      btn.setAttribute("aria-expanded", "false");
    }
  }

  function openMenu() {
    var menu = document.getElementById("header-settings-menu");
    var btn = document.getElementById("header-settings-toggle");
    if (menu) {
      menu.hidden = false;
    }
    if (btn) {
      btn.setAttribute("aria-expanded", "true");
    }
  }

  function toggleMenu() {
    var menu = document.getElementById("header-settings-menu");
    if (!menu) return;
    if (menu.hidden) openMenu();
    else closeMenu();
  }

  function initHeaderSettingsMenu() {
    var toggle = document.getElementById("header-settings-toggle");
    var menu = document.getElementById("header-settings-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleMenu();
    });

    menu.addEventListener("click", function (e) {
      var target = e.target;
      if (!target || !target.closest) return;
      var helpItem = target.closest("[data-settings-action=\"help\"]");
      if (helpItem) {
        e.preventDefault();
        closeMenu();
        if (typeof window.setActiveAppTab === "function") {
          window.setActiveAppTab("help");
        } else {
          var helpTab = document.getElementById("app-tab-help");
          if (helpTab) {
            helpTab.click();
          }
        }
        return;
      }
      var pdfItem = target.closest("[data-settings-action=\"export-pdf\"]");
      if (pdfItem) {
        e.preventDefault();
        closeMenu();
        if (typeof window.exportCycleTimerScenarioPdf === "function") {
          window.exportCycleTimerScenarioPdf();
        }
        return;
      }
      var anyItem = target.closest("button.header-settings-item");
      if (anyItem) {
        window.setTimeout(closeMenu, 0);
      }
    });

    document.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest(".header-settings")) return;
      closeMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeMenu();
      }
    });
  }

  function initSidebarCollapse() {
    var minimizeBtn = document.getElementById("minimize-inputs-btn");
    var restoreBtn = document.getElementById("restore-inputs-btn");
    var ioLayout = document.querySelector("#inputs-view .io-layout");
    
    if (!minimizeBtn || !restoreBtn || !ioLayout) return;

    minimizeBtn.addEventListener("click", function () {
      ioLayout.classList.add("is-collapsed");
      restoreBtn.hidden = false;
    });

    restoreBtn.addEventListener("click", function () {
      ioLayout.classList.remove("is-collapsed");
      restoreBtn.hidden = true;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      initHeaderSettingsMenu();
      initSidebarCollapse();
    });
  } else {
    initHeaderSettingsMenu();
    initSidebarCollapse();
  }
})();
