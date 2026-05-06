// insights-evaluator.js
window.CycleTimerInsights = (function() {
  // Armazena o estado "hasheado" da última notificação para não flodar o usuário
  var activeInsights = {};

  function getHash(type, id) {
    return type + '|' + id;
  }

  /**
   * Recebe o cenário processado do ui-outputs.js
   * @param {{ general: any, lines: any[] }} payload
   */
  function scheduleUpdate(payload) {
    function t(key) {
      if (window.I18N && typeof window.I18N.t === 'function') {
        return window.I18N.t(key);
      }
      return key;
    }
    
    if (!payload || !payload.general || !payload.lines) return;
    
    var currentInsights = {};
    var g = payload.general;
    var lines = payload.lines;

    // 1. Ocupação Global do Robô (Geral da Aba Output)
    if (g.occGeneral !== null) {
      var occ = g.occGeneral * 100;
      var occFormatted = occ.toFixed(1) + '%';
      
      if (occ > 95) {
        currentInsights['occ_global'] = {
          type: 'critical',
          title: t('insight_occ_global_critical_title').replace('{{value}}', occFormatted),
          message: t('insight_occ_global_critical_msg')
        };
      } else if (occ >= 90 && occ <= 95) {
        currentInsights['occ_global'] = {
          type: 'warning',
          title: t('insight_occ_global_warn_title').replace('{{value}}', occFormatted),
          message: t('insight_occ_global_warn_msg')
        };
      }
    }

    // 2. Remoção Líquida por Linha Ativa
    // Iremos verificar cada linha que possui um resultado válido
    for (var i = 0; i < lines.length; i++) {
        var ln = lines[i];
        if (!ln || !ln.results || !ln.recipeRowId) continue;
        
        var r = ln.results;
        var lineNum = ln.lineIndex;

        if (r.netRemovalBoxesPerSecond !== null && r.netRemovalBoxesPerSecond <= 0) {
            // Se houver caixas na acumulação (ou se for taxa zero), avisamos
            currentInsights['net_line_' + lineNum] = {
                type: 'critical',
                title: t('insight_net_removal_critical_title').replace('{{n}}', lineNum),
                message: t('insight_net_removal_critical_msg')
            };
        } else if (r.canClearAccumulation && r.canClearAccumulation.slip === false) {
            currentInsights['slip_accum_' + lineNum] = {
                type: 'warning',
                title: t('insight_slip_accum_warn_title').replace('{{n}}', lineNum),
                message: t('insight_slip_accum_warn_msg')
            };
        }
    }

    // Compara o que foi avaliado agora com o que estava ativo e mostra a notificação
    for (var key in currentInsights) {
      if (!Object.prototype.hasOwnProperty.call(currentInsights, key)) continue;
      
      var insight = currentInsights[key];
      var hash = getHash(insight.type, insight.title);
      
      if (activeInsights[key] !== hash) {
        if (window.InsightsToast) {
          window.InsightsToast.show(insight.type, insight.title, insight.message);
        }
        activeInsights[key] = hash;
      }
    }

    // Limpeza de memória: remove insights que não existem mais neste novo snapshot
    for (var ak in activeInsights) {
      if (!Object.prototype.hasOwnProperty.call(activeInsights, ak)) continue;
      if (!currentInsights[ak]) {
        delete activeInsights[ak];
      }
    }
  }

  // Compatibilidade caso algum código ainda tente chamar o nome antigo
  return {
    scheduleUpdate: scheduleUpdate,
    evaluate: function(state) {
        // Redireciona simulando um payload se necessário, 
        // mas idealmente ui-outputs já chama scheduleUpdate.
        if (state && state.results) {
           scheduleUpdate({ 
               general: { occGeneral: state.results.robotOccupancyRate },
               lines: [{ lineIndex: 1, results: state.results, recipeRowId: "1" }] 
           });
        }
    }
  };
})();
