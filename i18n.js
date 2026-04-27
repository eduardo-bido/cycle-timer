// i18n simples (PT-BR padrão) para toda a UI.
(function () {
  var STORAGE_KEY = "cycle-timer-lang";

  var I18N = {
    pt: {
      app_subtitle: "Ferramenta técnica de capacidade (paletização)",
      hero_title: "Ocupação do robô / Status",
      hero_occupancy_label: "Ocupação do robô",
      hero_status_label: "Status",
      hero_palletsHour: "Pallets/hora",
      hero_avgCycle: "Tempo médio de ciclo",

      outputs_prod_title: "Dados de produção",
      outputs_fixed_title: "Tempos fixos",
      outputs_results_title: "Resultados",
      outputs_slipBottom_short: "Slip sheet no fundo",
      outputs_slipBetween_short: "Slip sheet entre camadas",
      outputs_palletPick_short: "Pallet pick",

      res_totalBoxes: "Total de caixas no pallet",
      res_picksPallet: "Picks/pallet",
      res_gap: "Intervalo entre caixas (s)",
      res_boxesCycle: "Caixas/ciclo",
      res_totalCyclePallet: "Total de ciclos/pallet",
      res_cyclePicks: "Tempo total de ciclo/picks (s)",
      res_cycleSlip: "Tempo total de ciclo/slip sheet (s)",
      res_cyclePallets: "Tempo total de ciclo/pallets (s)",
      res_totalStacking: "Tempo total de stacking (s)",
      res_accum_exchange: "Tempo de acumulação até troca de pallet (s)",
      res_prod_slipAccum: "Qtd. produtos na acumulação/aplicação de slip sheet",
      res_cycles_emptySlip: "Qtd. ciclos para esvaziar acumulação (slip sheet)",
      res_prod_palletAccum: "Qtd. produtos na acumulação/troca de pallet",
      res_cycles_emptyPallet: "Qtd. ciclos para esvaziar a acumulação (pallet)",
      res_totalTimePalletStack: "Tempo total de montagem do pallet (s)",
      res_robotOcc: "Ocupação do robô",
      res_cyclesMin: "Ciclos/minuto",
      res_avgCycleS: "Tempo médio de ciclo (s)",
      res_palletsHour: "Pallets/hora",
      tabs_inputs: "ENTRADAS",
      tabs_outputs: "SAÍDAS",
      tabs_help: "AJUDA",

      sidebar_recipe: "Receita / SKU",
      sidebar_pallet: "Configuração de pallet",
      sidebar_picking: "Picking",
      sidebar_fixedTimes: "Tempos fixos",

      label_skuName: "SKU / Nome da receita",
      placeholder_skuName: "Ex.: SKU 123 - Linha CX 12kg",
      label_production: "Produção (cx/min)",

      label_boxesPerLayer: "Caixas por camada",
      label_layersPerPallet: "Camadas por pallet",
      label_picksPerLayer: "Qtd. picks (picks/camada)",
      label_palletPick: "Pallet pick (ciclos/pallet)",
      label_slipBottom: "Slip sheet no fundo (qtd)",
      label_slipBetween: "Slip sheet entre camadas (qtd)",

      label_robot: "Robô",
      placeholder_robot: "Ex.: KR240",
      label_cyclePick: "Tempo ciclo/pick (s)",
      label_cycleSlip: "Tempo ciclo/slip sheet (s)",
      label_cyclePallet: "Tempo ciclo/pallet (s)",

      output_title: "Resultados (tempo real)",
      output_lineKicker: "Linha analisada",
      output_lineLabel: "Linha",
      output_lineValue: "Receita atual",
      output_lineHint: "Preparado para múltiplas receitas/linhas.",

      output_primary_title: "Robô",
      output_primary_occ: "Ocupação",
      output_primary_cpm: "Ciclos/min",
      verdict: "Veredito",

      viz_title: "Visualização (capacidade)",
      chart_placeholder: "Gráfico (placeholder): requerido vs disponível / capacidade.",

      section_critical: "Números críticos",
      critical_required: "Cycle requerido (s)",
      critical_available: "Cycle disponível (s)",
      critical_margin: "Margem (req. − disp.)",

      section_performance: "Performance",
      perf_palletsHour: "Pallets/hora",
      perf_avgCycle: "Tempo médio de ciclo (s)",

      section_summary: "Resumo operacional",
      summary_boxesPallet: "Caixas por pallet",
      summary_totalPicks: "Total de picks",
      summary_totalLayers: "Total de camadas",

      section_feed: "Feed técnico (placeholder)",

      badge_input: "ENTRADA",
      badge_output: "SAÍDA",

      help_inputParams: "PARÂMETROS DE ENTRADA",
      help_flow: "Fluxo lógico do cálculo",
      help_flow_hint: "Da produção da linha até pallets/hora — passe o mouse nos nós para o mesmo texto dos tooltips.",
      help_metrics: "MÉTRICAS EXPLICADAS",
      help_page_kicker: "Documentação",
      help_page_title: "Referência da ferramenta",
      help_page_intro:
        "Consulta rápida dos conceitos, fórmulas e leituras usados nas entradas, no bloco Geral e nos cards por linha.",
      help_region_config: "Configuração, robô e receita",
      help_region_config_hint: "Identificação do cenário e parâmetros da planilha que alimentam os cálculos.",
      help_region_cycles: "Tempos de ciclo do robô",
      help_region_cycles_hint: "Pick, slip sheet e pallet — base para somar o tempo de execução.",
      help_region_pallet: "Pallet: intervalo, composição e tempos",
      help_region_pallet_hint: "Valores derivados desde o intervalo entre caixas até o tempo total do robô na linha.",
      help_region_general: "Bloco Geral e comparativo",
      help_region_general_hint: "KPIs consolidados, gráfico e cores de ocupação na coluna de saída.",
      help_region_lines: "Métricas por linha",
      help_region_lines_hint: "Indicadores e acúmulos exibidos em cada card de linha na saída.",

      help_toc_aria: "Índice da página de ajuda",
      help_toc_label: "Nesta página",
      help_toc_item_flow: "Fluxo do cálculo",
      help_toc_item_config: "Configuração e receita",
      help_toc_item_cycles: "Tempos de ciclo",
      help_toc_item_pallet: "Pallet e tempos",
      help_toc_item_general: "Bloco Geral e gráfico",
      help_toc_item_lines: "Métricas por linha",
      help_column_inputs_kicker: "Entrada — planilha e parâmetros",
      help_column_outputs_kicker: "Saída — consolidado e por linha",

      help_back: "Voltar",
      help_back_aria: "Voltar para a tela anterior",
      help_search_label: "Buscar na documentação",
      help_search_placeholder: "Termo, métrica, fórmula ou conceito…",
      help_search_aria: "Buscar na página de ajuda",
      help_search_no_results: "Nenhum trecho encontrado",
      help_search_results_count: "{{n}} resultados",
      help_search_showing_blocks: "Mostrando {{n}} blocos (correspondência em seção)",

      tooltip_formula: "Fórmula:",
      tooltip_interpretation: "Interpretação:",
      tooltip_helpTitle: "Ajuda",
      help_formula_label: "Fórmula",

      diagram_production: "Produção (cx/min)",
      diagram_gap: "Intervalo entre caixas",
      diagram_totalCycle: "Tempo total de ciclo / pallet",
      diagram_totalStack: "Tempo total de stacking",
      diagram_occupancy: "Ocupação do robô",
      diagram_palletsHour: "Pallets/hora",

      in_group_attendance: "Configuração do atendimento",
      in_group_recipes: "Receitas",
      in_robot_model: "Modelo do robô",
      in_lines_count: "Quantidade de linhas",
      in_robot_transition: "Tempo transição pallet (s)",
      line_1: "Linha 1",
      line_2: "Linha 2",
      line_3: "Linha 3",
      line_4: "Linha 4",
      line_5: "Linha 5",
      line_6: "Linha 6",

      sheet_col_name: "Nome da receita",
      sheet_col_boxesPerLayer: "Caixas por camada",
      sheet_col_layersPerPallet: "Camadas por pallet",
      sheet_col_picksPerLayer: "Qtd. picks por camada",
      input_hint_gated_pallet:
        "Preencha o tempo de movimentação de pallet para habilitar este campo.",
      input_hint_gated_slip:
        "Preencha o tempo de movimentação de slip sheet para habilitar este campo.",
      sheet_col_palletPick: "Capturas de pallet",
      sheet_col_slipBottom: "Slip sheet na base",
      sheet_col_slipBetween: "Slip sheet entre camadas",

      sheet_expand: "Expandir planilha",
      sheet_close: "Fechar",
      sheet_addRow: "+ Nova receita",

      output_header_recipes_selection: "Seleção das receitas",
      output_general_title: "Geral",
      output_exec_occupancy: "Taxa de ocupação",
      output_exec_can_clear_accum: "Limpa acúmulo?",
      output_accum_ok: "Sim",
      output_accum_fail: "Não",
      output_exec_cycles_per_min: "Ciclos/min",
      output_exec_required_time: "Tempo necessário",
      output_exec_robot_time: "Tempo do robô",
      output_exec_margin: "Margem disponível",
      output_general_chart_placeholder: "Comparativo entre tempo necessário e tempo do robô por linha",
      output_aria_general_exec_kpis: "KPIs executivos do bloco geral",
      output_aria_general_chart: "Visualização comparativa",
      output_aria_lines_overview: "Análise individual por linha",

      output_chart_compare_lines: "Visualização comparativa entre linhas",
      output_chart_select_recipe_hint: "Selecione uma receita em pelo menos uma linha para visualizar a análise",
      output_chart_legend_required: "Necessário",
      output_chart_legend_robot_time: "Tempo do robô",
      output_chart_legend_occupancy: "Ocupação do robô (0–100%)",
      output_line_prefix: "Linha",
      output_recipe_prefix: "Receita",
      output_line_select_recipe: "Selecione a receita",
      output_line_none_associated: "Nenhuma receita associada",
      output_line_header_sep: " | ",
      output_chart_toggle_view: "Alternar visualização",
      output_chart_view_stacked: "Ocupação consolidada",
      output_chart_view_comparison: "Comparativo entre linhas",

      output_top_occupancy: "Taxa de ocupação",
      output_top_cycles_min: "Ciclos/min",
      output_top_required_time: "Tempo necessário",
      output_top_max_accum_products: "Maior qtd. produtos no acúmulo",

      output_row_recipe_name: "Nome da receita",
      output_row_production_bpm: "Produção (cx/min)",
      output_row_boxes_per_layer: "Caixas por camada",
      output_row_layers_per_pallet: "Camadas por pallet",
      output_row_quantity_of_picks: "Quantidade de picks",
      output_row_slip_bottom: "Slip sheet na base",
      output_row_slip_between: "Slip sheet entre camadas",
      output_row_pallet_pick: "Pallet pick",
      output_row_cycle_pick: "Tempo de ciclo/pick (s)",
      output_row_cycle_slip: "Tempo de ciclo/slip sheet (s)",
      output_row_cycle_pallet: "Tempo de ciclo/pallet (s)",
      output_row_total_boxes_pallet: "Caixas por pallet",
      output_row_picks_pallet: "Picks por pallet",
      output_row_gap_between_boxes: "Intervalo entre caixas (s)",
      output_row_boxes_per_cycle: "Caixas por ciclo",
      output_row_total_cycles_pallet: "Total de ciclos por pallet",
      output_row_total_time_picks: "Tempo total de picks (s)",
      output_row_total_time_slip: "Tempo total de slip sheet (s)",
      output_row_total_time_pallet: "Tempo total de pallet (s)",
      output_row_total_robot_time: "Tempo total do robô (s)",
      output_row_accum_time_exchange: "Tempo de acúmulo até a troca de pallet (s)",
      output_row_pallet_transition: "Tempo efetivo transição pallet (s)",
      output_row_can_clear_accum: "Limpa acúmulo?",
      output_row_net_removal: "Remoção líquida (cx/s)",
      output_row_products_accum_slip: "Produtos acumulados (slip sheet)",
      output_clearance_not_feasible: "Não atende",
      output_row_cycles_clear_slip: "Ciclos para zerar acúmulo (slip sheet)",
      output_row_products_accum_pallet: "Produtos acumulados (pallet)",
      output_row_cycles_clear_pallet: "Ciclos para zerar acúmulo (pallet)",
      output_row_required_time: "Tempo necessário (s)",
      output_row_robot_occupancy: "Taxa de ocupação",
      output_row_cycles_per_minute: "Ciclos/min",
      output_row_average_cycle_time: "Tempo médio de ciclo (s)",
      output_row_pallets_hour: "Pallets/hora",

      feasibility_matrix_title: "Matriz de Viabilidade Técnico-Operacional",
      feasibility_matrix_btn: "Gerar Matriz de Viabilidade",
      feasibility_matrix_desc: "Esta análise testa cada receita individualmente contra cada linha configurada para verificar a compatibilidade técnica isolada.",
      feasibility_col_recipe: "Receita (SKU)",
      feasibility_status_ok: "Atende",
      feasibility_status_limit: "Limite",
      feasibility_status_fail: "Não Atende",

      header_tabs_aria: "Navegação principal",
      menu_settings_title: "Configurações e utilitários",
      menu_settings_aria: "Abrir menu de configurações",
      menu_settings_panel_aria: "Ações do menu",
      lang_toggle_title: "Idioma",
      lang_toggle_aria: "Trocar idioma",

      scenario_io_aria: "Cenário: importar e exportar JSON",
      scenario_export: "Exportar cenário (JSON)",
      scenario_export_pdf: "Exportar PDF",
      pdf_report_subtitle: "Relatório técnico",
      pdf_section_conclusion: "Conclusão",
      pdf_conclusion_attends: "Concluímos que o robô atende a célula.",
      pdf_conclusion_not_attends: "Concluímos que o robô não atende a célula.",
      pdf_section_kpis: "KPIs gerais",
      pdf_section_lines: "Resumo por linha",
      pdf_lab_date: "Data/hora",
      pdf_lab_robot: "Modelo do robô",
      pdf_lab_lines: "Quantidade de linhas",
      pdf_col_line: "Linha",
      pdf_col_recipe: "Receita selecionada",
      pdf_col_occ: "Taxa de ocupação",
      pdf_col_cpm: "Ciclos/min",
      pdf_col_required: "Tempo necessário (s)",
      pdf_col_max_accum: "Maior qtd. produtos no acúmulo",
      pdf_col_critical: "Status crítico",
      pdf_critical_accumulation: "Acúmulo: não atende",
      pdf_critical_occupancy: "Ocupação > 95 %",
      pdf_error_lib: "Biblioteca PDF não carregada. Recarregue a página.",
      pdf_error_payload: "Não foi possível obter os dados do cenário.",
      scenario_import: "Importar cenário (JSON)",
      scenario_err_not_object: "Arquivo inválido: o JSON não é um objeto.",
      scenario_err_schema_version: "Versão do arquivo incompatível com esta versão do app.",
      scenario_err_scenario_missing: "Estrutura inválida: falta o objeto scenario.",
      scenario_err_lines_count: "Quantidade de linhas inválida (use 1 a 6).",
      scenario_err_robot_model: "Campo robotModel inválido (esperado texto).",
      scenario_err_recipes: "Lista de receitas vazia ou ausente.",
      scenario_err_recipe_shape: "Uma receita no arquivo tem formato inválido.",
      scenario_err_recipe_rowid: "Cada receita precisa de rowId (identificador da linha na planilha).",
      scenario_err_recipe_duplicate: "Há rowId duplicado entre as receitas.",
      scenario_err_recipe_row1: "É obrigatório existir receita com rowId \"1\".",
      scenario_err_line_times: "Falta lineRobotTimes ou não é uma lista.",
      scenario_err_line_times_len: "lineRobotTimes deve ter um item por linha (mesmo tamanho que numberOfLines).",
      scenario_err_line_times_item: "Item inválido em lineRobotTimes.",
      scenario_err_line_times_index: "lineIndex inválido em lineRobotTimes.",
      scenario_err_line_times_dup: "lineIndex duplicado em lineRobotTimes.",
      scenario_err_line_times_gap: "Faltam tempos para alguma linha em lineRobotTimes.",
      scenario_err_line_map: "lineRecipeMap ausente ou inválido.",
      scenario_err_line_map_key: "Chave inválida em lineRecipeMap (linha fora do intervalo).",
      scenario_err_line_map_target: "lineRecipeMap aponta para receita inexistente (rowId).",
      scenario_err_preferences: "Objeto preferences inválido.",
      scenario_err_parse: "JSON inválido ou arquivo corrompido.",
      scenario_err_read_file: "Não foi possível ler o arquivo.",
      scenario_err_apply_missing_ui: "Não foi possível aplicar o cenário (UI incompleta).",
      scenario_err_empty_file: "Arquivo vazio ou sem conteúdo.",
      scenario_err_export_failed: "Não foi possível exportar o cenário. Tente de novo.",
      theme_toggle_to_light: "Alternar para modo claro",
      theme_toggle_to_dark: "Alternar para modo escuro",
      pdf_error_generate: "Não foi possível gerar o PDF. Tente de novo ou recarregue a página."
    },
    en: {
      app_subtitle: "Industrial palletizing capacity tool",
      hero_title: "Robot occupancy / Status",
      hero_occupancy_label: "Occupancy rate",
      hero_status_label: "Status",
      hero_palletsHour: "Pallets/hour",
      hero_avgCycle: "Average cycle time",

      outputs_prod_title: "Production data",
      outputs_fixed_title: "Fixed times",
      outputs_results_title: "Results",
      outputs_slipBottom_short: "Slip Sheet on the bottom",
      outputs_slipBetween_short: "Slip Sheet between layers",
      outputs_palletPick_short: "Pallet pick",

      res_totalBoxes: "Total boxes on the pallet",
      res_picksPallet: "Picks per pallet",
      res_gap: "Gap between boxes (s)",
      res_boxesCycle: "Boxes per cycle",
      res_totalCyclePallet: "Total cycles per pallet",
      res_cyclePicks: "Total pick cycle time (s)",
      res_cycleSlip: "Total slip sheet cycle time (s)",
      res_cyclePallets: "Total pallet cycle time (s)",
      res_totalStacking: "Total stacking time (s)",
      res_accum_exchange: "Accumulation time until pallet exchange (s)",
      res_prod_slipAccum: "Accumulated products during slip sheet",
      res_cycles_emptySlip: "Cycles to clear slip sheet accumulation",
      res_prod_palletAccum: "Accumulated products during pallet exchange",
      res_cycles_emptyPallet: "Cycles to clear pallet accumulation",
      res_totalTimePalletStack: "Total time of pallet stacking (s)",
      res_robotOcc: "Robot occupancy rate",
      res_cyclesMin: "Cycles/min",
      res_avgCycleS: "Average cycle time (s)",
      res_palletsHour: "Pallets/hour",
      tabs_inputs: "INPUTS",
      tabs_outputs: "OUTPUTS",
      tabs_help: "HELP",

      sidebar_recipe: "Recipe / SKU",
      sidebar_pallet: "Pallet setup",
      sidebar_picking: "Picking",
      sidebar_fixedTimes: "Fixed times",

      label_skuName: "SKU / Recipe name",
      placeholder_skuName: "Ex.: SKU 123 - Line CX 12kg",
      label_production: "Production (boxes/min)",

      label_boxesPerLayer: "Boxes per layer",
      label_layersPerPallet: "Layers per pallet",
      label_picksPerLayer: "Quantity of picks (picks/layer)",
      label_palletPick: "Pallet pick (cycles/pallet)",
      label_slipBottom: "Slip Sheet on the bottom (qty)",
      label_slipBetween: "Slip Sheet between layers (qty)",

      label_robot: "Robot",
      placeholder_robot: "Ex.: KR240",
      label_cyclePick: "Cycle time/pick (s)",
      label_cycleSlip: "Cycle time/slip sheet (s)",
      label_cyclePallet: "Cycle time/pallet (s)",

      output_title: "Results (real time)",
      output_lineKicker: "Analyzed line",
      output_lineLabel: "Line",
      output_lineValue: "Current recipe",
      output_lineHint: "Prepared for multiple recipes/lines.",

      output_primary_title: "Robot",
      output_primary_occ: "Occupancy",
      output_primary_cpm: "Cycles/min",
      verdict: "Verdict",

      viz_title: "Visualization (capacity)",
      chart_placeholder: "Chart placeholder: required vs available / capacity.",

      section_critical: "Critical numbers",
      critical_required: "Required cycle (s)",
      critical_available: "Available cycle (s)",
      critical_margin: "Margin (req. − avail.)",

      section_performance: "Performance",
      perf_palletsHour: "Pallets/hour",
      perf_avgCycle: "Average cycle time (s)",

      section_summary: "Operational summary",
      summary_boxesPallet: "Boxes per pallet",
      summary_totalPicks: "Total picks",
      summary_totalLayers: "Total layers",

      section_feed: "Technical feed (placeholder)",

      badge_input: "INPUT",
      badge_output: "OUTPUT",

      help_inputParams: "INPUT PARAMETERS",
      help_flow: "Calculation flow",
      help_flow_hint: "From line production to pallets/hour — hover nodes for the same text as in-app tooltips.",
      help_metrics: "METRICS EXPLAINED",
      help_page_kicker: "Documentation",
      help_page_title: "Tool reference",
      help_page_intro:
        "Quick lookup of concepts, formulas, and readings used in inputs, the General block, and per-line cards.",
      help_region_config: "Setup, robot, and recipe",
      help_region_config_hint: "Scenario identifiers and spreadsheet fields that feed the calculations.",
      help_region_cycles: "Robot cycle times",
      help_region_cycles_hint: "Pick, slip sheet, and pallet — the basis for total execution time.",
      help_region_pallet: "Pallet: spacing, composition, and times",
      help_region_pallet_hint: "Derived values from box spacing through total robot time on the line.",
      help_region_general: "General block and comparison chart",
      help_region_general_hint: "Consolidated KPIs, chart, and occupancy colors in the output column.",
      help_region_lines: "Per-line metrics",
      help_region_lines_hint: "Indicators and accumulations shown on each line card in the output.",

      help_toc_aria: "Help page table of contents",
      help_toc_label: "On this page",
      help_toc_item_flow: "Calculation flow",
      help_toc_item_config: "Setup and recipe",
      help_toc_item_cycles: "Cycle times",
      help_toc_item_pallet: "Pallet and times",
      help_toc_item_general: "General block and chart",
      help_toc_item_lines: "Per-line metrics",
      help_column_inputs_kicker: "Input — spreadsheet and parameters",
      help_column_outputs_kicker: "Output — consolidated and per line",

      help_back: "Back",
      help_back_aria: "Return to the previous screen",
      help_search_label: "Search documentation",
      help_search_placeholder: "Term, metric, formula, or concept…",
      help_search_aria: "Search the help page",
      help_search_no_results: "No matches",
      help_search_results_count: "{{n}} matches",
      help_search_showing_blocks: "Showing {{n}} blocks (section match)",

      tooltip_formula: "Formula:",
      tooltip_interpretation: "Interpretation:",
      tooltip_helpTitle: "Help",
      help_formula_label: "Formula",

      diagram_production: "Production (boxes/min)",
      diagram_gap: "Gap between boxes",
      diagram_totalCycle: "Total cycle time / pallet",
      diagram_totalStack: "Total stacking time",
      diagram_occupancy: "Robot occupancy rate",
      diagram_palletsHour: "Pallets/hour",

      in_group_attendance: "Service setup",
      in_group_recipes: "Recipes",
      in_robot_model: "Robot model",
      in_lines_count: "Line count",
      in_robot_transition: "Pallet transition time (s)",
      line_1: "Line 1",
      line_2: "Line 2",
      line_3: "Line 3",
      line_4: "Line 4",
      line_5: "Line 5",
      line_6: "Line 6",

      sheet_col_name: "Recipe name",
      sheet_col_boxesPerLayer: "Boxes per layer",
      sheet_col_layersPerPallet: "Layers per pallet",
      sheet_col_picksPerLayer: "Picks per layer",
      input_hint_gated_pallet:
        "Enter pallet movement time to enable this field.",
      input_hint_gated_slip:
        "Enter slip sheet movement time to enable this field.",
      sheet_col_palletPick: "Pallet picks",
      sheet_col_slipBottom: "Bottom slip sheet",
      sheet_col_slipBetween: "Slip sheet between layers",

      sheet_expand: "Expand sheet",
      sheet_close: "Close",
      sheet_addRow: "+ New recipe",

      output_header_recipes_selection: "Recipe selection",
      output_general_title: "Overview",
      output_exec_occupancy: "Occupancy Rate",
      output_exec_can_clear_accum: "Clears accum.?",
      output_accum_ok: "Yes",
      output_accum_fail: "No",
      output_exec_cycles_per_min: "Cycles/min",
      output_exec_required_time: "Required Cycle Time",
      output_exec_robot_time: "Robot Cycle Time",
      output_exec_margin: "Available Time Margin",
      output_general_chart_placeholder: "Comparison between required cycle time and robot cycle time per line",
      output_aria_general_exec_kpis: "Executive KPIs from the general block",
      output_aria_general_chart: "Comparative view",
      output_aria_lines_overview: "Per-line individual analysis",

      output_chart_compare_lines: "Comparative view across lines",
      output_chart_select_recipe_hint: "Select a recipe in at least one line to view the analysis",
      output_chart_legend_required: "Required",
      output_chart_legend_robot_time: "Robot time",
      output_chart_legend_occupancy: "Robot occupancy (0–100%)",
      output_line_prefix: "Line",
      output_recipe_prefix: "Recipe",
      output_line_select_recipe: "Select recipe",
      output_line_none_associated: "No associated recipe",
      output_line_header_sep: " | ",
      output_chart_toggle_view: "Toggle view",
      output_chart_view_stacked: "Consolidated occupancy",
      output_chart_view_comparison: "Comparison across lines",

      output_top_occupancy: "Occupancy Rate",
      output_top_cycles_min: "Cycles/min",
      output_top_required_time: "Required Cycle Time",
      output_top_max_accum_products: "Max products in accumulation",

      output_row_recipe_name: "Recipe name",
      output_row_production_bpm: "Production (boxes/min)",
      output_row_boxes_per_layer: "Boxes per layer",
      output_row_layers_per_pallet: "Layers per pallet",
      output_row_quantity_of_picks: "Quantity of picks",
      output_row_slip_bottom: "Slip sheet on the bottom",
      output_row_slip_between: "Slip sheet between layers",
      output_row_pallet_pick: "Pallet pick",
      output_row_cycle_pick: "Cycle time/pick (s)",
      output_row_cycle_slip: "Cycle time/slip sheet (s)",
      output_row_cycle_pallet: "Cycle time/pallet (s)",
      output_row_total_boxes_pallet: "Boxes per pallet",
      output_row_picks_pallet: "Picks per pallet",
      output_row_gap_between_boxes: "Gap between boxes (s)",
      output_row_boxes_per_cycle: "Boxes per cycle",
      output_row_total_cycles_pallet: "Total cycles per pallet",
      output_row_total_time_picks: "Total pick time (s)",
      output_row_total_time_slip: "Total slip sheet time (s)",
      output_row_total_time_pallet: "Total pallet time (s)",
      output_row_total_robot_time: "Total robot time (s)",
      output_row_accum_time_exchange: "Accumulation time until pallet exchange (s)",
      output_row_pallet_transition: "Effective pallet transition time (s)",
      output_row_can_clear_accum: "Clears accum.?",
      output_row_net_removal: "Net removal (boxes/s)",
      output_row_products_accum_slip: "Accumulated products (slip sheet)",
      output_clearance_not_feasible: "Cannot clear",
      output_row_cycles_clear_slip: "Cycles to clear accumulation (slip sheet)",
      output_row_products_accum_pallet: "Accumulated products (pallet)",
      output_row_cycles_clear_pallet: "Cycles to clear accumulation (pallet)",
      output_row_required_time: "Required Cycle Time (s)",
      output_row_robot_occupancy: "Occupancy Rate",
      output_row_cycles_per_minute: "Cycles/min",
      output_row_average_cycle_time: "Average cycle time (s)",
      output_row_pallets_hour: "Pallets/hour",

      feasibility_matrix_title: "Technical Feasibility Matrix",
      feasibility_matrix_btn: "Generate Feasibility Matrix",
      feasibility_matrix_desc: "This analysis tests each recipe individually against each configured line to verify isolated technical compatibility.",
      feasibility_col_recipe: "Recipe (SKU)",
      feasibility_status_ok: "Meets",
      feasibility_status_limit: "Limit",
      feasibility_status_fail: "Does Not Meet",

      header_tabs_aria: "Main navigation",
      menu_settings_title: "Settings and utilities",
      menu_settings_aria: "Open settings menu",
      menu_settings_panel_aria: "Menu actions",
      lang_toggle_title: "Language",
      lang_toggle_aria: "Switch language",

      scenario_io_aria: "Scenario: import and export JSON",
      scenario_export: "Export scenario (JSON)",
      scenario_export_pdf: "Export PDF",
      pdf_report_subtitle: "Technical report",
      pdf_section_conclusion: "Conclusion",
      pdf_conclusion_attends: "We conclude that the robot meets the cell requirements.",
      pdf_conclusion_not_attends: "We conclude that the robot does not meet the cell requirements.",
      pdf_section_kpis: "General KPIs",
      pdf_section_lines: "Summary by line",
      pdf_lab_date: "Date/time",
      pdf_lab_robot: "Robot model",
      pdf_lab_lines: "Number of lines",
      pdf_col_line: "Line",
      pdf_col_recipe: "Selected recipe",
      pdf_col_occ: "Occupancy rate",
      pdf_col_cpm: "Cycles/min",
      pdf_col_required: "Required time (s)",
      pdf_col_max_accum: "Max products in accumulation",
      pdf_col_critical: "Critical status",
      pdf_critical_accumulation: "Accumulation: does not meet",
      pdf_critical_occupancy: "Occupancy > 95 %",
      pdf_error_lib: "PDF library failed to load. Reload the page.",
      pdf_error_payload: "Could not read scenario data.",
      scenario_import: "Import scenario (JSON)",
      scenario_err_not_object: "Invalid file: JSON root must be an object.",
      scenario_err_schema_version: "File version is not compatible with this app version.",
      scenario_err_scenario_missing: "Invalid structure: missing scenario object.",
      scenario_err_lines_count: "Invalid number of lines (use 1 to 6).",
      scenario_err_robot_model: "Invalid robotModel field (string expected).",
      scenario_err_recipes: "Recipes list is missing or empty.",
      scenario_err_recipe_shape: "A recipe entry in the file has invalid shape.",
      scenario_err_recipe_rowid: "Each recipe must have a rowId (sheet row identifier).",
      scenario_err_recipe_duplicate: "Duplicate rowId across recipes.",
      scenario_err_recipe_row1: "A recipe with rowId \"1\" is required.",
      scenario_err_line_times: "Missing lineRobotTimes or not an array.",
      scenario_err_line_times_len: "lineRobotTimes must have one entry per line (same length as numberOfLines).",
      scenario_err_line_times_item: "Invalid item in lineRobotTimes.",
      scenario_err_line_times_index: "Invalid lineIndex in lineRobotTimes.",
      scenario_err_line_times_dup: "Duplicate lineIndex in lineRobotTimes.",
      scenario_err_line_times_gap: "Missing robot times for some line in lineRobotTimes.",
      scenario_err_line_map: "lineRecipeMap missing or invalid.",
      scenario_err_line_map_key: "Invalid key in lineRecipeMap (line out of range).",
      scenario_err_line_map_target: "lineRecipeMap references a missing recipe rowId.",
      scenario_err_preferences: "Invalid preferences object.",
      scenario_err_parse: "Invalid JSON or corrupted file.",
      scenario_err_read_file: "Could not read the file.",
      scenario_err_apply_missing_ui: "Could not apply scenario (incomplete UI).",
      scenario_err_empty_file: "The file is empty.",
      scenario_err_export_failed: "Could not export the scenario. Try again.",
      theme_toggle_to_light: "Switch to light mode",
      theme_toggle_to_dark: "Switch to dark mode",
      pdf_error_generate: "Could not generate the PDF. Try again or reload the page."
    }
  };

  function getLang() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "pt") return saved;
    } catch (e) {}
    return "pt";
  }

  function setLang(lang) {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  function t(key) {
    var lang = window.APP_LANG || "pt";
    var dict = I18N[lang] || I18N.pt;
    return dict[key] || key;
  }

  function applyLanguage(lang) {
    window.APP_LANG = lang;
    setLang(lang);

    // Atualiza HELP_DATA apontando para o idioma ativo (se existir)
    if (window.HELP_DATA_BY_LANG) {
      window.HELP_DATA = window.HELP_DATA_BY_LANG[lang] || window.HELP_DATA_BY_LANG.pt;
    }

    // Atributo lang do documento
    document.documentElement.setAttribute("lang", lang === "pt" ? "pt-BR" : "en");

    // Texto via data-i18n
    var nodes = document.querySelectorAll("[data-i18n]");
    nodes.forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      el.textContent = t(k);
    });

    // Placeholders via data-i18n-placeholder
    var ph = document.querySelectorAll("[data-i18n-placeholder]");
    ph.forEach(function (el) {
      var k = el.getAttribute("data-i18n-placeholder");
      el.setAttribute("placeholder", t(k));
    });

    // title nativo (ex.: botões da planilha) — não usar em ícones de ajuda (evita tooltip do browser)
    var helpTitles = document.querySelectorAll("[data-i18n-title]");
    helpTitles.forEach(function (el) {
      var k = el.getAttribute("data-i18n-title");
      el.setAttribute("title", t(k));
    });

    var ariaLabels = document.querySelectorAll("[data-i18n-aria-label]");
    ariaLabels.forEach(function (el) {
      var k = el.getAttribute("data-i18n-aria-label");
      el.setAttribute("aria-label", t(k));
    });

    // Re-render HELP page para refletir idioma
    if (typeof window.renderHelpPage === "function") {
      window.renderHelpPage(true);
    }

    if (typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("app-language-changed", { detail: { lang: lang } }));
    }
  }

  function toggleLanguage() {
    var next = (window.APP_LANG || getLang()) === "pt" ? "en" : "pt";
    applyLanguage(next);
  }

  function initLanguageToggle() {
    var btn = document.getElementById("lang-toggle");
    if (btn) {
      btn.addEventListener("click", toggleLanguage);
    }
    applyLanguage(getLang());
  }

  window.I18N = { t: t, applyLanguage: applyLanguage, getLang: getLang };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLanguageToggle);
  } else {
    initLanguageToggle();
  }
})();

