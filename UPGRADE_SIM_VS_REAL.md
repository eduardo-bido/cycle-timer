# Upgrade: Validação Simulado vs. Real (Validation Loop)

## Contexto e Objetivo
O objetivo desta nova feature no **Cycle Timer** é fechar o ciclo de confiança do cliente (*Validation Loop*). Atualmente focado em *predição* (pré-venda), a ferramenta ganhará uma nova aba para *auditoria e otimização* (pós-venda). 
Isso permitirá comparar os dados de ciclo simulados na fase de pré-venda com os dados reais aferidos no robô físico após a instalação, identificando desvios (ganhos ou perdas), eliminando "gorduras" nos cálculos e embasando decisões orientadas a dados (data-driven).

## Premissas Definidas
1. **Fonte de Dados:** Inicialmente, os dados do robô real serão inseridos através de **input manual** pelo usuário na interface. (A integração automática ficará para o futuro).
2. **Nível de Detalhe:** O nível de granularidade será idêntico ao modelo atual. Os mesmos parâmetros avaliados na simulação (Pick, Place, movimentos, etc.) serão analisados no real. O diferencial será apenas o *tempo de ciclo* de cada etapa.
3. **Persistência:** A análise será **volátil**. O usuário insere os dados, analisa as diferenças, gera um relatório em PDF e o processo é encerrado sem salvar o histórico "Real" no banco de dados do projeto.
4. **Objetivo Final:** Entender detalhadamente o que foi ganho ou perdido entre a simulação e a realidade, fornecendo inteligência para refinar simulações futuras.

---

## Propostas de Interface (Brainstorming)

Existem três caminhos principais para estruturar a visualização desta comparação:

### Opção 1: O "Shadow Dashboard" (Espelhamento Side-by-Side)
Criar uma versão "espelho" do dashboard atual, mas com campos de input editáveis para o tempo real.
* **Como funciona:** A aba é dividida em duas colunas. A esquerda mostra os dados da simulação (travados). A direita possui campos numéricos para input dos tempos reais aferidos em campo.
* **Destaque Visual:** À medida que o usuário digita, o Cycle Timer gera barras de progresso ou indicadores de cor (Verde/Vermelho) comparando o real vs. simulado instantaneamente.
* **Vantagem:** Altamente intuitivo. Segue a mesma linguagem visual do dashboard de simulação já conhecido pelo usuário.

### Opção 2: A "Tabela de Auditoria" (Foco em Delta)
Uma abordagem mais técnica, focada puramente nos números e na identificação de gargalos.
* **Como funciona:** Uma tabela detalhada onde cada linha representa um processo (ex: "Pick Pallet", "Cycle Layer 1", "Place Slip Sheet").
* **Colunas:** `Processo` | `Simulado (s)` | `Real (s)` | `Diferença (s)` | `Impacto no Pallet (min)`.
* **Destaque Visual:** Inclusão de um gráfico de "Cascata" (Waterfall Chart) mostrando visualmente onde o tempo está "vazando" (ex: "Perdeu 2s na garra, mas ganhou 1s no deslocamento").

### Opção 3: O "Ghost Chart" (Sobreposição Gráfica)
Focada na visualização da linha do tempo, ocupação e cadência.
* **Como funciona:** Reutiliza o conceito do gráfico de ocupação horizontal do Cycle Timer. A simulação aparece com cores sólidas e o "Real" aparece como uma linha de contorno ("fantasma") sobreposta.
* **Destaque Visual:** O usuário consegue visualizar fisicamente o "atraso" ou o "ganho" no tempo de ciclo acumulado avançando ou recuando ao longo da timeline do ciclo.

---

## Recomendação de Arquitetura Técnica

Para manter a base de código do Cycle Timer limpa e modular:
1. **Novo Módulo:** Criar um arquivo dedicado `ui-comparison.js`.
2. **Estado da Aplicação:** O orquestrador `app.js` ficará encarregado de passar os resultados congelados do `calcEngine.js` para esta nova aba como a "Base de Referência".
3. **Input Manual Dinâmico:** Desenvolver uma função de renderização que gere os campos de input de acordo com a configuração atual do robô (ex: se o projeto não usa Slip Sheet, o campo de input real para Slip Sheet não é renderizado).

---

## Próximos Passos (Perguntas para a próxima sessão)

Para darmos continuidade no desenvolvimento técnico e de interface, por favor, responda às seguintes perguntas na nossa próxima interação:

1. **Agrupamento:** No cenário "Real", você prefere inserir o tempo de **cada ação individual detalhada** (Pick, Move, Place) ou apenas o **tempo total macro do ciclo do robô**, deixando o sistema calcular a diferença bruta global?
2. **Variabilidade:** No mundo físico, os ciclos sofrem pequenas variações. O usuário irá inserir uma **média mental já calculada** de x ciclos ou a interface deveria permitir inserir o tempo de **vários ciclos** para que o próprio sistema extraia a média e compare com a simulação?
3. **A "Gordura":** Você gostaria que, ao final da análise, o sistema sugerisse um **"Fator de Eficiência" automático** baseado nessa divergência? (Exemplo de insight: *"Sua simulação está 15% mais rápida que o real, sugerimos aplicar um fator limitador de 0.85 nas próximas propostas semelhantes"*).
4. **Direção de Interface:** Das 3 opções de UI apresentadas (Shadow Dashboard, Tabela de Auditoria, Ghost Chart), qual (ou qual combinação delas) faz mais sentido para o seu fluxo de trabalho atual?
