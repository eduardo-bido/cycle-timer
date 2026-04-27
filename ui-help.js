// Sistema simples de tooltips baseado em HELP_DATA.

(function () {
  var tooltipEl = null;

  function ensureTooltipElement() {
    if (tooltipEl) return tooltipEl;
    tooltipEl = document.createElement("div");
    tooltipEl.className = "help-tooltip";
    tooltipEl.style.position = "absolute";
    tooltipEl.style.pointerEvents = "none";
    tooltipEl.style.display = "none";
    document.body.appendChild(tooltipEl);
    return tooltipEl;
  }

  function buildTooltipContent(helpKey) {
    if (!window.HELP_DATA) return "";
    var entry = window.HELP_DATA[helpKey];
    if (!entry) return "";

    var t = window.I18N && window.I18N.t ? window.I18N.t : function (k) { return k; };

    var html = "";
    if (entry.description) {
      html += '<div class="help-tooltip-description">' + entry.description + "</div>";
    }
    if (entry.formula) {
      html += '<div class="help-tooltip-formula-label">' + t("tooltip_formula") + "</div>";
      html += '<div class="help-tooltip-formula">' + entry.formula + "</div>";
    }
    if (entry.interpretation) {
      html += '<div class="help-tooltip-interpretation-label">' + t("tooltip_interpretation") + "</div>";
      html += '<div class="help-tooltip-interpretation">' + entry.interpretation + "</div>";
    }
    return html;
  }

  function showTooltip(target) {
    var key = target.getAttribute("data-help-key");
    if (!key) return;
    var content = buildTooltipContent(key);
    if (!content) return;

    var el = ensureTooltipElement();
    el.innerHTML = content;
    el.style.display = "block";

    var rect = target.getBoundingClientRect();
    var top = window.scrollY + rect.top - el.offsetHeight - 6;
    var left = window.scrollX + rect.left + rect.width / 2 - el.offsetWidth / 2;

    if (top < window.scrollY) {
      top = window.scrollY + rect.bottom + 6;
    }

    el.style.top = top + "px";
    el.style.left = left + "px";
  }

  function hideTooltip() {
    if (!tooltipEl) return;
    tooltipEl.style.display = "none";
  }

  function bindTooltipTo(el) {
    if (el.getAttribute("data-tooltip-bound") === "1") return;
    el.setAttribute("data-tooltip-bound", "1");
    if (!el.hasAttribute("tabindex")) {
      el.setAttribute("tabindex", "0");
    }
    if (!el.getAttribute("role")) {
      el.setAttribute("role", "button");
    }
    el.addEventListener("mouseenter", function () {
      showTooltip(el);
    });
    el.addEventListener("mouseleave", hideTooltip);
    el.addEventListener("focus", function () {
      showTooltip(el);
    });
    el.addEventListener("blur", hideTooltip);
  }

  function initHelpTooltips() {
    var icons = document.querySelectorAll(".help-icon[data-help-key]");
    icons.forEach(bindTooltipTo);
  }

  function initHelpTooltipsForNodes() {
    var nodes = document.querySelectorAll(".help-node[data-help-key]");
    nodes.forEach(bindTooltipTo);
  }

  function initHelpTooltipsForRoot(root) {
    var base = root && root.querySelectorAll ? root : document;
    var icons = base.querySelectorAll(".help-icon[data-help-key]");
    icons.forEach(bindTooltipTo);
  }

  window.initHelpTooltipsForNodes = initHelpTooltipsForNodes;
  window.initHelpTooltipsForRoot = initHelpTooltipsForRoot;

  function initHelpTooltipsUnder(root) {
    if (!root || !root.querySelectorAll) return;
    var nodes = root.querySelectorAll(".help-node[data-help-key]");
    nodes.forEach(bindTooltipTo);
  }

  window.initHelpTooltipsUnder = initHelpTooltipsUnder;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHelpTooltips);
  } else {
    initHelpTooltips();
  }
})();

