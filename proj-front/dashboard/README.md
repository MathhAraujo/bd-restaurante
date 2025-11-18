# Restaurante Dashboard

Dashboard web para gerenciamento do sistema de restaurante, desenvolvido com React e Vite.

## Funcionalidades

- **Clientes**: CRUD completo de clientes
- **Mesas**: Gerenciamento de mesas e status
- **Comandas**: Gerenciamento de comandas e adição de comissões
- **Reservas**: CRUD completo de reservas com múltiplas opções de busca
- **Analytics**: Visualização interativa de dados com gráficos

## Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Backend Spring Boot rodando em `http://localhost:8080`

## Instalação

1. Instale as dependências:
```bash
npm install
```

## Execução

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O dashboard estará disponível em `http://localhost:5173`

## Build para Produção

Para criar uma build de produção:

```bash
npm run build
```

Os arquivos estarão na pasta `dist/`.

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes reutilizáveis
  ├── pages/         # Páginas principais
  ├── services/      # Serviços de API
  └── App.jsx        # Componente principal
```

## Tecnologias Utilizadas

- React 18
- Vite
- React Router
- Axios
- Recharts (para gráficos)

