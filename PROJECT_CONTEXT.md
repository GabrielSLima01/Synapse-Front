# Projeto Fenearte Acessível - Contexto do Projeto

## Visão Geral

Este projeto é uma aplicação web Front-end desenvolvida para a **FENEARTE**, focada em acessibilidade e facilidade de uso. Atualmente, ele opera como um **stand-alone frontend** (apenas interface), utilizando dados mockados (fictícios) em memória para simular o funcionamento de backend.

A aplicação foi projetada para ajudar visitantes a navegar na feira e encontrar informações importantes.

## Stack Tecnológica

- **Framework**: [React](https://react.dev/) com [Vite](https://vitejs.dev/) (Performance e build rápido)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/) (Tipagem estática e segurança)
- **Estilização**:
  - [Tailwind CSS](https://tailwindcss.com/) (Estilização utilitária)
  - [Shadcn UI](https://ui.shadcn.com/) (Componentes de UI reutilizáveis e acessíveis)
- **Rotas**: [React Router DOM](https://reactrouter.com/)
- **Gerenciamento de Estado**: React Context API (`AuthContext`, `LanguageContext`)
- **Deploy/Build**: Single Page Application (SPA)

## Estrutura de Pastas (`src/`)

- `pages/`: Componentes que representam telas inteiras (rotas).
- `components/`: Componentes reutilizáveis (botões, headers, cards).
- `contexts/`: Gerenciamento de estado global.
  - `AuthContext.tsx`: Simula sistema de login/cadastro e permissões de admin.
  - `LanguageContext.tsx`: Gerencia tradução (PT/EN/ES).
- `hooks/`: Hooks customizados (ex: `use-toast`).
- `lib/`: Utilitários (ex: `utils.ts` para classes Tailwind).

## Funcionalidades Principais

### 1. Autenticação (Mock)

- **Login/Cadastro**: Interface funcional que simula login.
- **Admin**: Usuário `admin@fenearte.com` (senha: `admin123`) tem acesso a painel exclusivo.
- **Persistência**: Dados de sessão são voláteis (reseta ao recarregar a página, exceto lógica de localStorage se implementada).

### 2. Catálogo de Stands

- **Listagem**: Exibe 500 stands gerados via código.
- **Busca**: Filtragem em tempo real por nome ou número do stand.
- **Categorias**: Filtros por tipo de artesanato (Cerâmica, Têxtil, etc.).
- **Mapa Interativo**: Mini-mapa visual indicando localização dos stands.

### 3. Internacionalização

- Suporte a múltiplos idiomas (Português, Inglês, Espanhol) via `LanguageContext`.
- Seleção inicial na rota `/language`.

### 4. Acessibilidade

- Design focado em contraste e legibilidade.
- Componentes semanticamente corretos.

## Rotas Principais

- `/`: Redirecionamento inicial.
- `/language`: Seleção de idioma.
- `/home`: Menu principal.
- `/stands`: Lista e busca de expositores.
- `/map`: Mapa da feira.
- `/login`: Acesso de usuário/admin.
- `/admin`: Painel de controle (protegido).

## Status Atual

- **Backend API**: Integrado com API Node.js/Fastify/Prisma (`fenearte-acess-api`).
- **Autenticação**: Via JWT (`POST /sessions`). Token salvo no LocalStorage.
- **Dados**:
  - `GET /stands`: Lista todos os stands.
  - `GET /categories`: Lista categorias dinâmicas.
  - CRUD via API (Edição de stand implementada para Admin).
- **Internacionalização**: Interface consome campos `descriptionPT`, `EN`, `ES` do backend.

## Como Executar

### 1. Backend (`fenearte-acess-api`)

Certifique-se de que o backend está rodando na porta 3333.

```bash
cd ../fenearte-acess-api
npm install
npx prisma migrate dev
npm run dev
```

### 2. Frontend (`fenearte-acess-front`)

```bash
npm install
npm run dev
```

O servidor iniciará em `http://localhost:8080`.
