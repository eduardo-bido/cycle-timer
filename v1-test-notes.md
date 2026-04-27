# Cycle Timer — notas para teste interno (v1)

## Como abrir

Abrir `index.html` no browser (Chrome/Edge recomendado). Requer rede para CDN do PDF (pdfMake); sem rede, export JSON continua a funcionar; PDF mostra aviso se a lib não carregar.

## O que esta versão já faz

- Entrada: modelo do robô, N linhas (1–6), tempos de ciclo por linha, planilha de receitas, mapeamento linha→receita.
- Cálculo: motor `computeCycleTimer` + outputs agregados (Geral) e por linha.
- Visualização: aba OUTPUTS com KPIs, gráfico comparativo, cards por linha.
- Tema claro/escuro e idioma PT/EN (persistência em `localStorage`).
- Import/export de cenário em JSON (schema version 1).
- Export PDF do relatório técnico (menu Config).
- Help integrado com busca.

## O que validar (checklist curto)

| Área | Verificar |
|------|-----------|
| 1 linha | Cálculo, OUTPUTS, Geral, PDF |
| 2–3 linhas | Mapeamentos diferentes, gráfico/KPIs |
| Dark / light | Legibilidade, sem estados partidos |
| Config | Menu abre/fecha; PDF e JSON |
| JSON | Export baixa ficheiro; import válido aplica; JSON inválido mostra mensagem |
| Help | Abre, busca, tooltips |
| Acúmulo / gates | KPIs de acúmulo; bloqueios pallet/slip quando tempos = 0 |

## Limitações conhecidas (v1)

- Motor e estado principal ligados à **receita da linha 1** na planilha; linhas extra são cenário multi-linha na UI, não múltiplos motores independentes.
- PDF depende de CDN (pdfMake + fontes).
- Sem backend: tudo em cliente; `localStorage` pode falhar em modo privado restrito (tema/idioma/cenário).

## Pontos futuros (não escopo desta entrega)

- Evoluções de produto após feedback do teste interno.

## Estabilidade (passe v1)

- Guarda contra dupla inicialização do header de outputs.
- Import: ficheiro vazio e falhas de leitura/parse com mensagem explícita.
- Export JSON: falha inesperada com alerta.
- PDF: falha na geração com mensagem explícita.
- Tema: rótulos do botão alinhados ao idioma (PT/EN).
