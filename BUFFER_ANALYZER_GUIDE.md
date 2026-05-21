# Documentação Técnica: Buffer Analyzer Module
**Versão:** 1.0 (Ready for Field)
**Objetivo:** Validação técnica e comercial de sistemas de acúmulo (buffers) para linhas de paletização robótica.

---

## 1. Visão Geral
O Buffer Analyzer é um módulo independente projetado para auxiliar a equipe de engenharia de aplicação e pré-venda. Ele permite simular cenários de parada (ex: troca de pallet) e verificar se o comprimento da esteira e as velocidades do robô são suficientes para manter a linha em operação sem transbordos.

### Diferenciais:
- **Isolamento de Estado:** Os dados do buffer não interferem no projeto principal do Cycle Timer.
- **Persistência Local:** Dados salvos automaticamente no navegador (`cycle-timer-buffer-v1`).
- **Relatório Comercial:** Layout otimizado para impressão/PDF de propostas técnicas.

---

## 2. Dicionário de Variáveis (Inputs)

### Fluxo de Produção
| Variável | Descrição | Impacto |
| :--- | :--- | :--- |
| **Infeed Rate** (cpm) | Taxa de produção da linha que alimenta o buffer. | Define a velocidade de acúmulo. |
| **Outfeed Rate** (cpm) | Taxa de retirada do robô (capacidade de paletização). | Define a velocidade de recuperação do buffer. |
| **Stop Time** (s) | Tempo em que o robô para de retirar produtos (ex: troca de pallet). | Define o volume de pico de acúmulo. |

### Dimensões Físicas
| Variável | Descrição | Impacto |
| :--- | :--- | :--- |
| **Buffer Length** (mm) | Comprimento linear total da esteira ou mesa de acúmulo. | Define a capacidade máxima física. |
| **Box Length** (mm) | Maior lado da caixa (considerando o pior cenário de orientação). | Usado para converter volume em metros lineares. |

---

## 3. Motor de Cálculo (Fórmulas)

O sistema utiliza os seguintes cálculos para gerar os vereditos de engenharia:

### 3.1. Capacidade Física ($C_f$)
Quantas caixas cabem linearmente na esteira.
$$C_f = \lfloor \frac{Comprimento\ Buffer}{Comprimento\ Caixa} \rfloor$$

### 3.2. Acúmulo Dinâmico ($A_d$)
Volume de caixas acumuladas durante a parada do robô.
$$A_d = \lceil (\frac{Infeed}{60}) \times Tempo\ de\ Parada \rceil$$

### 3.3. Taxa de Recuperação ($R_t$)
Diferencial de velocidade para esvaziar o buffer.
$$R_t = Outfeed - Infeed$$
*Nota: Se $R_t \leq 0$, o sistema está em estado de **Saturação**.*

### 3.4. Tempo de Recuperação ($T_{rec}$)
Tempo necessário para o robô esvaziar o acúmulo gerado na parada.
$$T_{rec} (s) = (\frac{A_d}{R_t}) \times 60$$

### 3.5. Margem de Segurança ($M_s$)
Tempo extra de parada que o buffer suporta além do planejado.
$$M_s (s) = \lfloor \frac{C_f - A_d}{Infeed / 60} \rfloor$$

---

## 4. Lógica de Veredito (Análise de Risco)

O sistema classifica o projeto em 4 estados baseados no **Percentual de Ocupação Crítica** ($Occ = \frac{A_d}{C_f} \times 100$):

1.  **✅ SEGURO ($Occ \leq 80\%$):** 
    - O buffer comporta o acúmulo com folga. 
    - Oferece uma margem de segurança robusta para micro-paradas aleatórias.
2.  **⚠️ LIMITE ($80\% < Occ \leq 100\%$):** 
    - O buffer comporta o acúmulo, mas a margem de erro é baixa. 
    - Requer atenção ao tempo de troca de pallet; qualquer atraso causará transbordo.
3.  **❌ TRANSBORDA ($Occ > 100\%$):** 
    - Erro de dimensionamento físico. O acúmulo excede o comprimento da esteira.
    - O sistema calcula automaticamente quantos metros extras são necessários.
4.  **🛑 SATURAÇÃO ($Infeed \geq Outfeed$):** 
    - Erro de balanceamento de linha. O robô não é capaz de "limpar" o acúmulo.
    - O sistema avisa que a linha irá parar definitivamente, independente do tamanho do buffer.

---

## 5. Simulador Visual
O simulador utiliza uma escala de tempo acelerada ($4x$) para demonstrações rápidas.
- **Cor Verde:** Operação segura.
- **Cor Vermelha:** Acionada quando o volume de simulação ultrapassa $100\%$ da capacidade física.
- **Animação:** O preenchimento da esteira possui um padrão de "gomos" de 30px para representar visualmente unidades individuais de caixas.

---

## 6. Guia de Exportação
Ao clicar em **"Gerar Relatório"**, o sistema aplica regras de CSS Print:
- **Oculta:** Inputs, botões de ação e dicas.
- **Exibe:** Somente o cabeçalho, gráfico de simulação, métricas consolidadas e o veredito técnico.
- **Dica:** Utilize a impressora virtual "Save as PDF" do navegador para gerar o anexo comercial.

---
*Documento gerado automaticamente pelo Cycle Timer - Módulo de Engenharia de Aplicação.*
