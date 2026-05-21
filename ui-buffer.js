// Controle do Módulo Buffer Analyzer
(function() {
  const BUFFER_DATA_KEY = "cycle-timer-buffer-v1";

  // Engine de Cálculo de Buffer
  const inputs = {
    infeed: document.getElementById('buf-infeed-rate'),
    outfeed: document.getElementById('buf-outfeed-rate'),
    stopTime: document.getElementById('buf-pallet-transition'),
    boxesPerPallet: document.getElementById('buf-boxes-per-pallet'),
    length: document.getElementById('buf-length'),
    width: document.getElementById('buf-width'),
    boxLength: document.getElementById('buf-box-length'),
    boxWidth: document.getElementById('buf-box-width')
  };

  const outputs = {
    physCap: document.querySelectorAll('.m-phys-cap'),
    stopAccum: document.querySelectorAll('.m-stop-accum'),
    recovery: document.querySelectorAll('.m-recovery-time'),
    safetyMargin: document.querySelectorAll('.m-safety-margin'),
    critOcc: document.querySelectorAll('.m-crit-occ'),
    verdict: document.querySelectorAll('.engineering-verdict'),
    fillBar: document.querySelectorAll('.conveyor-fill'),
    statusTag: document.querySelectorAll('.buffer-status-tag')
  };

  // Helper functions to update all matching elements in nodelists
  function updateText(nodelist, text) {
    if (nodelist) {
      nodelist.forEach(el => {
        el.textContent = text;
      });
    }
  }

  function updateColor(nodelist, color) {
    if (nodelist) {
      nodelist.forEach(el => {
        el.style.color = color;
      });
    }
  }

  function updateHTML(nodelist, html) {
    if (nodelist) {
      nodelist.forEach(el => {
        el.innerHTML = html;
      });
    }
  }

  function updateClassName(nodelist, className) {
    if (nodelist) {
      nodelist.forEach(el => {
        el.className = className;
      });
    }
  }

  function updateStyle(nodelist, prop, value) {
    if (nodelist) {
      nodelist.forEach(el => {
        el.style[prop] = value;
      });
    }
  }

  const TRANSLATIONS = {
    pt: {
      saturate_title: "❌ IMPRESCINDÍVEL REVISAR:",
      saturate_body: (outfeed, infeed) => `O robô paletiza a uma taxa de ${outfeed} cpm, enquanto a linha produz ${infeed} cpm. <br><br>Independente do tamanho do buffer, o sistema irá parar eventualmente pois não há diferencial de velocidade para esvaziar o acúmulo. Sugerimos aumentar a velocidade do robô ou reduzir o infeed.`,
      saturate_tag: "Saturação",
      insufficient_title: "⚠️ BUFFER INSUFICIENTE:",
      insufficient_body: (stopS, stopAccum, physCap, extraMM) => `Para absorver a troca de pallet de ${stopS}s, você precisa de um acúmulo de pelo menos ${stopAccum} caixas.<br><br>Atualmente sua esteira comporta apenas ${physCap} caixas. É necessário aumentar o comprimento em pelo menos <strong>${extraMM} metros</strong> para evitar a parada da linha.`,
      insufficient_tag: "Transborda",
      risk_title: "⚠️ OPERAÇÃO EM RISCO:",
      risk_body: (occPct, safetyMarginTimeS) => `O buffer comporta o acúmulo planejado, mas a ocupação chega a ${occPct.toFixed(0)}%.<br><br>Sua margem de erro é de apenas <strong>${safetyMarginTimeS} segundos</strong>. Qualquer micro-parada adicional além da troca de pallet causará transbordo. Recomendamos expandir o buffer para uma operação mais robusta.`,
      risk_tag: "Limite",
      validated_title: "✅ PROJETO VALIDADO:",
      validated_body: (safetyMarginTimeS, recoveryTimeS) => `O dimensionamento é robusto. O buffer absorve a troca de pallet e ainda oferece <strong>${safetyMarginTimeS}s</strong> de pulmão extra para imprevistos.<br><br>O tempo de recuperação de ${Math.ceil(recoveryTimeS)}s é adequado, permitindo que o sistema retorne ao estado vazio rapidamente.`,
      validated_tag: "Seguro",
      waiting: "Preencha os parâmetros para ver o veredito técnico.",
      waiting_tag: "Aguardando dados",
      infeed_err: "Impossível simular: O sistema está saturado (Entrada >= Saída).",
      sim_start: "Iniciando...",
      sim_phase1: (stopS) => `Fase 1: Acumulando (${stopS}s)...`,
      sim_overflow: "ALERTA: TRANSBORDO!",
      sim_phase2: (recoveryS) => `Fase 2: Recuperando (${Math.ceil(recoveryS)}s)...`,
      sim_ok: "Ciclo Concluído: OK",
      boxes: "caixas",
      saturate_rec: "Satura (Robô < Linha)",
      negative_overflow: "Negativa (Transborda)"
    },
    en: {
      saturate_title: "❌ CRITICAL REVIEW REQUIRED:",
      saturate_body: (outfeed, infeed) => `The robot palletizes at a rate of ${outfeed} cpm, while the line produces ${infeed} cpm. <br><br>Regardless of the buffer size, the system will eventually stop because there is no speed differential to empty the accumulation. We suggest increasing the robot speed or reducing the infeed.`,
      saturate_tag: "Saturation",
      insufficient_title: "⚠️ INSUFFICIENT BUFFER:",
      insufficient_body: (stopS, stopAccum, physCap, extraMM) => `To absorb the ${stopS}s pallet exchange, you need an accumulation of at least ${stopAccum} boxes.<br><br>Currently your conveyor holds only ${physCap} boxes. It is necessary to increase the length by at least <strong>${extraMM} meters</strong> to avoid stopping the line.`,
      insufficient_tag: "Overflow",
      risk_title: "⚠️ OPERATION AT RISK:",
      risk_body: (occPct, safetyMarginTimeS) => `The buffer holds the planned accumulation, but occupancy reaches ${occPct.toFixed(0)}%.<br><br>Your margin of error is only <strong>${safetyMarginTimeS} seconds</strong>. Any additional micro-stop beyond the pallet exchange will cause overflow. We recommend expanding the buffer for a more robust operation.`,
      risk_tag: "Limit",
      validated_title: "✅ PROJECT VALIDATED:",
      validated_body: (safetyMarginTimeS, recoveryTimeS) => `The dimensioning is robust. The buffer absorbs the pallet exchange and still offers <strong>${safetyMarginTimeS}s</strong> of extra buffer time for contingencies.<br><br>The recovery time of ${Math.ceil(recoveryTimeS)}s is adequate, allowing the system to return to the empty state quickly.`,
      validated_tag: "Safe",
      waiting: "Fill parameters to view the technical verdict.",
      waiting_tag: "Awaiting data",
      infeed_err: "Cannot simulate: System is saturated (Infeed >= Outfeed).",
      sim_start: "Starting...",
      sim_phase1: (stopS) => `Phase 1: Accumulating (${stopS}s)...`,
      sim_overflow: "ALERT: OVERFLOW!",
      sim_phase2: (recoveryS) => `Phase 2: Recovering (${Math.ceil(recoveryS)}s)...`,
      sim_ok: "Cycle Completed: OK",
      boxes: "boxes",
      saturate_rec: "Saturates (Robot < Line)",
      negative_overflow: "Negative (Overflow)"
    }
  };

  // --- PERSISTÊNCIA ---
  function saveData() {
    const data = {};
    Object.keys(inputs).forEach(key => {
      if (inputs[key]) {
        data[key] = inputs[key].value;
      }
    });
    localStorage.setItem(BUFFER_DATA_KEY, JSON.stringify(data));
  }

  function loadData() {
    try {
      const saved = localStorage.getItem(BUFFER_DATA_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        Object.keys(data).forEach(key => {
          if (inputs[key]) {
            inputs[key].value = data[key];
          }
        });
      }
      calculate(); // Recalcula após carregar (ou seta padrão se vazio)
    } catch (e) {
      console.error("Erro ao carregar dados do buffer:", e);
    }
  }

  function calculate() {
    if (!inputs.infeed) return; // Not fully initialized or missing

    const lang = localStorage.getItem("cycle-timer-lang") || "pt";
    const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;

    const infeed = parseFloat(inputs.infeed.value) || 0;
    const outfeed = parseFloat(inputs.outfeed.value) || 0;
    const stopS = parseFloat(inputs.stopTime.value) || 0;
    const bufL = parseFloat(inputs.length.value) || 0;
    const boxL = parseFloat(inputs.boxLength.value) || 0;

    if (!infeed || !outfeed || !bufL || !boxL) {
      resetOutputs();
      return;
    }

    // --- CÁLCULOS DE ENGENHARIA ---

    // 1. Capacidade Física Linear (Quantas caixas cabem na esteira)
    const physCap = Math.floor(bufL / boxL);
    
    // 2. Acúmulo Dinâmico na Parada (Worst Case)
    const stopAccum = Math.ceil((infeed / 60) * stopS);

    // 3. Margem de Segurança
    const safetyMarginBoxes = physCap - stopAccum;
    const safetyMarginTimeS = Math.floor((safetyMarginBoxes / (infeed / 60)));

    // 4. Análise de Recuperação
    const recoveryRate = outfeed - infeed; 
    let recoveryTimeS = 0;
    let isSaturated = recoveryRate <= 0;

    if (!isSaturated) {
      recoveryTimeS = (stopAccum / recoveryRate) * 60;
    }

    // 5. Ocupação Crítica (%)
    const occPct = physCap > 0 ? (stopAccum / physCap) * 100 : 0;

    // --- ATUALIZAÇÃO DA UI ---
    
    updateText(outputs.physCap, physCap + " " + t.boxes + " (" + (bufL/1000).toFixed(1) + "m)");
    updateText(outputs.stopAccum, stopAccum + " " + t.boxes);
    
    if (isSaturated) {
      updateText(outputs.recovery, t.saturate_rec);
      updateColor(outputs.recovery, "#ef4444");
    } else {
      updateText(outputs.recovery, Math.ceil(recoveryTimeS) + "s");
      updateColor(outputs.recovery, "");
    }

    if (safetyMarginBoxes < 0) {
      updateText(outputs.safetyMargin, t.negative_overflow);
      updateColor(outputs.safetyMargin, "#ef4444");
    } else {
      updateText(outputs.safetyMargin, "+" + safetyMarginTimeS + "s");
      const color = safetyMarginTimeS < 10 ? "#eab308" : "#22c55e";
      updateColor(outputs.safetyMargin, color);
    }

    updateText(outputs.critOcc, occPct.toFixed(1) + "%");

    // Veredito Técnico
    let verdict = "";
    let vClass = "";
    let tClass = "";
    let tText = "";

    if (isSaturated) {
      verdict = `<strong>${t.saturate_title}</strong> ${t.saturate_body(outfeed, infeed)}`;
      vClass = "verdict--danger";
      tClass = "tag--danger";
      tText = t.saturate_tag;
    } else if (occPct > 100) {
      const neededMM = (stopAccum * boxL);
      const extraMM = ((neededMM - bufL)/1000).toFixed(1);
      verdict = `<strong>${t.insufficient_title}</strong> ${t.insufficient_body(stopS, stopAccum, physCap, extraMM)}`;
      vClass = "verdict--danger";
      tClass = "tag--danger";
      tText = t.insufficient_tag;
    } else if (occPct > 80) {
      verdict = `<strong>${t.risk_title}</strong> ${t.risk_body(occPct, safetyMarginTimeS)}`;
      vClass = "verdict--warn";
      tClass = "tag--warn";
      tText = t.risk_tag;
    } else {
      verdict = `<strong>${t.validated_title}</strong> ${t.validated_body(safetyMarginTimeS, recoveryTimeS)}`;
      vClass = "verdict--good";
      tClass = "tag--good";
      tText = t.validated_tag;
    }

    updateHTML(outputs.verdict, verdict);
    updateClassName(outputs.verdict, "engineering-verdict buffer-verdict-box " + vClass);
    
    updateText(outputs.statusTag, tText);
    updateClassName(outputs.statusTag, "buffer-status-tag buffer-tag " + tClass);

    return { occPct, stopAccum, physCap, isSaturated };
  }

  function resetOutputs() {
    const lang = localStorage.getItem("cycle-timer-lang") || "pt";
    const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;

    updateText(outputs.physCap, "—");
    updateText(outputs.stopAccum, "—");
    updateText(outputs.recovery, "—");
    updateText(outputs.safetyMargin, "—");
    updateText(outputs.critOcc, "—");
    
    updateHTML(outputs.verdict, t.waiting);
    updateClassName(outputs.verdict, "engineering-verdict buffer-verdict-box");
    
    updateText(outputs.statusTag, t.waiting_tag);
    updateClassName(outputs.statusTag, "buffer-status-tag buffer-tag tag--neutral");
    
    updateStyle(outputs.fillBar, "width", "0%");
  }

  // Simulação de Ciclo Completo
  let simTimeout = null;
  const simBtns = document.querySelectorAll('.btn-simulate-cycle');
  const resetBtns = document.querySelectorAll('.btn-reset-sim');
  const simTimers = document.querySelectorAll('.sim-status-timer');

  simBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = localStorage.getItem("cycle-timer-lang") || "pt";
      const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;

      const data = calculate();
      if (!data || data.isSaturated) {
         alert(t.infeed_err);
         return;
      }

      // Reset inicial
      clearTimeout(simTimeout);
      updateStyle(outputs.fillBar, "transition", "none");
      updateStyle(outputs.fillBar, "width", "0%");
      updateStyle(outputs.fillBar, "backgroundColor", "var(--vs-primary)");
      updateText(simTimers, t.sim_start);

      setTimeout(() => {
        // FASE 1: ACÚMULO (PARADA DO ROBÔ)
        const stopS = parseFloat(inputs.stopTime.value);
        updateText(simTimers, t.sim_phase1(stopS));
        updateStyle(outputs.fillBar, "transition", `width ${stopS/4}s linear, background-color 0.5s`); // Acelerado 4x para não entediar
        updateStyle(outputs.fillBar, "width", Math.min(100, data.occPct) + "%");
        
        if (data.occPct > 100) {
           simTimeout = setTimeout(() => { 
             updateStyle(outputs.fillBar, "backgroundColor", "#ef4444"); 
             updateText(simTimers, t.sim_overflow);
           }, (stopS/4) * 800);
        }

        // FASE 2: RECUPERAÇÃO (ROBÔ VOLTA)
        simTimeout = setTimeout(() => {
          if (data.occPct <= 100) {
            const recoveryS = (data.stopAccum / (parseFloat(inputs.outfeed.value) - parseFloat(inputs.infeed.value))) * 60;
            updateText(simTimers, t.sim_phase2(recoveryS));
            updateStyle(outputs.fillBar, "transition", `width ${recoveryS/4}s linear`);
            updateStyle(outputs.fillBar, "width", "0%");
            
            simTimeout = setTimeout(() => {
              updateText(simTimers, t.sim_ok);
            }, (recoveryS/4) * 1000);
          }
        }, (stopS/4) * 1000 + 500);

      }, 100);
    });
  });

  resetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      clearTimeout(simTimeout);
      updateStyle(outputs.fillBar, "transition", "width 0.3s ease");
      updateStyle(outputs.fillBar, "width", "0%");
      updateText(simTimers, "");
    });
  });

  // Listeners
  Object.values(inputs).forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        calculate();
        saveData();
      });
    }
  });

  // React to language change
  window.addEventListener("app-language-changed", () => {
    calculate();
  });

  // Export buffer to global window for external triggers if needed
  window.triggerBufferRecompute = calculate;

  // Inicialização
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadData);
  } else {
    loadData();
  }

})();
