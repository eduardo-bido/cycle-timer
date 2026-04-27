# Future Plan — Cycle Timer

## 1. Visão geral

O **Cycle Timer** nasceu e se consolidou como ferramenta técnica de **capacidade para paletização**: entradas estruturadas, cálculo de tempos de ciclo, ocupação do robô, saídas por linha, gráfico comparativo no bloco Geral, modo escuro, help consultivo e fluxo de trabalho focado em **análise calculada** a partir de receitas e parâmetros operacionais informados pelo usuário.

Essa base é deliberadamente **estática no sentido de modelo**: o motor atual responde “quanto tempo / qual ocupação” dadas as premissas, sem ainda modelar geometria de célula, trajetória física do braço ou escolha estruturada de equipamento. A **próxima evolução natural** do produto é sair exclusivamente dessa camada de análise numérica consolidada para uma **camada de simulação operacional** — ainda determinística no início — que aproxime o software do que a célula realmente exige: alcance, layout, garra, movimentação e tempos não cobertos apenas pela soma de ciclos de pick/slip/pallet.

Em síntese:

- **Núcleo atual:** calcula capacidade, ocupação, tempos agregados e comparativos entre “necessário” e “tempo do robô”, com forte ênfase em auditabilidade e consistência com a receita.
- **Futuro próximo:** evoluir para **simular célula, robô, layout, garra e movimentação** com regras explícitas, dados fixos por modelo e construção de cenário.
- **Horizonte mais amplo:** a ferramenta pode tornar-se um **sistema de apoio técnico-comercial** — útil em pré-venda, especificação e discussão de viabilidade — desde que a arquitetura de produto preserve clareza sobre o que é modelo, o que é hipótese e o que é recomendação.

Este documento fixa essa visão para **não perder contexto** entre ciclos de desenvolvimento e para alinhar produto, engenharia e stakeholders sobre **prioridades, fases e limites**.

---

## 2. Objetivo macro da evolução

O objetivo macro da evolução futura é **transformar o Cycle Timer em uma plataforma de análise e simulação de células robotizadas** para paletização (e, em extensões posteriores, cenários adjacentes), mantendo a tradição de transparência numérica que o produto já cultiva.

Concretamente, a evolução deve:

- **Permitir prever** se a célula **atende ou não** requisitos de throughput, tempo ou ocupação sob um conjunto de premissas geométricas e operacionais explícitas — não apenas “recalcular KPIs” com os mesmos inputs de hoje.
- **Permitir comparar robôs** (ou variantes de configuração) sobre o **mesmo layout e receita**, reduzindo discussões subjetivas na pré-venda.
- **Reduzir incerteza técnica** antes da instalação: menos suposição implícita sobre “cabe no alcance” ou “o ciclo fecha”, mais **estrutura de dados e regras** visíveis e contestáveis.
- **Gerar mais segurança na tomada de decisão** para vendas e aplicação, com **advertências claras** sobre limitações do modelo e margens conservadoras onde a realidade for mais complexa que a simulação.

O macro-objetivo **não** é substituir estudos de integrador ou simuladores 3D industriais completos na primeira fase; é **elevar o Cycle Timer** de calculadora de capacidade para **ambiente de cenário e decisão**, com crescimento por camadas.

---

## 3. Nova aba futura: Simulação

A futura aba **Simulação** será o **centro da evolução** descrita neste plano. Ela não substitui a aba atual de entradas e saídas: **complementa** o produto com um espaço onde o usuário (ou o time interno em modo avançado) monta **cenário de célula** e obtém **vereditos e comparativos** alinhados a dados de robô e layout.

Concentração esperada nessa aba:

- **Documentação fixa por modelo de robô** — fichas técnicas normalizadas internamente (velocidades de referência, limites, notas de uso).
- **Work envelope / alcance** — regras ou tabelas que permitam avaliar se pontos de captura e entrega são plausíveis dentro do alcance útil.
- **Velocidade e dinâmica por robô** — parâmetros que alimentem estimativas de tempo de movimento, sempre com versão e fonte rastreável.
- **Parâmetros relevantes de operação** — o que for necessário para cruzar com a receita sem duplicar indevidamente o que já existe na aba principal.
- **Montagem de layout** — posicionamento de elementos da célula em um modelo inicialmente **2D** (planta), com evolução possível para 3D mais tarde.
- **Cálculo de movimentação** — deslocamentos entre pontos, com decomposição em tempos configuráveis e margens.
- **Tempos adicionais de captura e entrega** — além dos ciclos já tratados como tempos de processo na visão atual.
- **Considerações para pallet e slipsheet** — tempos e interferências geométricas quando aplicável ao cenário.
- **Efeito da garra** — massa, abertura/fechamento, restrições e impacto no ciclo total.

A aba Simulação deve conversar com o **mesmo núcleo de receita** já existente: a receita continua sendo a verdade do produto; a simulação **cruza** essa verdade com o **mundo físico** modelado.

---

## 4. Escopo funcional detalhado da aba Simulação

### 4.1 Base fixa por robô

- **Velocidade de referência** — bases para estimar tempos de movimento (com granularidade compatível com a fase 1; evolução posterior para perfis mais ricos).
- **Envelope de trabalho** e **alcance** — dados que permitam testar se pontos de interesse estão dentro da zona útil.
- **Limitações geométricas e por altura** — restrições explícitas para não “aceitar” cenários impossíveis sem aviso.
- **Parâmetros relevantes por modelo** — cada robô como um **registro versionado** (código interno, fabricante, série, notas de validade).

### 4.2 Construção do layout

- **Modelagem 2D inicialmente** — planta com entidades posicionáveis (referências, esteiras, pallet, robô em posição base).
- **Possibilidade futura de 3D** — fora do escopo imediato, mas arquitetura mental e de dados deve permitir evoluir sem refazer tudo.
- **Definição de posições de captura e entrega** — coordenadas ou ancoragens em elementos do layout.
- **Esteiras de entrada e saída** — como referências geométricas e, quando couber, pontos de acoplamento com tempos.
- **Pallet, slipsheet, alturas relevantes** — camada de dados necessária para cruzar com tempos adicionais e restrições.
- **Distâncias e geometrias** — insumos explícitos para o motor de movimentação; tudo auditável na interface.

### 4.3 Cálculo de movimentação

- **Tempo de deslocamento do robô** — estimativa entre pontos, com modelo explícito de complexidade crescente por fase.
- **Tempo de captura e de entrega** — parcelas dedicadas, separadas de “ciclo de processo” já conhecido da receita quando fizer sentido.
- **Tempos adicionais por abertura/fechamento de garra** — parâmetros da garra selecionada.
- **Tempos adicionais por pallet e slipsheet** — quando modelados como sobrecargas ou etapas explícitas.
- **Impacto de altura e distância** — regras conservadoras (ex.: penalidades) antes de qualquer modelo físico fino.
- **Margem de segurança sempre para cima** — princípio de engenharia: em dúvida, o produto tende a **piorar** o tempo estimado e **sinalizar** incerteza, não o contrário.

### 4.4 Garras padrão

- **Seleção entre garras padrão** — catálogo inicial limitado, evitando explosão combinatória na fase 1.
- **Peso da garra e peso combinado garra + produto** — insumos para regras de dinâmica e limites futuros.
- **Tempo de abertura e fechamento** — impacto direto no ciclo.
- **Impacto da garra no ciclo** — visível e comparável entre cenários.
- **Restrições de capacidade e dinâmica** — o que for possível sem simulador físico completo, sempre com limites declarados ao usuário.

### 4.5 Cruzamento com receita

- **Uso de tamanho da caixa e dados da receita** — evitar digitação duplicada; reaproveitar o que já está no sistema.
- **Cruzamento com parâmetros operacionais** — coerência entre “o que a receita pede” e “o que o layout permite”.
- **Validação de coerência** — alertas quando dimensões, alturas ou ritmos forem incompatíveis com o cenário geométrico.
- **Enriquecimento da análise** — a simulação **alimenta** a visão consolidada, não substitui o motor atual sem transição clara.

### 4.6 Avaliação de atendimento da célula

- **Testar se o robô atende a célula** — resultado claro (atende / não atende / atende com ressalvas), com motivos.
- **Trocar modelo de robô** — comparar cenários mantendo layout e receita fixos quando desejado.
- **Comparar cenários** — lado a lado ou em sequência, conforme UX futura.
- **Indicar quando um robô não atende** — com **causas** vinculadas a dados (alcance, tempo, ocupação agregada, etc.).
- **Apontar caminhos** — ex.: “modelo X com maior alcance” permanece visão de produto; na fase avançada, o agente de IA pode ajudar a formular isso, mas a **regra de negócio** deve existir antes da IA.

---

## 5. Roadmap por fases

### Fase 1 — Simulação determinística mínima

**Objetivo:** entregar valor rápido com **modelo simples, honesto e auditável**.

- Base por robô (dados mínimos confiáveis).
- Layout 2D simples com poucos tipos de entidade.
- Pontos de captura e entrega definíveis.
- Cálculo inicial de deslocamento com hipóteses explícitas.
- Resposta básica **atende / não atende** (e eventualmente “atende com margem baixa”), com texto técnico claro.

**Critério de sucesso:** um usuário interno ou comercial consegue montar um cenário mínimo e obter um veredito que **não contradiz** a aba principal e que **não promete** precisão milimétrica inexistente.

### Fase 2 — Simulação operacional expandida

**Objetivo:** aumentar **fidelidade operacional** sem saltar para 3D.

- Pallet e slipsheet modelados com impactos de tempo e, quando possível, de geometria.
- Garra com parâmetros de peso e tempos de abertura/fechamento.
- Alturas e distâncias com penalidades ou validações adicionais.
- Margem de segurança configurável por perfil de uso.
- Relatórios de comparação entre cenários mais ricos.

### Fase 3 — Simulação avançada

**Objetivo:** aproximar o produto de **análises de investimento** mais sérias.

- Layout 3D (ou integração com visualização 3D) — **somente** quando a base 2D e o motor estiverem estáveis.
- Comparação mais rica entre robôs e entre layouts.
- Múltiplos cenários salvos, nomeados e versionados (visão de produto).
- Análises mais robustas (sensibilidade, intervalos, exportação técnica).

### Fase 4 — Assistente inteligente / IA

**Objetivo:** acelerar montagem e interpretação, **sem** substituir regras de engenharia.

- Agente de IA para ajudar a montar a célula a partir de descrições ou passos guiados.
- Sugestões de ajuste de layout ou parâmetros para viabilizar atendimento.
- Identificação de gargalos explicáveis (com referência aos dados do modelo).
- Sugestão de robô alternativo quando dados suportarem comparação.
- Linguagem técnica clara e **sempre** com opção de ver o raciocínio baseado em fatos do sistema.

---

## 6. Possível agente de IA

A visão de um **agente de IA** no Cycle Timer é **auxiliar**, não autocrático: ele propõe, explica e acelera, mas **não redefine sozinho** parâmetros críticos sem trilha de auditoria.

Ele poderia, no horizonte maduro:

- Orientar a montagem do layout (passo a passo, checklist, sugestões de posicionamento).
- Sugerir ajustes para fazer a célula atender (ex.: alterar ponto de entrega, revisar altura, trocar garra catalogada).
- Propor troca de modelo de robô com base em **dados da base fixa** e no cenário atual.
- Sugerir melhorias geométricas qualitativas, sempre sujeitas à validação humana.
- Identificar gargalos e explicar **por que** o cenário falha (alcance, tempo total, ocupação agregada, etc.).
- Atuar como **assistente técnico-comercial** na conversa com cliente — desde que cada afirmação possa ser rastreada a inputs e regras.

**Importante:** isso é **visão futura**, não compromisso de escopo imediato. A precedência é: **dados corretos, motor determinístico, UX sólida**; IA entra para escalar uso e clareza, não para mascarar buracos no modelo.

---

## 7. Dependências técnicas futuras

Para que a visão se materialize com sustentabilidade, depende-se de:

| Dependência | Por que importa |
|-------------|-----------------|
| **Base de dados por robô** | Sem dados versionados e governados, não há comparação justa nem evolução controlada. |
| **Documentação técnica confiável** | Fonte de verdade para envelope, velocidades e limites; risco alto se baseada apenas em memória oral. |
| **Modelagem geométrica** | 2D primeiro; requisito para layout e distâncias. |
| **Regras para envelope e alcance** | Evitar “aceite visual” falso; regras testáveis. |
| **Regras de garra** | Impacto direto em ciclo e em limites; precisa ser parametrizável. |
| **Regras para pallet/slipsheet** | Conectar operação real aos tempos agregados. |
| **Motor de cálculo adicional** | Camada separada do motor atual de receita, com interfaces claras (entradas/saídas), para não acoplar irreversivelmente. |
| **Governança: fixos vs configuráveis** | Definir o que é dado de catálogo imutável pelo usuário final vs o que é cenário editável — evita simulação “genérica demais” ou “frágil demais”. |

---

## 8. Riscos e desafios

- **Complexidade geométrica** — mesmo em 2D, layout mal concebido pode gerar UX pesada e erros de interpretação.
- **Simulação superficial** — risco de o usuário confundir **estimativa conservadora** com **garantia de performance**; o produto deve combater isso com linguagem e limites explícitos.
- **Dados técnicos frágeis** — um único parâmetro errado na base de robô invalida comparações; versionamento e revisão são obrigatórios.
- **Modelar a realidade operacional** — linha real tem variabilidade, folgas, paradas e integração; o modelo determinístico deve declarar o que **não** cobre.
- **Crescimento sem fases** — tentar entregar 3D, garra completa e IA cedo demais **dilui** valor e aumenta dívida técnica e de confiança.
- **Custo de UX para montar layout** — se for difícil demais, a aba não será usada; a fase 1 precisa ser **mínima mas fluida**.
- **Prometer fidelidade além da engenharia do motor** — risco reputacional; melhor subprometer e documentar incertezas do que o contrário.

---

## 9. Princípios para implementação futura

- **Começar simples** — o menor conjunto de entidades e regras que já permita um veredito útil.
- **Validar valor cedo** — com usuários internos e cenários reais antes de ampliar escopo.
- **Crescer por camadas** — cada fase entrega algo **testável** e **isolável**.
- **Não abraçar 3D no início** — 2D bem feito supera 3D mal integrado na primeira iteração.
- **Priorizar utilidade em pré-venda/aplicação** — perguntas frequentes do negócio guiam o backlog, não o contrário.
- **Manter a ferramenta auditável** — números rastreáveis, fórmulas e premissas acessíveis (alinhado ao DNA atual do produto).
- **Manter linguagem técnica clara** — evitar marketing vago; preferir precisão e advertências onde couber.

---

## 10. O que não faz parte do escopo imediato

No **curto prazo**, o produto tal como está **não** compromete entregar:

- Simulação **3D completa** ou substituição de software CAD/industrial especializado.
- **Agente de IA completo** com autonomia sobre parâmetros críticos sem auditoria.
- **Motor físico avançado** (colisão fina, dinâmica completa, elasticidade, etc.).
- **Otimização automática total** do layout ou do robô sem restrições e sem transparência.
- **Integrações externas amplas** (ERP, PLM, simuladores de terceiros) antes de validar a **Fase 1** com valor demonstrado.

Qualquer item acima pode ser **estudado** em paralelo, mas **não** deve bloquear ou confundir a entrega do núcleo de simulação determinística mínima.

---

## 11. Resumo executivo final

**Hoje**, o Cycle Timer é uma ferramenta madura para **cálculo de capacidade e ocupação** em paletização, com entradas e saídas ricas, visualização comparativa, experiência light/dark e help técnico — um **núcleo forte e auditável**.

**Amanhã**, o produto pode evoluir para uma **plataforma de análise e simulação de células robotizadas**, onde layout, robô, garra e movimentação se juntam à receita para responder perguntas que hoje ficam **fora** do modelo: *cabe? alcança? qual robô compara melhor? o cenário fecha com margem?*

A **aba Simulação** é a **próxima grande frente** porque concentra o salto de categoria: de calculadora confiável para **ambiente de cenário e decisão**, sempre com honestidade sobre limites do modelo.

Essa visão, bem executada em fases, pode transformar o Cycle Timer de ferramenta interna de excelência em **ativo estratégico** para pré-venda e aplicação — desde que dados, governança e UX acompanhem a ambição.

---

*Documento interno de referência — sujeito a revisão conforme aprendizado de produto e prioridades de negócio.*
