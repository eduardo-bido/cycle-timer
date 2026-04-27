// Dicionário central de ajuda da ferramenta.
// Fonte única para tooltips e futuras telas de documentação.

(function () {
  window.HELP_DATA_BY_LANG = {
    pt: {
      skuName: {
        label: "SKU / Nome da receita",
        description:
          "Identificador do cenário analisado (SKU, receita, variante ou referência interna).",
        formula: "",
        unit: "",
        interpretation:
          "Não altera os cálculos. Serve para rastrear exatamente qual configuração foi avaliada."
      },

      productionBpm: {
        label: "Produção (cx/min)",
        description:
          "Taxa média de chegada de caixas na linha, em caixas por minuto.",
        formula: "",
        unit: "caixas/min",
        interpretation:
          "Quanto maior esse valor, menor a janela de tempo que o robô tem para montar cada pallet."
      },

      slipSheetBottom: {
        label: "Slip sheet no fundo (qtd)",
        description:
          "Quantidade de slip sheets aplicados na base do pallet, antes da primeira camada.",
        formula: "",
        unit: "slipsheets",
        interpretation:
          "Cada unidade adiciona um ciclo e um tempo de aplicação. Se a quantidade for zero, essa operação é desconsiderada."
      },

      slipSheetBetweenLayers: {
        label: "Slip sheet entre camadas (qtd)",
        description:
          "Quantidade total de slip sheets aplicados entre as camadas do pallet.",
        formula: "",
        unit: "slipsheets",
        interpretation:
          "Aumenta o tempo de execução do robô e pode elevar o risco de acúmulo entre operações."
      },

      palletPick: {
        label: "Ciclos de troca de pallet",
        description:
          "Quantidade de ciclos de pallet associados à troca ou movimentação do pallet.",
        formula: "",
        unit: "ciclos/pallet",
        interpretation:
          "Só entra no cálculo se houver quantidade maior que zero e também tempo de ciclo de pallet maior que zero."
      },

      robotName: {
        label: "Robô (identificação)",
        description:
          "Identificação do robô avaliado (modelo ou família).",
        formula: "",
        unit: "",
        interpretation:
          "Não altera os cálculos. Serve para deixar claro qual robô está sendo considerado no cenário."
      },

      linesCount: {
        label: "Quantidade de linhas",
        description:
          "Número de linhas atendidas pelo robô neste cenário.",
        formula: "",
        unit: "linhas",
        interpretation:
          "Cada linha possui sua própria receita e seus próprios tempos. O bloco Geral consolida o efeito conjunto dessas linhas sobre o robô."
      },

      boxesPerLayer: {
        label: "Caixas por camada",
        description:
          "Quantidade de caixas que compõem uma camada completa do pallet.",
        formula: "",
        unit: "caixas",
        interpretation:
          "Define, junto com o número de camadas, quantas caixas existirão em cada pallet."
      },

      layersPerPallet: {
        label: "Camadas por pallet",
        description:
          "Número de camadas empilhadas em cada pallet.",
        formula: "",
        unit: "camadas/pallet",
        interpretation:
          "Quanto maior o número de camadas, maior o total de caixas por pallet e maior o tempo total necessário."
      },

      picksPerLayer: {
        label: "Qtd. picks (picks/camada)",
        description:
          "Quantidade de capturas que o robô realiza para montar uma camada completa.",
        formula: "",
        unit: "picks/camada",
        interpretation:
          "Valores maiores significam mais movimentos de pick para concluir a mesma camada."
      },

      cycleTimePickS: {
        label: "Tempo de ciclo/pick",
        description:
          "Tempo de um ciclo de pick do robô.",
        formula:
          "Tempo de picks = picks por pallet × tempo de ciclo/pick",
        unit: "s",
        interpretation:
          "Quanto maior esse tempo, maior a ocupação e menor a folga da linha."
      },

      cycleTimeSlipSheetS: {
        label: "Tempo de ciclo/slip sheet",
        description:
          "Tempo de um ciclo de aplicação de slip sheet.",
        formula:
          "Tempo de slip sheet = quantidade de slips × tempo de ciclo/slip sheet",
        unit: "s",
        interpretation:
          "Impacta diretamente o tempo do robô quando há slip sheet no cenário."
      },

      cycleTimePalletS: {
        label: "Tempo de ciclo/pallet",
        description:
          "Tempo de um ciclo de operação de pallet.",
        formula:
          "Tempo de pallet = ciclos de pallet × tempo de ciclo/pallet",
        unit: "s",
        interpretation:
          "Tempos maiores reduzem margem e elevam risco de sobrecarga."
      },

      totalCycleTimePerPallet: {
        label: "Tempo total de ciclo / pallet",
        description:
          "Tempo total de execução do robô para um pallet, somando picks, slip sheets e movimentos de pallet válidos.",
        formula:
          "Tempo total de picks + tempo total de slip sheets + tempo total de pallet",
        unit: "s",
        interpretation:
          "Representa quanto tempo o robô realmente gasta para montar um pallet completo."
      },

      gapBetweenBoxesS: {
        label: "Intervalo entre caixas",
        description:
          "Tempo médio entre a chegada de duas caixas consecutivas na linha.",
        formula:
          "60 ÷ produção",
        unit: "s",
        interpretation:
          "Quanto menor esse valor, mais rápido as caixas chegam e maior a pressão sobre o robô."
      },

      totalStackingTimeRobotS: {
        label: "Tempo total do robô",
        description:
          "Tempo total que o robô fica ocupado para montar um pallet nesta linha.",
        formula:
          "Tempo de picks + tempo de slip sheets + tempo de pallet",
        unit: "s",
        interpretation:
          "É o esforço real do robô nesta linha. Serve de base para calcular a ocupação."
      },

      totalBoxesOnPallet: {
        label: "Caixas por pallet",
        description:
          "Quantidade total de caixas empilhadas em um pallet.",
        formula:
          "Caixas por camada × camadas por pallet",
        unit: "caixas",
        interpretation:
          "Define o tamanho físico do pallet e influencia diretamente o tempo total de montagem."
      },

      picksPerPallet: {
        label: "Picks por pallet",
        description:
          "Quantidade total de picks necessários para completar um pallet.",
        formula:
          "Picks por camada × camadas por pallet",
        unit: "picks/pallet",
        interpretation:
          "Quanto maior esse valor, maior o tempo de pick e maior o esforço do robô."
      },

      boxesPerCycle: {
        label: "Caixas por ciclo",
        description:
          "Quantidade média de caixas movimentadas em cada ciclo de pick.",
        formula:
          "Caixas por camada ÷ picks por camada",
        unit: "caixas/ciclo",
        interpretation:
          "Mostra o rendimento de cada pick. Menos caixas por ciclo normalmente significam mais ciclos para concluir o pallet."
      },

      totalCyclesPerPallet: {
        label: "Total de ciclos por pallet",
        description:
          "Quantidade total de ciclos necessários para completar um pallet.",
        formula:
          "Picks do pallet + ciclos de slip sheet válidos + ciclos de pallet válidos",
        unit: "ciclos/pallet",
        interpretation:
          "Ajuda a entender o volume total de operações exigidas do robô."
      },

      totalCycleTimePicksS: {
        label: "Tempo total de picks",
        description:
          "Tempo total gasto apenas nas operações de pick.",
        formula:
          "Picks por pallet × tempo de ciclo por pick",
        unit: "s",
        interpretation:
          "Normalmente é o principal componente do tempo do robô."
      },

      totalCycleTimeSlipSheetS: {
        label: "Tempo total de slip sheet",
        description:
          "Tempo total gasto nas operações de slip sheet.",
        formula:
          "Quantidade total de slip sheets × tempo de ciclo de slip sheet",
        unit: "s",
        interpretation:
          "Só entra no cálculo quando houver slip sheets e tempo de slip sheet maior que zero."
      },

      totalCycleTimePalletsS: {
        label: "Tempo total de pallet",
        description:
          "Tempo total gasto nas operações de pallet.",
        formula:
          "Ciclos de pallet × tempo de ciclo de pallet",
        unit: "s",
        interpretation:
          "Só entra no cálculo quando houver ciclos de pallet e tempo de pallet maior que zero."
      },

      robotOccupancyRate: {
        label: "Taxa de ocupação",
        description:
          "Percentual da capacidade do robô consumida pela linha.",
        formula:
          "Tempo total do robô ÷ tempo necessário da linha",
        unit: "%",
        interpretation:
          "Até 95% atende; acima de 95% não atende. Faixas de cor: <90% folga; 90–95% alerta; >95% fora do critério."
      },

      generalRobotOccupancyRate: {
        label: "Taxa de ocupação (Geral)",
        description:
          "Carga total do robô considerando as linhas válidas.",
        formula:
          "Soma das taxas de ocupação das linhas válidas",
        unit: "%",
        interpretation:
          "Até 95% atende; acima de 95% não atende. Faixas de cor: <90% folga; 90–95% alerta; >95% fora do critério."
      },

      generalCyclesPerMinute: {
        label: "Ciclos/min (Geral)",
        description:
          "Ritmo total de ciclos exigido do robô no consolidado.",
        formula:
          "Soma dos ciclos por minuto das linhas válidas",
        unit: "ciclos/min",
        interpretation:
          "Valores mais altos significam operação mais intensa e menos folga."
      },

      generalRequiredCycleS: {
        label: "Tempo necessário (Geral)",
        description:
          "Janela total de tempo que a produção fornece para completar os pallets.",
        formula:
          "Soma dos tempos necessários das linhas válidas",
        unit: "s",
        interpretation:
          "É a referência para comparar contra o tempo que o robô realmente precisa."
      },

      generalAvailableCycleS: {
        label: "Tempo do robô (Geral)",
        description:
          "Tempo total que o robô precisa para executar o cenário consolidado.",
        formula:
          "Soma dos tempos totais do robô das linhas válidas",
        unit: "s",
        interpretation:
          "Quanto mais próximo do tempo necessário, menor a margem operacional."
      },

      generalMarginS: {
        label: "Margem disponível (Geral)",
        description:
          "Folga de tempo entre o que a produção permite e o que o robô exige.",
        formula:
          "Tempo necessário (Geral) − Tempo do robô (Geral)",
        unit: "s",
        interpretation:
          "Margem baixa ou negativa indica cenário no limite ou sobrecarregado."
      },

      generalChartComparison: {
        label: "Comparativo entre linhas",
        description:
          "Por linha, mostra a taxa de ocupação do robô numa barra de largura fixa (100%).",
        formula:
          "Preenchimento = tempo do robô ÷ tempo necessário (mesma base do KPI de ocupação).",
        unit: "",
        interpretation:
          "Acima de 100% a barra fica toda vermelha. Faixas de cor: mesmas do indicador de ocupação (<90% / 90–95% / >95%)."
      },

      palletsPerHour: {
        label: "Pallets/hora",
        description:
          "Quantidade estimada de pallets que a linha entrega por hora.",
        formula:
          "60 ÷ (caixas por pallet ÷ produção)",
        unit: "pallets/h",
        interpretation:
          "Útil para validar se a capacidade atende a meta de produção."
      },

      averageCycleTimeS: {
        label: "Tempo médio de ciclo",
        description:
          "Tempo médio entre ciclos do robô na linha.",
        formula:
          "60 ÷ ciclos por minuto",
        unit: "s",
        interpretation:
          "Quanto menor, maior a frequência de operação exigida."
      },

      cyclesNumberPerMinute: {
        label: "Ciclos por minuto",
        description:
          "Quantidade de ciclos por minuto exigida pela linha.",
        formula:
          "Total de ciclos ÷ tempo total do cenário",
        unit: "ciclos/min",
        interpretation:
          "Indica a intensidade operacional da linha."
      },

      totalTimeOfPalletStackingS: {
        label: "Tempo necessário",
        description:
          "Tempo disponível da linha para completar um pallet.",
        formula:
          "Caixas por pallet ÷ produção, convertido para segundos",
        unit: "s",
        interpretation:
          "É a referência para comparar com o tempo total do robô."
      },

      accumulationTimeToPalletExchangeS: {
        label: "Tempo de acúmulo até a troca de pallet",
        description:
          "Tempo em que caixas podem acumular durante a troca de pallet.",
        formula:
          "Tempo de ciclo/pick + (tempo de pallet × ciclos de pallet) + (tempo de slip base × slips de base)",
        unit: "s",
        interpretation:
          "Quanto maior, maior o potencial de fila durante a troca."
      },

      productNumberInSlipAccumulation: {
        label: "Produtos acumulados durante slip sheet",
        description:
          "Estimativa de caixas que chegam durante o tempo de slip sheet.",
        formula:
          "Tempo total de slip sheet ÷ intervalo entre caixas",
        unit: "caixas",
        interpretation:
          "Mostra o tamanho da fila gerada nessa etapa."
      },

      cyclesToEmptySlipAccumulation: {
        label: "Ciclos para zerar acúmulo (slip sheet)",
        description:
          "Ciclos para esvaziar a fila com chegada contínua de produtos (remoção líquida).",
        formula:
          "(acúmulo ÷ remoção líquida em caixas/s) ÷ tempo de ciclo de pick",
        unit: "ciclos",
        interpretation:
          "Remoção líquida = (caixas/ciclo ÷ tempo de pick) − (produção BPM ÷ 60). Se ≤ 0, não há como reduzir a fila (Não atende)."
      },

      productsNumberInPalletAccumulation: {
        label: "Produtos acumulados na troca de pallet",
        description:
          "Estimativa de caixas que chegam durante a troca de pallet.",
        formula:
          "Tempo de acúmulo na troca ÷ intervalo entre caixas",
        unit: "caixas",
        interpretation:
          "Mostra o impacto da troca de pallet no fluxo da linha."
      },

      lineMaxProductsInAccumulation: {
        label: "Maior qtd. produtos no acúmulo",
        description:
          "Maior fila de produtos entre o acúmulo no slip sheet e o da troca de pallet nesta linha.",
        formula:
          "max(produtos no acúmulo slip sheet, produtos no acúmulo na troca de pallet)",
        unit: "caixas",
        interpretation:
          "Destaca o pior caso de acúmulo no cenário, para leitura rápida do gargalo."
      },

      cyclesToEmptyPalletAccumulation: {
        label: "Ciclos para zerar acúmulo (pallet)",
        description:
          "Ciclos para esvaziar a fila com chegada contínua de produtos (remoção líquida).",
        formula:
          "(acúmulo ÷ remoção líquida em caixas/s) ÷ tempo de ciclo de pick",
        unit: "ciclos",
        interpretation:
          "Mesma remoção líquida do slip. Se ≤ 0, não há como reduzir a fila (Não atende)."
      },

      occupancyVisualStatus: {
        label: "Indicador visual de status",
        description:
          "Cor alinhada à taxa de ocupação do cenário exibido.",
        formula: "",
        unit: "",
        interpretation:
          "Mesmas faixas da ocupação: <90% verde; 90–95% amarelo; >95% vermelho. Até 95% atende; acima de 95% não atende."
      },

      chartLegendRequired: {
        label: "Necessário",
        description:
          "Tempo que a linha exige para concluir o empilhamento, conforme a receita usada.",
        formula: "",
        unit: "",
        interpretation: ""
      },

      chartLegendRobot: {
        label: "Tempo do robô",
        description:
          "Tempo que o robô consome no empilhamento, na mesma escala do necessário.",
        formula: "",
        unit: "",
        interpretation:
          "A cor segue a ocupação do robô (mesmas faixas do indicador de ocupação)."
      },

      chartLegendOccupancy: {
        label: "Ocupação do robô (0–100%)",
        description:
          "Cada linha tem um trilho de largura fixa; o preenchimento indica a taxa de ocupação do robô nessa linha.",
        formula:
          "Ocupação = tempo de stacking do robô ÷ tempo necessário para o pallet",
        unit: "",
        interpretation:
          "Até 100% o comprimento do preenchimento é proporcional à ocupação. Acima de 100% a barra preenche todo o trilho em vermelho (sobrecarga)."
      }
    },

    en: {
      skuName: {
        label: "SKU / Recipe name",
        description:
          "Identifier of the analyzed scenario (SKU, recipe, variant or internal reference).",
        formula: "",
        unit: "",
        interpretation:
          "Does not affect calculations. Used to track exactly which configuration was evaluated."
      },

      productionBpm: {
        label: "Production (boxes/min)",
        description:
          "Average inbound box rate on the line, in boxes per minute.",
        formula: "",
        unit: "boxes/min",
        interpretation:
          "The higher this value, the smaller the time window the robot has to complete each pallet."
      },

      slipSheetBottom: {
        label: "Slip sheet on the bottom (qty)",
        description:
          "Number of slip sheets applied at the pallet base before the first layer.",
        formula: "",
        unit: "slipsheets",
        interpretation:
          "Each unit adds one operation and one application time. If quantity is zero, this operation is ignored."
      },

      slipSheetBetweenLayers: {
        label: "Slip sheet between layers (qty)",
        description:
          "Total number of slip sheets applied between pallet layers.",
        formula: "",
        unit: "slipsheets",
        interpretation:
          "Increases robot execution time and may raise accumulation risk between operations."
      },

      palletPick: {
        label: "Pallet cycles",
        description:
          "Number of pallet-related cycles associated with pallet exchange or pallet handling.",
        formula: "",
        unit: "cycles/pallet",
        interpretation:
          "Only enters the calculation when both pallet quantity and pallet cycle time are greater than zero."
      },

      robotName: {
        label: "Robot (identifier)",
        description:
          "Identification of the evaluated robot (model or family).",
        formula: "",
        unit: "",
        interpretation:
          "Does not affect calculations. Used to make clear which robot is being considered."
      },

      linesCount: {
        label: "Line count",
        description:
          "Number of lines served by the robot in this scenario.",
        formula: "",
        unit: "lines",
        interpretation:
          "Each line has its own recipe and cycle times. The General block consolidates their combined effect on the robot."
      },

      boxesPerLayer: {
        label: "Boxes per layer",
        description:
          "Number of boxes that make up a complete pallet layer.",
        formula: "",
        unit: "boxes",
        interpretation:
          "Together with layers per pallet, defines how many boxes exist on each pallet."
      },

      layersPerPallet: {
        label: "Layers per pallet",
        description:
          "Number of layers stacked on each pallet.",
        formula: "",
        unit: "layers/pallet",
        interpretation:
          "The higher this value, the larger the pallet and the longer the total required time."
      },

      picksPerLayer: {
        label: "Quantity of picks (picks/layer)",
        description:
          "Number of picks required to complete one full layer.",
        formula: "",
        unit: "picks/layer",
        interpretation:
          "Higher values mean more pick movements are required to complete the same layer."
      },

      cycleTimePickS: {
        label: "Cycle time/pick",
        description:
          "Time of one robot pick cycle.",
        formula:
          "Pick time = picks per pallet × cycle time/pick",
        unit: "s",
        interpretation:
          "Higher values increase occupancy and reduce operational margin."
      },

      cycleTimeSlipSheetS: {
        label: "Cycle time/slip sheet",
        description:
          "Time of one slip sheet application cycle.",
        formula:
          "Slip sheet time = slip quantity × cycle time/slip sheet",
        unit: "s",
        interpretation:
          "Directly increases robot time when slip sheets are used."
      },

      cycleTimePalletS: {
        label: "Cycle time/pallet",
        description:
          "Time of one pallet operation cycle.",
        formula:
          "Pallet time = pallet cycles × cycle time/pallet",
        unit: "s",
        interpretation:
          "Higher values reduce margin and increase overload risk."
      },

      totalCycleTimePerPallet: {
        label: "Total cycle time / pallet",
        description:
          "Total robot execution time for one pallet, adding valid picks, slip sheets and pallet operations.",
        formula:
          "Pick time + slip sheet time + pallet time",
        unit: "s",
        interpretation:
          "Represents how long the robot actually needs to complete one full pallet."
      },

      gapBetweenBoxesS: {
        label: "Gap between boxes",
        description:
          "Average time between the arrival of two consecutive boxes on the line.",
        formula:
          "60 ÷ production",
        unit: "s",
        interpretation:
          "The smaller this value, the faster the boxes arrive and the higher the pressure on the robot."
      },

      totalStackingTimeRobotS: {
        label: "Total robot time",
        description:
          "Total time the robot stays busy to build one pallet on this line.",
        formula:
          "Pick time + slip sheet time + pallet time",
        unit: "s",
        interpretation:
          "This is the actual robot effort for this line. It is the basis for occupancy."
      },

      totalBoxesOnPallet: {
        label: "Boxes per pallet",
        description:
          "Total number of boxes stacked on one pallet.",
        formula:
          "Boxes per layer × layers per pallet",
        unit: "boxes",
        interpretation:
          "Defines pallet size and directly impacts total required time."
      },

      picksPerPallet: {
        label: "Picks per pallet",
        description:
          "Total number of pick operations required to complete one pallet.",
        formula:
          "Picks per layer × layers per pallet",
        unit: "picks/pallet",
        interpretation:
          "Higher values increase pick time and robot effort."
      },

      boxesPerCycle: {
        label: "Boxes per cycle",
        description:
          "Average number of boxes moved per pick cycle.",
        formula:
          "Boxes per layer ÷ picks per layer",
        unit: "boxes/cycle",
        interpretation:
          "Shows the yield of each pick. Fewer boxes per cycle usually mean more cycles to complete the pallet."
      },

      totalCyclesPerPallet: {
        label: "Total cycles per pallet",
        description:
          "Total number of cycles required to complete one pallet.",
        formula:
          "Pallet picks + valid slip sheet cycles + valid pallet cycles",
        unit: "cycles/pallet",
        interpretation:
          "Helps identify the total number of operations demanded from the robot."
      },

      totalCycleTimePicksS: {
        label: "Total pick time",
        description:
          "Total time spent only on pick operations.",
        formula:
          "Picks per pallet × cycle time per pick",
        unit: "s",
        interpretation:
          "Usually the main component of total robot time."
      },

      totalCycleTimeSlipSheetS: {
        label: "Total slip sheet time",
        description:
          "Total time spent on slip sheet operations.",
        formula:
          "Total slip sheets × slip sheet cycle time",
        unit: "s",
        interpretation:
          "Only enters the calculation when both slip sheet quantity and slip sheet time are greater than zero."
      },

      totalCycleTimePalletsS: {
        label: "Total pallet time",
        description:
          "Total time spent on pallet operations.",
        formula:
          "Pallet cycles × pallet cycle time",
        unit: "s",
        interpretation:
          "Only enters the calculation when both pallet quantity and pallet cycle time are greater than zero."
      },

      robotOccupancyRate: {
        label: "Occupancy Rate",
        description:
          "Percentage of robot capacity consumed by the line.",
        formula:
          "Robot Cycle Time ÷ Required Cycle Time",
        unit: "%",
        interpretation:
          "Meets target up to 95%; above 95% does not meet. Color bands: <90% OK; 90–95% caution; >95% out of criteria."
      },

      generalRobotOccupancyRate: {
        label: "Occupancy Rate (Overview)",
        description:
          "Total robot load considering all valid lines.",
        formula:
          "Sum of valid line occupancy rates",
        unit: "%",
        interpretation:
          "Meets target up to 95%; above 95% does not meet. Color bands: <90% OK; 90–95% caution; >95% out of criteria."
      },

      generalCyclesPerMinute: {
        label: "Cycles/min (Overview)",
        description:
          "Total cycle rate demanded from the robot in the overview.",
        formula:
          "Sum of cycles per minute from valid lines",
        unit: "cycles/min",
        interpretation:
          "Higher values mean a faster and more demanding operation."
      },

      generalRequiredCycleS: {
        label: "Required Cycle Time (Overview)",
        description:
          "Total time window provided by production in the overview.",
        formula:
          "Sum of required times from valid lines",
        unit: "s",
        interpretation:
          "Use it as the reference against total robot cycle time."
      },

      generalAvailableCycleS: {
        label: "Robot Cycle Time (Overview)",
        description:
          "Total time the robot needs to execute the consolidated scenario.",
        formula:
          "Sum of total robot times from valid lines",
        unit: "s",
        interpretation:
          "The closer it is to required cycle time, the lower the margin."
      },

      generalMarginS: {
        label: "Available Time Margin (Overview)",
        description:
          "Time slack between production window and robot demand.",
        formula:
          "Required Cycle Time (Overview) − Robot Cycle Time (Overview)",
        unit: "s",
        interpretation:
          "Low or negative margin indicates a limit or overloaded scenario."
      },

      generalChartComparison: {
        label: "Line comparison",
        description:
          "Per line, shows robot occupancy rate in a fixed-width bar (100%).",
        formula:
          "Fill = robot stacking time ÷ required pallet time (same basis as occupancy KPI).",
        unit: "",
        interpretation:
          "Above 100% the bar is solid red. Color bands match the occupancy indicator (<90% / 90–95% / >95%)."
      },

      palletsPerHour: {
        label: "Pallets/hour",
        description:
          "Estimated pallets delivered per hour by the line.",
        formula:
          "60 ÷ (boxes per pallet ÷ production)",
        unit: "pallets/h",
        interpretation:
          "Use it to check if capacity meets output demand."
      },

      averageCycleTimeS: {
        label: "Average cycle time",
        description:
          "Average time between robot cycles on this line.",
        formula:
          "60 ÷ cycles per minute",
        unit: "s",
        interpretation:
          "Lower values mean higher operating frequency."
      },

      cyclesNumberPerMinute: {
        label: "Cycles per minute",
        description:
          "Cycle rate required by the line.",
        formula:
          "Total cycles ÷ total scenario time",
        unit: "cycles/min",
        interpretation:
          "Indicates how intensive the line operation is."
      },

      totalTimeOfPalletStackingS: {
        label: "Required Cycle Time",
        description:
          "Available line time to complete one pallet.",
        formula:
          "Boxes per pallet ÷ production, converted to seconds",
        unit: "s",
        interpretation:
          "Reference used to compare against total robot cycle time."
      },

      accumulationTimeToPalletExchangeS: {
        label: "Accumulation time until pallet exchange",
        description:
          "Time window where boxes can accumulate during pallet exchange.",
        formula:
          "Cycle time/pick + (cycle time/pallet × pallet cycles) + (cycle time/slip sheet × base slips)",
        unit: "s",
        interpretation:
          "Higher values mean higher queue potential during exchange."
      },

      productNumberInSlipAccumulation: {
        label: "Accumulated products during slip sheet",
        description:
          "Estimated boxes arriving during slip sheet operations.",
        formula:
          "Total slip sheet time ÷ gap between boxes",
        unit: "boxes",
        interpretation:
          "Represents queue size generated in this stage."
      },

      cyclesToEmptySlipAccumulation: {
        label: "Cycles to clear accumulation (slip sheet)",
        description:
          "Cycles to clear the queue with continuous product arrivals (net removal).",
        formula:
          "(accumulation ÷ net removal in boxes/s) ÷ pick cycle time",
        unit: "cycles",
        interpretation:
          "Net removal = (boxes/cycle ÷ pick time) − (BPM ÷ 60). If ≤ 0, backlog cannot shrink (Cannot clear)."
      },

      productsNumberInPalletAccumulation: {
        label: "Accumulated products during pallet exchange",
        description:
          "Estimated boxes arriving during pallet exchange.",
        formula:
          "Accumulation time to pallet exchange ÷ gap between boxes",
        unit: "boxes",
        interpretation:
          "Represents queue impact caused by pallet exchange."
      },

      lineMaxProductsInAccumulation: {
        label: "Max products in accumulation",
        description:
          "Largest product backlog between slip-sheet and pallet-exchange accumulation for this line.",
        formula:
          "max(slip accumulation products, pallet-exchange accumulation products)",
        unit: "boxes",
        interpretation:
          "Highlights the worst-case accumulation in the scenario for quick bottleneck scanning."
      },

      cyclesToEmptyPalletAccumulation: {
        label: "Cycles to clear accumulation (pallet)",
        description:
          "Cycles to clear the queue with continuous product arrivals (net removal).",
        formula:
          "(accumulation ÷ net removal in boxes/s) ÷ pick cycle time",
        unit: "cycles",
        interpretation:
          "Same net removal as slip. If ≤ 0, backlog cannot shrink (Cannot clear)."
      },

      occupancyVisualStatus: {
        label: "Visual status indicator",
        description:
          "Color follows the occupancy rate for the displayed scenario.",
        formula: "",
        unit: "",
        interpretation:
          "Same bands as occupancy: <90% green; 90–95% yellow; >95% red. Meets target up to 95%; above 95% does not meet."
      },

      chartLegendRequired: {
        label: "Required",
        description:
          "Time the line needs to finish stacking for the selected recipe.",
        formula: "",
        unit: "",
        interpretation: ""
      },

      chartLegendRobot: {
        label: "Robot time",
        description:
          "Time the robot spends stacking, on the same scale as required time.",
        formula: "",
        unit: "",
        interpretation:
          "Color follows robot occupancy (same bands as the occupancy indicator)."
      },

      chartLegendOccupancy: {
        label: "Robot occupancy (0–100%)",
        description:
          "Each line has a fixed-width track; the fill shows that line’s robot occupancy rate.",
        formula:
          "Occupancy = robot stacking time ÷ required pallet time",
        unit: "",
        interpretation:
          "Up to 100%, fill length matches occupancy. Above 100%, the bar fills the track in red (overload)."
      }
    }
  };

  // default (pt) – será atualizado pelo i18n.js ao alternar idioma
  window.HELP_DATA = window.HELP_DATA_BY_LANG.pt;
})();