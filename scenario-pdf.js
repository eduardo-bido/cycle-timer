// Exportação PDF do cenário atual (pdfMake + vfs_fonts).
// Conclusão "atende": ocupação geral (soma das taxas) <= 95% em taxa (0–1 → <= 0,95)
// e nenhuma linha com acúmulo em estado "não atende" (qty>0 e netRemoval<=0 em slip ou pallet).

(function () {
  function t(key) {
    if (window.I18N && typeof window.I18N.t === "function") {
      return window.I18N.t(key);
    }
    return key;
  }

  function isValidNumber(value) {
    return typeof value === "number" && isFinite(value);
  }

  function clearanceAccumulationFails(results, slipOrPallet) {
    var qty =
      slipOrPallet === "slip"
        ? results.productNumberInSlipAccumulation
        : results.productsNumberInPalletAccumulation;
    var net = results.netRemovalBoxesPerSecond;
    return (
      isValidNumber(qty) &&
      qty > 0 &&
      isValidNumber(net) &&
      net <= 0
    );
  }

  function lineHasCriticalAccumulation(results) {
    if (!results) return false;
    return (
      clearanceAccumulationFails(results, "slip") ||
      clearanceAccumulationFails(results, "pallet")
    );
  }

  /**
   * @param {{ occGeneral: number|null }} general
   * @param {Array<{ recipeRowId: string|null, results: object|null }>} lines
   */
  function computeScenarioConclusionAttends(general, lines) {
    var occ = general && general.occGeneral;
    var occOk = isValidNumber(occ) && occ <= 0.95;
    var anyAccumFail = false;
    var i;
    for (i = 0; i < lines.length; i++) {
      var ln = lines[i];
      if (!ln.results || !ln.recipeRowId) continue;
      if (lineHasCriticalAccumulation(ln.results)) {
        anyAccumFail = true;
        break;
      }
    }
    return occOk && !anyAccumFail;
  }

  function formatPctRate(rate) {
    if (!isValidNumber(rate)) return "—";
    return (rate * 100).toFixed(1) + " %";
  }

  function formatNum2(v) {
    if (!isValidNumber(v)) return "—";
    return v.toFixed(2);
  }

  function formatOptionalInt(v) {
    if (!isValidNumber(v)) return "—";
    return String(Math.round(v));
  }

  function maxAccumProducts(results) {
    if (!results) return null;
    var candidates = [];
    if (isValidNumber(results.productNumberInSlipAccumulation)) {
      candidates.push(results.productNumberInSlipAccumulation);
    }
    if (isValidNumber(results.productsNumberInPalletAccumulation)) {
      candidates.push(results.productsNumberInPalletAccumulation);
    }
    if (!candidates.length) return null;
    return Math.max.apply(null, candidates);
  }

  function lineCriticalStatus(line) {
    var r = line.results;
    if (!r || !line.recipeRowId) return "—";
    if (lineHasCriticalAccumulation(r)) {
      return t("pdf_critical_accumulation");
    }
    var occ = r.robotOccupancyRate;
    if (isValidNumber(occ) && occ > 0.95) {
      return t("pdf_critical_occupancy");
    }
    return "—";
  }

  function robotModelLabel() {
    var sel = document.getElementById("robot-model");
    if (!sel || sel.selectedIndex < 0) return "—";
    var opt = sel.options[sel.selectedIndex];
    return opt ? String(opt.text || opt.value || "—") : "—";
  }

  function linesCountLabel() {
    var el = document.getElementById("robot-lines-count");
    if (!el) return "—";
    var n = parseInt(el.value, 10);
    return isFinite(n) ? String(n) : "—";
  }

  function localeTag() {
    return (window.APP_LANG || "pt") === "en" ? "en-US" : "pt-BR";
  }

  window.exportCycleTimerScenarioPdf = function () {
    if (typeof window.getCycleTimerExportPayload !== "function") {
      window.alert(t("pdf_error_payload"));
      return;
    }
    if (typeof pdfMake === "undefined") {
      window.alert(t("pdf_error_lib"));
      return;
    }

    var payload = window.getCycleTimerExportPayload();
    var general = payload.general;
    var lines = payload.lines;
    var attends = computeScenarioConclusionAttends(general, lines);
    var now = new Date();
    var dateStr = now.toLocaleString(localeTag(), {
      dateStyle: "short",
      timeStyle: "short"
    });

    var conclusionText = attends
      ? t("pdf_conclusion_attends")
      : t("pdf_conclusion_not_attends");

    var kpiRows = [
      [t("output_exec_occupancy"), formatPctRate(general.occGeneral)],
      [t("output_exec_cycles_per_min"), formatNum2(general.cyclesPerMinGeneral)],
      [t("output_exec_required_time"), formatNum2(general.reqGeneral) + " s"],
      [t("output_exec_robot_time"), formatNum2(general.avGeneral) + " s"],
      [t("output_exec_margin"), formatNum2(general.marginGeneral) + " s"]
    ];

    var lineHeaders = [
      t("pdf_col_line"),
      t("pdf_col_recipe"),
      t("pdf_col_occ"),
      t("pdf_col_cpm"),
      t("pdf_col_required"),
      t("pdf_col_max_accum"),
      t("pdf_col_critical")
    ];

    var lineBody = [];
    var i;
    for (i = 0; i < lines.length; i++) {
      var ln = lines[i];
      var r = ln.results;
      var hasRecipe = ln.recipeRowId != null && String(ln.recipeRowId) !== "";
      lineBody.push([
        t("output_line_prefix") + " " + ln.lineIndex,
        hasRecipe ? ln.recipeDisplayLabel : "—",
        hasRecipe && r ? formatPctRate(r.robotOccupancyRate) : "—",
        hasRecipe && r ? formatNum2(r.cyclesNumberPerMinute) : "—",
        hasRecipe && r ? formatNum2(r.totalTimeOfPalletStackingS) + " s" : "—",
        hasRecipe && r ? formatOptionalInt(maxAccumProducts(r)) : "—",
        hasRecipe ? lineCriticalStatus(ln) : "—"
      ]);
    }

    var docDefinition = {
      pageMargins: [40, 48, 40, 56],
      content: [
        { text: "Cycle Timer", style: "title" },
        { text: t("pdf_report_subtitle"), style: "sub", margin: [0, 4, 0, 16] },
        {
          columns: [
            { width: "*", stack: [{ text: t("pdf_lab_date"), style: "lab" }, { text: dateStr }] },
            {
              width: "*",
              stack: [
                { text: t("pdf_lab_robot"), style: "lab" },
                { text: robotModelLabel() }
              ]
            },
            {
              width: "auto",
              stack: [
                { text: t("pdf_lab_lines"), style: "lab" },
                { text: linesCountLabel() }
              ]
            }
          ],
          margin: [0, 0, 0, 20]
        },
        { text: t("pdf_section_conclusion"), style: "h2", margin: [0, 0, 0, 6] },
        { text: conclusionText, style: "conclusion", margin: [0, 0, 0, 20] },
        { text: t("pdf_section_kpis"), style: "h2", margin: [0, 0, 0, 8] },
        {
          table: {
            widths: ["*", "*"],
            body: kpiRows.map(function (row) {
              return [{ text: row[0], style: "tdLab" }, { text: row[1], style: "tdVal" }];
            })
          },
          layout: "lightHorizontalLines",
          margin: [0, 0, 0, 20]
        },
        { text: t("pdf_section_lines"), style: "h2", margin: [0, 0, 0, 8] },
        {
          table: {
            headerRows: 1,
            widths: [42, "*", 52, 48, 56, 52, "*"],
            body: [lineHeaders.map(function (h) { return { text: h, style: "th", bold: true }; })].concat(
              lineBody.map(function (row) {
                return row.map(function (cell) {
                  return { text: String(cell), style: "tdSmall" };
                });
              })
            )
          },
          layout: "lightHorizontalLines"
        }
      ],
      styles: {
        title: { fontSize: 18, bold: true },
        sub: { fontSize: 10, color: "#555555" },
        h2: { fontSize: 12, bold: true },
        lab: { fontSize: 8, bold: true, color: "#666666" },
        conclusion: { fontSize: 11, bold: true },
        tdLab: { fontSize: 10, bold: true },
        tdVal: { fontSize: 10 },
        th: { fontSize: 8 },
        tdSmall: { fontSize: 8 }
      },
      defaultStyle: { font: "Roboto", fontSize: 10 }
    };

    var safeName = "cycle-timer-" + now.toISOString().slice(0, 10) + ".pdf";
    try {
      var pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBlob(function (blob) {
        if (typeof window.cycleTimerTriggerDownload === "function") {
          window.cycleTimerTriggerDownload(safeName, blob, "application/pdf");
        } else {
          pdfDoc.download(safeName);
        }
      });
    } catch (_e) {
      window.alert(t("pdf_error_generate"));
    }
  };
})();
