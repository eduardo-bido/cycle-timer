# Cycle Timer

Ferramenta front-end para dimensionamento de capacidade de células de paletização com robô industrial compartilhado entre múltiplas linhas de produção.

## 1. Visão Geral do Produto

O `Cycle Timer` é uma aplicação web estática (HTML + JavaScript + CSS) para análise técnica de capacidade em cenários de paletização.  
O foco é calcular carga do robô e viabilidade operacional com base em **tempo**, não apenas em volume de caixas.

### Para quem é

- Engenharia de processos
- Engenharia de automação
- Times de aplicação/comissionamento de células robotizadas
- Times de pré-vendas técnicas e estudo de capacidade

### Problema que resolve

- Estimar se um robô compartilhado atende múltiplas linhas simultaneamente
- Identificar margem operacional e risco de sobrecarga
- Entender comportamento de acúmulo durante operações (slip sheet e troca de pallet)
- Consolidar KPIs globais sem perder leitura por linha

---

## 2. Conceitos de Negócio (Domínio)

### Tempo necessário

Tempo que a produção leva para completar um pallet em uma linha, derivado da taxa de entrada de caixas e da configuração de pallet.

No engine, é representado por `totalTimeOfPalletStackingS`.

### Tempo do robô

Tempo total efetivamente gasto pelo robô para executar as operações válidas de pick, slip sheet e pallet.

No engine, é representado por `totalStackingTimeRobotS`.

### Taxa de ocupação

Relação entre tempo do robô e tempo necessário da linha:

- `robotOccupancyRate = totalStackingTimeRobotS / totalTimeOfPalletStackingS`

No bloco **Geral**, a ocupação é consolidada por **soma das ocupações válidas por linha**.

### Margem disponível

Diferença entre tempo necessário e tempo do robô:

- `margem = tempo necessário - tempo do robô`

No bloco Geral, a margem também é consolidada com base nas somas globais válidas.

### Consolidação das linhas

Os KPIs gerais são obtidos por **soma** das linhas válidas:

- ocupação geral = soma das ocupações por linha válida
- ciclos/min geral = soma dos ciclos/min por linha válida
- tempo necessário geral = soma dos tempos necessários por linha válida
- tempo do robô geral = soma dos tempos do robô por linha válida

### Regras de validade de linha

Uma linha entra na consolidação do Geral quando:

- tem receita associada
- possui dados mínimos válidos de produção e pallet (`productionBpm`, `boxesPerLayer`, `layersPerPallet`, `picksPerLayer` > 0)
- possui ao menos um movimento fisicamente válido:
  - pick válido (`quantidade > 0` e `cycleTimePickS > 0`), ou
  - slip válido (`quantidade > 0` e `cycleTimeSlipSheetS > 0`), ou
  - pallet válido (`quantidade > 0` e `cycleTimePalletS > 0`)

---

## 3. Como o Sistema Funciona (Fluxo)

## Fluxo macro

1. Usuário preenche dados na aba `INPUTS`:
   - tempos do robô por linha
   - planilha de receitas
   - associação `Linha -> Receita`
2. Dados são convertidos para números na camada de UI
3. `computeCycleTimer` calcula KPIs por cenário/linha
4. UI renderiza:
   - bloco Geral (consolidação)
   - comparação visual por linha
   - cards técnicos por linha
   - aba Outputs (visão legada de linha única)

## Entrada -> processamento -> saída

- **Entrada**: DOM (`index.html`) + eventos (`ui-inputs.js`, `ui-outputs.js`)
- **Processamento**:
  - motor matemático puro (`engine.js`)
  - regras de consolidação no renderer de outputs (`ui-outputs.js`)
- **Saída**:
  - KPIs em cards/tabelas
  - status visual por faixa de ocupação
  - gráfico SVG comparativo
  - tooltips de ajuda e página HELP

## Tratamento de múltiplas linhas

- Quantidade de linhas (`robot-lines-count`) controla visibilidade (1..6)
- Cada linha pode ser associada a uma receita da planilha
- Cada linha usa tempos próprios (`robot-ciclo*` por sufixo `-lN`)
- Cálculo por linha é independente
- Consolidação Geral soma apenas linhas válidas

---

## 4. Arquitetura do Projeto

## Estrutura de arquivos

- `index.html`: shell da aplicação, tabs, formulário, áreas de output, bindings por IDs e `data-*`
- `app.js`: orquestra estado central, navegação entre abas, recomputação e integração entre camadas
- `engine.js`: motor de cálculo puro, sem DOM e sem storage
- `ui-inputs.js`: captura inputs, parse de números, manipulação da planilha e overlay
- `ui-outputs.js`: renderização dos KPIs, consolidado Geral, gráfico e cards por linha
- `ui-help.js`: engine de tooltip baseada em `data-help-key`
- `ui-help-page.js`: renderização da aba HELP com cartões e diagrama
- `ui-header-settings.js`: controle do menu dropdown de configurações (exportação, help)
- `help-data.js`: base de conhecimento de ajuda (PT/EN), com `label`, `description`, `formula`, `interpretation`
- `i18n.js`: tradução da interface por `data-i18n`, toggle de idioma e sincronização com help
- `storage.js`: persistência simples em `localStorage` do cenário
- `scenario-io.js`: exportação e importação de cenários via arquivo JSON
- `scenario-pdf.js`: rotina para geração de relatórios do cenário em PDF
- `theme.js`: toggle de tema claro/escuro em `localStorage`
- `styles.css`: sistema visual completo (layout, responsividade, estados, tooltip, dark mode)

## Conexões principais

- `index.html` carrega scripts nesta ordem (incluindo dependências externas para PDF):
  1. engine
  2. storage
  3. theme
  4. i18n
  5. help-data
  6. ui-help
  7. pdfmake (via CDN)
  8. ui-outputs
  9. ui-inputs
  10. ui-help-page
  11. scenario-pdf
  12. app
  13. ui-header-settings
  14. scenario-io

- `app.js` depende de funções globais expostas por:
  - `ui-inputs.js` (`initInputsUI`, `applyInputsFromState`)
  - `ui-outputs.js` (`renderOutputs`)
  - `engine.js` (`computeCycleTimer`)
  - `storage.js` (`loadScenario`, `saveScenario`)

---

## 5. Engine (Cálculo)

Arquivo: `engine.js`

## Funções base

- `safeDivide`, `safeMultiply`, `safeAdd`: operações seguras com retorno `null` em casos inválidos
- `normalize`: transforma valor inválido/negativo em `null`
- `componentTime(quantity, cycleTime)`:
  - retorna `null` se dado inválido
  - retorna `0` se `quantity <= 0` ou `cycleTime <= 0`
  - retorna produto quando ambos > 0
- `componentCycles(quantity, cycleTime)`:
  - retorna `0` em inválido ou não aplicável
  - retorna quantidade quando ambos > 0

## Regras condicionais críticas implementadas

- Componentes pick/slip/pallet só contribuem com tempo/ciclo quando **quantidade > 0** e **tempo > 0**
- Quando componente não se aplica, contribuição é **0** (não `null`)
- `null` é usado para inconsistência matemática/entrada inválida

## KPIs calculados pelo motor

O engine retorna, entre outros:

- `totalBoxesOnPallet`
- `picksPerPallet`
- `gapBetweenBoxesS`
- `boxesPerCycle`
- `totalCyclesPerPallet`
- `totalCycleTimePicksS`
- `totalCycleTimeSlipSheetS`
- `totalCycleTimePalletsS`
- `totalStackingTimeRobotS`
- `accumulationTimeToPalletExchangeS`
- `productNumberInSlipAccumulation`
- `cyclesToEmptySlipAccumulation`
- `productsNumberInPalletAccumulation`
- `cyclesToEmptyPalletAccumulation`
- `totalTimeOfPalletStackingS`
- `robotOccupancyRate`
- `cyclesNumberPerMinute`
- `averageCycleTimeS`
- `palletsPerHour`

## Soma geral e consistência

A consolidação multi-linha não está no `engine.js`; está em `ui-outputs.js` (`renderGeneralKpisFromLines`) por soma de linhas válidas.  
Separação atual:

- engine: cálculo unitário por cenário
- UI outputs: seleção de linhas válidas + consolidação geral

---

## 6. UI / Renderização

Arquivo principal: `ui-outputs.js`

## Organização visual

- **Bloco Geral (aba Inputs / lado direito)**
  - taxa de ocupação consolidada
  - ciclos/min consolidado
  - tempo necessário (soma)
  - tempo do robô (soma)
  - margem disponível (diferença das somas)
  - gráfico comparativo por linha (SVG)

- **Análise individual por linha**
  - cards por linha com:
    - topo executivo (ocupação, ciclos/min, tempo necessário, margem)
    - blocos técnicos (receita, produção, tempos, resultados, acumulação, performance)

- **Aba Outputs**
  - visão tabular detalhada de um cenário (modelo legado de linha única)

## Como outputs são montados

- `computeLineResults` monta entradas por linha (receita associada + tempos da linha)
- cada linha chama `computeCycleTimer`
- render:
  - `renderGeneralChart(lines)`
  - `renderGeneralKpisFromLines(lines)`
  - `rebuildLinesOverviewGrid()`

---

## 7. Sistema de Tooltips

Arquivos: `ui-help.js` + `help-data.js`

## Funcionamento

- Elementos de UI usam `data-help-key`
- Ao passar mouse/foco, `ui-help.js`:
  - lê `data-help-key`
  - busca entrada em `window.HELP_DATA`
  - monta tooltip com:
    - descrição
    - fórmula (se existir)
    - interpretação (se existir)

## Fonte dos textos

- `help-data.js` centraliza conteúdo em `window.HELP_DATA_BY_LANG` (`pt` e `en`)
- `window.HELP_DATA` aponta para o idioma ativo (sincronizado por `i18n.js`)

## Estrutura dos itens de ajuda

Cada chave contém:

- `label`
- `description`
- `formula`
- `unit`
- `interpretation`

---

## 8. Sistema de I18N

Arquivo: `i18n.js`

## Funcionamento

- Dicionário interno `I18N.pt` e `I18N.en`
- Seletores usados:
  - `data-i18n` -> `textContent`
  - `data-i18n-placeholder` -> `placeholder`
  - `data-i18n-title` -> `title`
- Idioma persistido em `localStorage` (`cycle-timer-lang`)

## Integração com help

- `applyLanguage` também atualiza:
  - `window.HELP_DATA = window.HELP_DATA_BY_LANG[lang]`
- Re-renderiza página HELP quando necessário

## Como adicionar novos textos

1. Adicionar chave em `I18N.pt` e `I18N.en`
2. Referenciar chave no HTML/DOM via `data-i18n*`
3. Evitar texto hardcoded em JS/HTML quando for conteúdo de interface traduzível

---

## 9. Regras Importantes do Projeto

Estas regras devem ser preservadas para manter coerência funcional:

- KPIs gerais devem ser consolidados por **soma** de linhas válidas
- Não usar média, máximo ou mínimo para ocupação/ciclos/tempos gerais
- Linha sem operação válida não entra no consolidado
- Componente pick/slip/pallet sem `quantidade > 0` e `tempo > 0` deve contribuir com `0`
- `null` deve representar invalidade/inconsistência matemática, não “não aplicável”
- Manter i18n centralizado em `i18n.js` (sem lógica paralela)
- Manter tooltips via `data-help-key` + `help-data.js` (sem duplicação de textos de ajuda)
- `engine.js` deve permanecer puro (sem dependência de DOM/storage)

---

## 10. Padrões de Código (Extensão)

## Como adicionar novo KPI

1. Implementar cálculo em `engine.js` (se for KPI unitário)
2. Expor no retorno de `computeCycleTimer`
3. Renderizar em `ui-outputs.js`:
   - formatter adequado
   - fallback `—` para inválido
4. Se KPI for consolidado multi-linha, implementar regra de agregação em `renderGeneralKpisFromLines`
5. Se houver texto de UI, adicionar chave no `i18n.js`
6. Se houver tooltip, criar chave em `help-data.js`

## Como adicionar novo tooltip

1. Criar chave em `help-data.js` (`pt` e `en`)
2. Adicionar `data-help-key="novaChave"` no elemento visual
3. Garantir `data-i18n-aria-label="tooltip_helpTitle"` nos ícones de ajuda (sem `title`, para evitar tooltip nativo do browser)

## Como adicionar novo texto traduzido

1. Inserir chave em `I18N.pt` e `I18N.en` em `i18n.js`
2. Usar `data-i18n`, `data-i18n-placeholder` ou `data-i18n-title`
3. Evitar hardcode literal quando for conteúdo de interface

---

## 11. Limitações Atuais

Limitações observáveis no código atual (sem proposta de melhoria):

- Existe coexistência de fluxo legado de linha única (`state.recipe`/`state.robotTimes` em `app.js`) com fluxo multi-linha de associação linha->receita (`ui-outputs.js`)
- O cálculo consolidado Geral está acoplado à camada de renderização (`ui-outputs.js`), não ao motor puro
- Há mapeamento de colunas da planilha com ajuste manual entre ordem visual e campos do engine (documentado em comentários de `ui-inputs.js` e `ui-outputs.js`)
- Vários rótulos de cards por linha são renderizados como texto fixo no JS (não totalmente cobertos por `data-i18n`)
- `styles.css` concentra grande volume de estilos com blocos sobrepostos/iterativos, aumentando complexidade de manutenção visual

---

## 12. Como Rodar o Projeto

## Requisitos

- Navegador moderno (Chrome, Edge, Firefox)
- Não há backend
- Não há build step obrigatório
- Não há dependências externas obrigatórias via npm para execução local

## Execução

1. Abra o arquivo `index.html` no navegador  
ou
2. Sirva a pasta com um servidor estático simples e abra a URL local

## Persistência local

- Cenário: `localStorage` (`cycle-timer-scenario-v1`)
- Idioma: `localStorage` (`cycle-timer-lang`)
- Tema: `localStorage` (`cycle-timer-theme`)

---

## Resumo técnico rápido

- Front-end puro, sem framework
- Motor matemático desacoplado em `engine.js`
- Camadas de UI separadas por responsabilidade (inputs, outputs, help)
- i18n e help centralizados
- Consolidação geral multi-linha baseada em soma de linhas válidas

