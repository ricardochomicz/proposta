# Sistema de Gestão de Propostas

Este projeto é um sistema completo para gerenciamento de propostas, produtos e usuários, desenvolvido com uma arquitetura moderna separada em **Frontend** e **Backend**.

## 🚀 Tecnologias Utilizadas

### Frontend

- **React 19** (com Vite)
- **TypeScript** para tipagem estática e segurança
- **Bootstrap 5** para estilização e componentes de UI
- **Axios** para comunicação com a API
- **React Hooks** para gerenciamento de estado

### Backend

- **Node.js** com **Express 5**
- **SQLite3** como banco de dados (leve e sem necessidade de configuração complexa)
- **Arquitetura em Camadas** (Controllers, Services, Repositories)
- **ES Modules** (import/export)

### Infraestrutura

- **Docker** e **Docker Compose** para orquestração dos ambientes

---

## 📂 Estrutura do Projeto

O projeto está organizado em dois diretórios principais:

```
/
├── backend/            # API RESTful
│   ├── src/
│   │   ├── controllers/ # Controladores das rotas (Users, Products, Proposals)
│   │   ├── services/    # Regras de negócio
│   │   ├── repositories/# Acesso ao banco de dados
│   │   └── database/    # Configuração do SQLite
│   ├── database.sqlite  # Arquivo do banco de dados
│   └── index.js         # Ponto de entrada da API
│
├── frontend/           # Aplicação Web React
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis (ex: Toast)
│   │   ├── services/    # Configuração da API e serviços
│   │   ├── users/       # Módulo de Usuários
│   │   ├── products/    # Módulo de Produtos
│   │   └── proposals/   # Módulo de Propostas
│   └── vite.config.ts   # Configuração do Vite
│
└── docker-compose.yml   # Orquestração dos containers
```

---

## 🛠️ Como Executar

Você pode rodar o projeto de duas formas: usando **Docker** (recomendado) ou **manualmente**.

### Opção 1: Usando Docker (Recomendado)

Certifique-se de ter o Docker e o Docker Compose instalados.

1. Na raiz do projeto, execute:

   ```bash
   docker-compose up --build
   ```

2. Acesse a aplicação:
   - **Frontend:** http://localhost:5173
   - **Backend (API):** http://localhost:3001

### Opção 2: Manualmente

#### 1. Configurando o Backend

```bash
cd backend
npm install
npm run dev
```

O servidor iniciará em `http://localhost:3001`.

#### 2. Configurando o Frontend

Em um novo terminal:

```bash
cd frontend
npm install
npm run dev
```

A aplicação abrirá em `http://localhost:5173`.

---

## ✨ Funcionalidades

### 1. Gestão de Usuários

- Listagem de usuários cadastrados.
- Cadastro de novos usuários (Nome, Email, Telefone).
- Visualização de detalhes.

### 2. Gestão de Produtos

- Catálogo de produtos disponíveis.
- Adição de novos produtos com nome e valor.
- Exclusão de produtos.

### 3. Gestão de Propostas

- Criação e acompanhamento de propostas comerciais.
- Associação de produtos e usuários às propostas.

---

## 🔧 Detalhes Técnicos

- **Tratamento de Erros:** O frontend possui um sistema centralizado de tratamento de erros via interceptors do Axios, exibindo notificações amigáveis (Toasts) ao usuário em caso de falhas na API.
- **Persistência:** Os dados são salvos localmente no arquivo `backend/database.sqlite`. Para resetar o banco, basta deletar este arquivo e reiniciar o backend (as tabelas serão recriadas automaticamente).

---

## 📝 Licença

Este projeto é de uso livre para fins de estudo e desenvolvimento.
