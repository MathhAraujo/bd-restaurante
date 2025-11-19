## Dashboard & API do Restaurante

### Visão geral

Aplicação full stack para gestão de um restaurante, composta por:

- `proj-front/dashboard`: painel em React + Vite usado pelo time de atendimento para acompanhar clientes, reservas, comandas e indicadores.
- `proj-back/restaurante`: API Spring Boot responsável por expor os dados e executar operações de CRUD, cálculos de comissão/desconto e consultas analíticas.

A interface utiliza tabelas com ordenação por cabeçalho e gráficos Recharts (barras, linhas, pizza e dispersão) para fornecer insights rápidos aos gestores.

---

### Pré-requisitos

Antes de iniciar, instale/localize:

- Node.js 18+ e npm (ou pnpm/yarn) para o frontend.
- Java 17+ e Maven 3.9+ para o backend.
- Banco de dados configurado conforme `application.properties` (ajuste usuário/senha/URL quando necessário).

---

### Como executar o backend (Spring Boot)

1. `cd proj-back/restaurante`
2. Configure o acesso ao banco em `src/main/resources/application.properties`.
3. Crie e popule o banco com os scripts em `Entregaveis/Entrega 2*`.
4. Suba a API: `mvn spring-boot:run`
5. O backend escuta em `http://localhost:8080` por padrão.

Principais endpoints (ver `proj-front/dashboard/src/services/api.js` para a lista completa):

- `/api/clientes`, `/api/mesas`, `/api/reservas`, `/api/comandas`
- `/api/data/*` para dashboards, views e logs (mesas completas, reservas futuras, indicadores médios, etc.)

---

### Como executar o frontend (Vite + React)

1. Abra outro terminal.
2. `cd proj-front/dashboard`
3. Instale dependências: `npm install`
4. Inicie o modo desenvolvimento: `npm run dev`
5. Acesse `http://localhost:5173` e mantenha o backend ativo.
6. Para build de produção use `npm run build` seguido de `npm run preview`.

Variáveis de ambiente (se necessário) podem ser criadas em `.env` seguindo a convenção Vite (`VITE_*`), apontando para o host da API.

---

### Funcionalidades principais

- **Gestão de Clientes, Mesas, Reservas e Comandas**
  - CRUD completo com formulários modais.
  - Busca por ID e filtros específicos (ex.: clientes sem reserva).
  - Botões de ação atualizam automaticamente os dados e estatísticas relacionadas.
- **Tabelas dinâmicas com ordenação**
  - Clique nos cabeçalhos para ordenar asc/desc em todas as páginas (Clientes, Mesas, Reservas, Comandas, Views e Logs).
  - Tabelas no módulo “Views” exibem todos os campos retornados pelo backend, adaptando‑se a novos atributos automaticamente.
- **Analytics**
  - Gráficos “Total gasto por cliente”, “Comandas por status”, “Reservas por período”.
  - Tooltips adequados ao tema escuro e legendas configuráveis.
- **Indicadores estatísticos**
  - Cartões exibem valores médios, totais e medianas para oferecer uma visão menos sensível a outliers.
- **Ajustes financeiros**
  - Ação “Adicionar Desconto” nas comandas aplica percentuais positivos entre 0 e 100 diretamente no total via backend.

---

### Fluxo sugerido de uso

1. Suba o backend (`mvn spring-boot:run`).
2. Rode o frontend (`npm run dev`).
3. Use o menu lateral para navegar entre Clientes, Mesas, Reservas, Comandas e Analytics (que contém as abas Analytics, Views e Logs).
4. Clique em “Atualizar Dados” dentro de Analytics para forçar sincronização a qualquer momento.
5. Utilize os cabeçalhos das tabelas para ordenar conforme necessário e acompanhe os gráficos para insights de performance.

---

### Demonstração dos requisitos implementados

#### Com o backend ativo, acesse `http://localhost:5173`

---

### CRUD para um total de ao menos 04 tabelas:

1.  CRUD implementado para as tabelas Cliente, Reserva, Mesa e Comanda
2.  Acesse as tabelas utilizando os respectivos botões na barra localizada na região esquerda

---

### Integração com Funções, Procedimentos e Triggers

1.  Funções
    - Função `fnc_calcula_comissao` é chamada pelo trigger `trg_atualiza_total_comanda_fechada` quando a comanda tem seu estado alterado de `ABERTA` para `FECHADA`, adicionando a comissão do garçom ao valor total da comanda
    - Função fnc_ocupacao pode ser vista na aba de Mesas, no card `Percentual de Ocupação`
2.  Procedimentos
    - Procedimento `prc_aplica_desconto` pode ser acionado pelo botão `+ Adicionar Desconto`, passando o id de uma comanda e a % de desconto a ser aplicado
    - Procedimento `Cliente_Total` pode ser visualizado noa aba Analytics, no gráfico `Total Gasto por Cliente (Top 3)` onde são exibidos os 3 clientes com mais gastos no restaurante
3.  Triggers
    - Trigger `trg_comanda_paga_log` é acionado após uma comanda ter seu estado alterado de `FECHADA` para `PAGA`, registrando na tabela de logs, que pode ser visualizada na aba `Logs`, dentro da página de Analytics.
    - Trigger `trg_atualiza_total_comanda_fechada` é acionado após uma comanda ter seu estado alterado de `ABERTA` para `FECHADA`, chamando a função `fnc_calcula_comissao`
    - Os Triggers `trg_check_subordinados_max`, `trg_check_garcom_max_mesas` e `trg_atualiza_total_comanda` não tem as tabelas necessárias implementadas, sendo possível ver sua execução realizando inserções ou alterações diretamente no banco de dados por meio de um terminal ou SGDB

---

### Consultas e Views

1.  Consultas
    - Consultas referentes a Entrega 3 podem ser visualizadas por meio dos filtros nas tabelas Clientes e Reservas, além dos gráficos na página Analytics de `Ocupação por dia`, `Reservas por Mês`, `Horario de Pico`, `Distribuição de tamanho de grupo` e `Distribuição de Clientes por Área`
    - Consultas referentes a Entrega 4 podem ser visualizadas de diversas formas -
    - Consulta `Anti-Join` é visualizada utilizando o filtro `Sem Reserva` na secção de pesquisa da página de Clientes.
    - Consulta `Full Outer Join` é visualizada na tabela `Mesas Completas` presente na aba Views da página Analytics
    - Consulta com `Subconsulta 1` é visualizada na tabela `Clientes com Reservas Maiores que a Média` presente na aba Views da página Analytics
    - Consulta com `Subconsulta 2` é visualizada na tabela `Clientes com Reservas Canceladas` presente na aba Views da página Analytics
2.  Views
    - View `vw_reservas_futuras_completas` é visualizada na tabela `Reservas Abertas Futuras Completas` presente na aba Views da página Analytics
    - View `vw_mesas_ocupadas_completas` é visualizada na tabela `Mesas Ocupadas Completas` presente na aba Views da página Analytics
