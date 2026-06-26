// Página HELP: base de consulta desktop-first a partir de HELP_DATA.

(function () {
  var HELP_RENDERED = "data-help-rendered";
  var HELP_LANG = "data-help-lang";

  function getEntry(key) {
    return window.HELP_DATA && window.HELP_DATA[key] ? window.HELP_DATA[key] : null;
  }

  function escapeHtml(text) {
    if (text == null || text === "") return "";
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function tFn() {
    return window.I18N && window.I18N.t ? window.I18N.t : function (k) { return k; };
  }

  function renderHelpCard(key, t) {
    var e = getEntry(key);
    if (!e) return "";
    var html =
      '<article class="help-tile vs-card vs-card--compact" data-help-key="' +
      escapeHtml(key) +
      '">';
    html += '<h3 class="help-tile-title vs-card__title">' + escapeHtml(e.label) + "</h3>";
    if (e.description) {
      html += '<p class="help-tile-desc">' + escapeHtml(e.description) + "</p>";
    }
    if (e.formula) {
      html += '<div class="help-tile-meta">' + escapeHtml(t("help_formula_label")) + "</div>";
      html += '<div class="help-tile-formula">' + escapeHtml(e.formula) + "</div>";
    }
    if (e.interpretation) {
      html += '<div class="help-tile-meta">' + escapeHtml(t("tooltip_interpretation")) + "</div>";
      html += '<p class="help-tile-interp">' + escapeHtml(e.interpretation) + "</p>";
    }
    html += "</article>";
    return html;
  }

  function renderRegion(regionId, titleKey, descKey, keys, t) {
    var html =
      '<section class="help-region vs-card-section" aria-labelledby="' +
      escapeHtml(regionId) +
      '">';
    html += '<header class="help-region-head vs-card__header">';
    html +=
      '<h2 class="help-region-title vs-card__title" id="' +
      escapeHtml(regionId) +
      '">' +
      escapeHtml(t(titleKey)) +
      "</h2>";
    if (descKey) {
      html +=
        '<p class="help-region-desc vs-card__description">' +
        escapeHtml(t(descKey)) +
        "</p>";
    }
    html += "</header>";
    html += '<div class="help-tile-grid vs-card__content">';
    for (var i = 0; i < keys.length; i++) {
      html += renderHelpCard(keys[i], t);
    }
    html += "</div></section>";
    return html;
  }

  function renderHelpSearchBar(t) {
    var html = '<div class="help-search" role="search">';
    html += '<label class="help-search-label" for="help-internal-search">';
    html += "<span>" + escapeHtml(t("help_search_label")) + "</span>";
    html += "</label>";
    html += '<div class="help-search-row">';
    html +=
      '<input type="search" id="help-internal-search" class="help-search-input" autocomplete="off" ';
    html += 'placeholder="' + escapeHtml(t("help_search_placeholder")) + '" ';
    html += 'aria-label="' + escapeHtml(t("help_search_aria")) + '" ';
    html += 'data-i18n-placeholder="help_search_placeholder" ';
    html += 'data-i18n-aria-label="help_search_aria" />';
    html += '<span id="help-search-status" class="help-search-status" aria-live="polite"></span>';
    html += "</div></div>";
    return html;
  }

  function renderHelpToc(t) {
    var items = [
      { href: "#help-region-flow", key: "help_toc_item_flow", label: "00. Diagrama de Fluxo" },
      { href: "#help-region-config", key: "help_toc_item_config", label: "01. Parâmetros e Entradas (Inputs)" },
      { href: "#help-region-engine", label: "02. Motor de Produtividade (Engine)" },
      { href: "#help-region-buffer", label: "03. Dimensionamento de Buffers" },
      { href: "#help-region-heatmap", label: "04. Matriz de Colisões (Heatmap)" },
      { href: "#help-region-insights", label: "05. Avaliador Inteligente (Insights)" }
    ];
    var html = '<nav class="help-toc" aria-label="' + escapeHtml(t("help_toc_aria")) + '">';
    html += '<span class="help-toc-label">' + escapeHtml(t("help_toc_label")) + "</span>";
    html += '<ul class="help-toc-list">';
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var text = it.label || t(it.key);
      html += '<li class="help-toc-item">';
      html +=
        '<a class="help-toc-link" href="' +
        escapeHtml(it.href) +
        '">' +
        escapeHtml(text) +
        "</a>";
      html += "</li>";
    }
    html += "</ul></nav>";
    return html;
  }

  function renderFlowDiagram(t) {
    var nodes = [
      { key: "productionBpm", tKey: "diagram_production" },
      { key: "gapBetweenBoxesS", tKey: "diagram_gap" },
      { key: "totalCycleTimePerPallet", tKey: "diagram_totalCycle" },
      { key: "totalStackingTimeRobotS", tKey: "diagram_totalStack" },
      { key: "robotOccupancyRate", tKey: "diagram_occupancy" },
      { key: "palletsPerHour", tKey: "diagram_palletsHour" }
    ];

    var html =
      '<section class="help-region help-region--flow vs-card-section" aria-labelledby="help-region-flow">';
    html += '<header class="help-region-head vs-card__header">';
    html +=
      '<h2 class="help-region-title vs-card__title" id="help-region-flow">' +
      escapeHtml(t("help_flow")) +
      "</h2>";
    html +=
      '<p class="help-region-desc vs-card__description">' +
      escapeHtml(t("help_flow_hint")) +
      "</p>";
    html += "</header>";
    html += '<div class="help-flow-rail" role="list">';
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      html += '<div class="help-flow-step" role="listitem">';
      html +=
        '<button type="button" class="help-flow-node help-node" data-help-key="' +
        escapeHtml(n.key) +
        '">';
      html += escapeHtml(t(n.tKey));
      html += "</button>";
      if (i < nodes.length - 1) {
        html += '<span class="help-flow-chevron" aria-hidden="true" role="presentation"></span>';
      }
      html += "</div>";
    }
    html += "</div></section>";
    return html;
  }

  function escapeRegExp(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function highlightPlainText(text, query) {
    if (!text || !query || !String(query).trim()) return escapeHtml(text);
    var q = String(query).trim();
    var re = new RegExp(escapeRegExp(q), "gi");
    var out = "";
    var lastIndex = 0;
    var m;
    while ((m = re.exec(text)) !== null) {
      out += escapeHtml(text.slice(lastIndex, m.index));
      out += '<mark class="help-search-mark">' + escapeHtml(m[0]) + "</mark>";
      lastIndex = m.index + m[0].length;
    }
    out += escapeHtml(text.slice(lastIndex));
    return out;
  }

  function highlightBest(text, query) {
    if (!text || !query || !String(query).trim()) return escapeHtml(text);
    var q = String(query).trim();
    var lower = text.toLowerCase();
    var idx = lower.indexOf(q.toLowerCase());
    if (idx !== -1) return highlightPlainText(text, q);
    var terms = q.split(/\s+/).filter(Boolean);
    if (terms.length) return highlightPlainText(text, terms[0]);
    return escapeHtml(text);
  }

  function buildTileBlob(key) {
    var e = getEntry(key);
    if (!e) return "";
    return [e.label, e.description || "", e.formula || "", e.interpretation || "", e.unit || ""]
      .join(" ")
      .toLowerCase();
  }

  function getRegionBlob(sectionEl) {
    if (!sectionEl) return "";
    var h = sectionEl.querySelector(".help-region-title");
    var d = sectionEl.querySelector(".help-region-desc");
    return ((h ? h.textContent : "") + " " + (d ? d.textContent : ""))
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function getFlowRegionBlob(flowEl) {
    if (!flowEl) return "";
    return flowEl.textContent.replace(/\s+/g, " ").trim().toLowerCase();
  }

  function termsMatchAll(haystack, terms) {
    if (!terms.length) return true;
    for (var i = 0; i < terms.length; i++) {
      if (haystack.indexOf(terms[i]) === -1) return false;
    }
    return true;
  }

  function parseQueryTerms(q) {
    return q
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(function (x) {
        return x.length > 0;
      });
  }

  function renderTileInnerHtml(key, query) {
    var e = getEntry(key);
    if (!e) return "";
    var t = tFn();
    var useHi = query && String(query).trim();
    var html = '<h3 class="help-tile-title vs-card__title">';
    html += useHi ? highlightBest(e.label, query) : escapeHtml(e.label);
    html += "</h3>";
    if (e.description) {
      html += '<p class="help-tile-desc">';
      html += useHi ? highlightBest(e.description, query) : escapeHtml(e.description);
      html += "</p>";
    }
    if (e.formula) {
      html += '<div class="help-tile-meta">' + escapeHtml(t("help_formula_label")) + "</div>";
      html += '<div class="help-tile-formula">';
      html += useHi ? highlightBest(e.formula, query) : escapeHtml(e.formula);
      html += "</div>";
    }
    if (e.interpretation) {
      html += '<div class="help-tile-meta">' + escapeHtml(t("tooltip_interpretation")) + "</div>";
      html += '<p class="help-tile-interp">';
      html += useHi ? highlightBest(e.interpretation, query) : escapeHtml(e.interpretation);
      html += "</p>";
    }
    return html;
  }

  function initHelpSearch(container) {
    var input = container.querySelector("#help-internal-search");
    var statusEl = container.querySelector("#help-search-status");
    if (!input || !statusEl) return;

    var tileHtmlByKey = {};
    var flowLabelByKey = {};

    function cacheDom() {
      tileHtmlByKey = {};
      flowLabelByKey = {};
      var tiles = container.querySelectorAll(".help-tile[data-help-key]");
      for (var ti = 0; ti < tiles.length; ti++) {
        var tk = tiles[ti].getAttribute("data-help-key");
        if (tk) tileHtmlByKey[tk] = tiles[ti].innerHTML;
      }
      var flow = container.querySelector(".help-region--flow");
      if (!flow) return;
      var nodes = flow.querySelectorAll(".help-flow-node[data-help-key]");
      for (var ni = 0; ni < nodes.length; ni++) {
        var nk = nodes[ni].getAttribute("data-help-key");
        if (nk) flowLabelByKey[nk] = nodes[ni].textContent;
      }
    }

    cacheDom();

    function restoreAllTiles() {
      var tiles = container.querySelectorAll(".help-tile[data-help-key]");
      for (var ri = 0; ri < tiles.length; ri++) {
        var tk = tiles[ri].getAttribute("data-help-key");
        if (tk && tileHtmlByKey[tk]) tiles[ri].innerHTML = tileHtmlByKey[tk];
      }
    }

    function restoreFlowButtons() {
      var flowRegion = container.querySelector(".help-region--flow");
      if (!flowRegion) return;
      var nodes = flowRegion.querySelectorAll(".help-flow-node[data-help-key]");
      for (var ri = 0; ri < nodes.length; ri++) {
        var btn = nodes[ri];
        var nk = btn.getAttribute("data-help-key");
        if (nk && flowLabelByKey[nk] !== undefined) {
          btn.textContent = flowLabelByKey[nk];
          btn.style.display = "";
          btn.classList.remove("help-flow-node--search-match");
        }
      }
      var steps = flowRegion.querySelectorAll(".help-flow-step");
      for (var si = 0; si < steps.length; si++) {
        steps[si].style.display = "";
      }
    }

    function updateStatus(strictMatches, visibleBlocks, hasTerms) {
      var tr = tFn();
      if (!hasTerms) {
        statusEl.textContent = "";
        return;
      }
      if (strictMatches > 0) {
        statusEl.textContent = tr("help_search_results_count").replace("{{n}}", String(strictMatches));
      } else if (visibleBlocks > 0) {
        statusEl.textContent = tr("help_search_showing_blocks").replace("{{n}}", String(visibleBlocks));
      } else {
        statusEl.textContent = tr("help_search_no_results");
      }
    }

    function applySearch() {
      var q = input.value.trim();
      var terms = parseQueryTerms(q);
      var hasTerms = terms.length > 0;

      if (!hasTerms) {
        restoreAllTiles();
        restoreFlowButtons();
        container.querySelectorAll(".help-tile").forEach(function (el) {
          el.classList.remove("help-tile--hidden", "help-tile--search-match");
        });
        container.querySelectorAll(".help-region").forEach(function (el) {
          el.classList.remove("help-region--hidden");
        });
        container.querySelectorAll(".help-column").forEach(function (el) {
          el.classList.remove("help-column--hidden");
        });
        updateStatus(0, 0, false);
        return;
      }

      restoreAllTiles();
      restoreFlowButtons();

      var strictMatches = 0;
      var firstScroll = null;

      var regions = container.querySelectorAll(".help-region:not(.help-region--flow)");
      for (var r = 0; r < regions.length; r++) {
        var section = regions[r];
        var regionBlob = getRegionBlob(section);
        var regionMatch = termsMatchAll(regionBlob, terms);

        var tileEls = section.querySelectorAll(".help-tile[data-help-key]");
        var anyVisible = false;

        for (var i = 0; i < tileEls.length; i++) {
          var tile = tileEls[i];
          var key = tile.getAttribute("data-help-key");
          var blob = buildTileBlob(key);
          var tileMatch = termsMatchAll(blob, terms);
          var show = regionMatch || tileMatch;

          if (show) {
            tile.classList.remove("help-tile--hidden");
            tile.classList.toggle("help-tile--search-match", tileMatch);
            if (tileMatch) {
              strictMatches++;
              tile.innerHTML = renderTileInnerHtml(key, q);
              if (!firstScroll) firstScroll = tile;
            }
            anyVisible = true;
          } else {
            tile.classList.add("help-tile--hidden");
            tile.classList.remove("help-tile--search-match");
          }
        }

        section.classList.toggle("help-region--hidden", !anyVisible);
      }

      var flowRegion = container.querySelector(".help-region--flow");
      if (flowRegion) {
        var flowBlob = getFlowRegionBlob(flowRegion);
        var flowRegionMatch = termsMatchAll(flowBlob, terms);
        var flowNodes = flowRegion.querySelectorAll(".help-flow-node[data-help-key]");
        var anyFlow = false;

        for (var fi = 0; fi < flowNodes.length; fi++) {
          var btn = flowNodes[fi];
          var fk = btn.getAttribute("data-help-key");
          var baseLabel = flowLabelByKey[fk] || "";
          var fBlob = buildTileBlob(fk) + " " + baseLabel.toLowerCase();
          var nodeMatch = termsMatchAll(fBlob, terms);
          var showF = flowRegionMatch || nodeMatch;

          if (showF) {
            btn.style.display = "";
            if (nodeMatch) {
              btn.classList.add("help-flow-node--search-match");
              btn.innerHTML = highlightBest(baseLabel, q);
              strictMatches++;
              if (!firstScroll) firstScroll = btn;
            } else {
              btn.classList.remove("help-flow-node--search-match");
              btn.textContent = baseLabel;
            }
            anyFlow = true;
          } else {
            btn.style.display = "none";
            btn.classList.remove("help-flow-node--search-match");
          }
        }

        var flowSteps = flowRegion.querySelectorAll(".help-flow-step");
        for (var fs = 0; fs < flowSteps.length; fs++) {
          var step = flowSteps[fs];
          var b = step.querySelector(".help-flow-node");
          step.style.display = b && b.style.display === "none" ? "none" : "";
        }

        flowRegion.classList.toggle("help-region--hidden", !anyFlow);
      }

      container.querySelectorAll(".help-column").forEach(function (col) {
        var vis = col.querySelector(".help-region:not(.help-region--hidden)");
        col.classList.toggle("help-column--hidden", !vis);
      });

      var visibleTiles = container.querySelectorAll(".help-tile:not(.help-tile--hidden)").length;
      var visibleFlow = 0;
      if (flowRegion) {
        flowRegion.querySelectorAll(".help-flow-node").forEach(function (bn) {
          if (bn.style.display !== "none") visibleFlow++;
        });
      }
      var visibleBlocks = visibleTiles + visibleFlow;

      updateStatus(strictMatches, visibleBlocks, hasTerms);

      var scrollTarget = firstScroll;
      if (!scrollTarget && hasTerms) {
        scrollTarget = container.querySelector(".help-tile:not(.help-tile--hidden)");
      }
      if (!scrollTarget && hasTerms) {
        scrollTarget = container.querySelector(
          ".help-region--flow .help-flow-node.help-flow-node--search-match"
        );
        if (!scrollTarget) {
          scrollTarget = container.querySelector(
            ".help-region--flow .help-flow-node"
          );
        }
      }
      if (scrollTarget) {
        try {
          scrollTarget.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } catch (err) {
          scrollTarget.scrollIntoView(true);
        }
      }

      if (typeof window.initHelpTooltipsForNodes === "function") {
        window.initHelpTooltipsForNodes();
      }
    }

    var debounce = null;
    input.addEventListener("input", function () {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(applySearch, 100);
    });

    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") {
        input.value = "";
        applySearch();
      }
    });
  }

  function renderHelpPage() {
    try {
      var container = document.querySelector(".help-container");
      if (!container) return;
      var lang = window.APP_LANG || "pt";
      if (container.getAttribute(HELP_RENDERED) === "1" && container.getAttribute(HELP_LANG) === lang) {
        return;
      }

      var t = tFn();


      var tLocal = function(k, defaultText) {
        return (window.I18N && window.I18N.t && window.I18N.t(k) !== k) ? window.I18N.t(k) : defaultText;
      };

      var keysConfig = [
        "robotName", "linesCount", "skuName", "productionBpm", 
        "boxesPerLayer", "layersPerPallet", "picksPerLayer", 
        "slipSheetBottom", "slipSheetBetweenLayers", "palletPick"
      ];
      
      var keysEngine = [
        "cycleTimeTotal", "realCadence", "efficiency",
        "cycleTimePickS", "cycleTimeSlipSheetS", "cycleTimePalletS",
        "generalRobotOccupancyRate", "generalMarginS"
      ];

      var keysBuffer = [
        "beltSpeedMMin", "boxLengthMm", "upstreamProductionBpm",
        "dynamicAccumulation", "recoveryTime", "safetyMargin", "saturation"
      ];

      var keysHeatmap = ["burdenOccupancy"];
      var keysInsights = ["insightSinglePick", "insightTransitionObfuscation"];

      var html = '<div class="help-surface">';
      html += '<div class="help-page-intro vs-card vs-card--main">';
      html += '<header class="help-page-head vs-card__header">';
      html += '<p class="help-page-kicker">' + escapeHtml(t("help_page_kicker")) + "</p>";
      html += '<h1 class="help-page-title vs-card__title">Manual de Engenharia de Aplicação</h1>';
      html += '<p class="help-page-lede vs-card__description">O Guia Definitivo da Operação: Conceitos, fórmulas e funcionamento dos motores do Cycle Timer.</p>';
      html += "</header>";

      html += '<div class="help-page-intro__search vs-card__content">';
      html += renderHelpSearchBar(t);
      html += "</div>";
      html += "</div>";
      html += renderHelpToc(t);

      html += '<div class="help-body">';
      html += renderFlowDiagram(t);

      html += '<div class="help-sections-manual">'; // Novo layout em lista (manual) em vez de colunas

      // 1. Config
      html += '<div class="help-manual-section">';
      html += '<p class="help-column-kicker">01. Fundamentos</p>';
      html += renderRegion("help-region-config", "help_region_config", "help_region_config_hint", keysConfig, t);
      html += '</div>';

      // 2. Engine
      html += '<div class="help-manual-section">';
      html += '<p class="help-column-kicker">02. Cálculos de Tempo e Capacidade</p>';
      html += renderRegion("help-region-engine", "Motor de Produtividade (Engine)", "Compreenda como o sistema calcula tempos totais, eficiência robótica e se a cadência atende a linha.", keysEngine, tLocal);
      html += '</div>';

      // 3. Buffer
      html += '<div class="help-manual-section">';
      html += '<p class="help-column-kicker">03. Esteiras e Acúmulo</p>';
      html += renderRegion("help-region-buffer", "Dimensionamento de Buffers", "Análise de risco de transbordos durante as trocas de pallet baseada no comprimento mecânico da esteira.", keysBuffer, tLocal);
      html += '</div>';

      // 4. Heatmaps
      html += '<div class="help-manual-section">';
      html += '<p class="help-column-kicker">04. Cruzamento de Linhas</p>';
      html += renderRegion("help-region-heatmap", "Matriz de Colisões (Combo Heatmap)", "No modo Campo Minado, o sistema cruza as taxas de parada de uma linha nas outras (Burden) para encontrar gargalos ocultos.", keysHeatmap, tLocal);
      html += '</div>';

      // 5. Insights
      html += '<div class="help-manual-section">';
      html += '<p class="help-column-kicker">05. Otimizações de Projeto</p>';
      html += renderRegion("help-region-insights", "Avaliador Inteligente (Insights)", "Explicação dos alertas automáticos e heurísticas de engenharia sugeridas pelo sistema.", keysInsights, tLocal);
      html += '</div>';

      html += "</div>"; // end manual
      html += "</div>"; // end body
      html += "</div>"; // end surface

      container.innerHTML = html;

      container.setAttribute(HELP_RENDERED, "1");
      container.setAttribute(HELP_LANG, lang);

      if (typeof window.initHelpTooltipsForNodes === "function") {
        window.initHelpTooltipsForNodes();
      }

      initHelpSearch(container);
    } catch (err) {
      console.error("[HelpPage] Error during render:", err);
      alert("[HelpPage] Render failed: " + err.message + "\n" + err.stack);
    }
  }

  window.renderHelpPage = function (force) {
    try {
      if (force) {
        var c = document.querySelector(".help-container");
        if (c) {
          c.removeAttribute(HELP_RENDERED);
        }
      }
      renderHelpPage();
    } catch (err) {
      console.error("[HelpPage] Error in window.renderHelpPage:", err);
      alert("[HelpPage] window.renderHelpPage failed: " + err.message + "\n" + err.stack);
    }
  };
})();
