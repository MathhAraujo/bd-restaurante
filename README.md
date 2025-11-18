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
