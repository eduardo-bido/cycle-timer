(function () {
  'use strict';

  /* ── Constants ─────────────────────────────────────────────────────── */
  var CYCLES_VACUUM = 14;
  var CYCLES_CLAMP  = 12;

  var DEFAULTS = {
    'compact-production-rate': 20,
    'compact-boxes-per-layer': 8,
    'compact-picks-per-layer': 4,
    'compact-layers-per-pallet': 5,
    'compact-transition-time': 50
  };

  /* ── Element references ──────────────────────────────────────────── */
  var elGripperType, elTransitionTime;
  var elProd1, elBoxes1, elPicks1, elLayers1;
  var elProd2, elBoxes2, elPicks2, elLayers2;
  
  var elKpiOccupancy, elKpiOccupancyCard, elKpiOccupancyIndicator;
  var elKpiAccum;
  
  var elGeneralBars, elBarL1, elBarL2, elLabelL1, elLabelL2;

  /* ── Helpers ─────────────────────────────────────────────────────── */
  function num(el, fallback) {
    if (!el || el.value.trim() === '') return fallback !== undefined ? fallback : 0;
    var v = parseFloat(el.value);
    return isNaN(v) ? (fallback !== undefined ? fallback : 0) : v;
  }

  function t(key) {
    return (window.I18N && window.I18N.t) ? window.I18N.t(key) : key;
  }

  /* ── Core Calculation ────────────────────────────────────────────── */
  function recalculate() {
    var gripperType    = elGripperType.value || 'vacuum';
    var transitionTime = num(elTransitionTime, DEFAULTS['compact-transition-time']);

    var maxCycles = (gripperType === 'clamp') ? CYCLES_CLAMP : CYCLES_VACUUM;

    // Line 1 values
    var prod1   = num(elProd1, DEFAULTS['compact-production-rate']);
    var boxes1  = num(elBoxes1, DEFAULTS['compact-boxes-per-layer']);
    var picks1  = num(elPicks1, DEFAULTS['compact-picks-per-layer']);
    var layers1 = num(elLayers1, DEFAULTS['compact-layers-per-pallet']);

    // Line 2 values (no defaults, optional)
    var prod2   = num(elProd2, 0);
    var boxes2  = num(elBoxes2, DEFAULTS['compact-boxes-per-layer']);
    var picks2  = num(elPicks2, DEFAULTS['compact-picks-per-layer']);
    var layers2 = num(elLayers2, DEFAULTS['compact-layers-per-pallet']);

    // Boxes per cycle
    var bpc1 = (picks1 > 0) ? (boxes1 / picks1) : 0;
    var bpc2 = (picks2 > 0) ? (boxes2 / picks2) : 0;

    // Required cycles per minute
    var reqCycles1 = (bpc1 > 0) ? (prod1 / bpc1) : 0;
    var reqCycles2 = (bpc2 > 0) ? (prod2 / bpc2) : 0;

    // Occupancy
    var occ1 = (reqCycles1 / maxCycles) * 100;
    var occ2 = (reqCycles2 / maxCycles) * 100;
    var totalOcc = occ1 + occ2;

    // Accumulation eval L1
    var canClear1 = true;
    if (prod1 > 0) {
      var availCyclesForL1 = maxCycles - reqCycles2;
      var netClearCap1 = availCyclesForL1 * bpc1;
      var netClearingRate1 = netClearCap1 - prod1;
      var accumBoxes1 = prod1 * (transitionTime / 60);
      var palletLife1 = (boxes1 * layers1) / prod1;
      
      if (netClearingRate1 > 0) {
        var timeToClear1 = accumBoxes1 / netClearingRate1;
        var availWindow1 = palletLife1 - (transitionTime / 60);
        canClear1 = timeToClear1 <= availWindow1;
      } else {
        canClear1 = false; // Cannot clear if robot pull rate is less than production rate
      }
    }

    // Accumulation eval L2
    var canClear2 = true;
    if (prod2 > 0) {
      var availCyclesForL2 = maxCycles - reqCycles1;
      var netClearCap2 = availCyclesForL2 * bpc2;
      var netClearingRate2 = netClearCap2 - prod2;
      var accumBoxes2 = prod2 * (transitionTime / 60);
      var palletLife2 = (boxes2 * layers2) / prod2;
      
      if (netClearingRate2 > 0) {
        var timeToClear2 = accumBoxes2 / netClearingRate2;
        var availWindow2 = palletLife2 - (transitionTime / 60);
        canClear2 = timeToClear2 <= availWindow2;
      } else {
        canClear2 = false;
      }
    }

    var overallClear = canClear1 && canClear2;
    if (totalOcc > 100) overallClear = false;

    /* ── Update DOM ──────────────────────────────────────────── */
    elKpiOccupancy.textContent = totalOcc.toFixed(1) + '%';

    var occClass = '';
    if (totalOcc <= 85) occClass = 'occ--good';
    else if (totalOcc <= 95) occClass = 'occ--warn';
    else occClass = 'occ--bad';

    if (elKpiOccupancyCard) {
      elKpiOccupancyCard.classList.remove('occ--good', 'occ--warn', 'occ--bad');
      elKpiOccupancyCard.classList.add(occClass);
    }
    if (elKpiOccupancy) {
      elKpiOccupancy.classList.remove('occ--good', 'occ--warn', 'occ--bad');
      elKpiOccupancy.classList.add(occClass);
    }
    if (elKpiOccupancyIndicator) {
      elKpiOccupancyIndicator.classList.remove('occ--good', 'occ--warn', 'occ--bad');
      elKpiOccupancyIndicator.classList.add(occClass);
    }

    if (overallClear) {
      elKpiAccum.textContent = '✅';
      elKpiAccum.className   = 'output-exec-kpi-value txt-ok';
    } else {
      elKpiAccum.textContent = '❌';
      elKpiAccum.className   = 'output-exec-kpi-value txt-fail';
    }

    /* General bars update */
    if (elGeneralBars) {
      elGeneralBars.style.display = 'block';
      
      // Cap visual limits
      var renderOcc1 = Math.min(occ1, 100);
      var renderOcc2 = Math.min(occ2, 100 - renderOcc1); // Stacked
      
      elBarL1.style.width = renderOcc1 + '%';
      elBarL2.style.width = renderOcc2 + '%';
      
      elLabelL1.textContent = (occ1 > 0) ? 'L1 - ' + occ1.toFixed(0) + '%' : '';
      elLabelL2.textContent = (occ2 > 0) ? 'L2 - ' + occ2.toFixed(0) + '%' : '';
    }
  }

  /* ── Bootstrap ───────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    elGripperType    = document.getElementById('compact-gripper-type');
    elTransitionTime = document.getElementById('compact-transition-time');

    elProd1   = document.getElementById('compact-production-rate-1');
    elBoxes1  = document.getElementById('compact-boxes-per-layer-1');
    elPicks1  = document.getElementById('compact-picks-per-layer-1');
    elLayers1 = document.getElementById('compact-layers-per-pallet-1');

    elProd2   = document.getElementById('compact-production-rate-2');
    elBoxes2  = document.getElementById('compact-boxes-per-layer-2');
    elPicks2  = document.getElementById('compact-picks-per-layer-2');
    elLayers2 = document.getElementById('compact-layers-per-pallet-2');

    elKpiOccupancy     = document.getElementById('compact-kpi-occupancy');
    elKpiOccupancyCard = document.getElementById('compact-kpi-occupancy-card');
    elKpiOccupancyIndicator = document.getElementById('compact-kpi-occupancy-indicator');
    elKpiAccum         = document.getElementById('compact-kpi-accum');

    elGeneralBars = document.getElementById('compact-general-bars');
    elBarL1       = document.getElementById('compact-bar-l1');
    elBarL2       = document.getElementById('compact-bar-l2');
    elLabelL1     = document.getElementById('compact-label-l1');
    elLabelL2     = document.getElementById('compact-label-l2');

    var inputs = [
      elGripperType, elTransitionTime,
      elProd1, elBoxes1, elPicks1, elLayers1,
      elProd2, elBoxes2, elPicks2, elLayers2,
      // also wire up text inputs just in case, though they don't affect numbers
      document.getElementById('compact-sku-name-1'),
      document.getElementById('compact-sku-name-2'),
      document.getElementById('compact-project-name')
    ];

    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i]) inputs[i].addEventListener('input', recalculate);
    }

    // Initial calc if module is loaded
    recalculate();
  });

})();
