# 🚀 Whaileys Frontend

Interface web moderna para gerenciamento de sessões WhatsApp da API Whaileys.


![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-blue)
![tRPC](https://img.shields.io/badge/tRPC-11-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

---

## 📋 Índice

- [Sobre](#sobre)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Deploy](#deploy)
- [Configuração](#configuração)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Contribuindo](#contribuindo)

---

## 📖 Sobre

O **Whaileys Frontend** é uma aplicação web moderna desenvolvida em React + TypeScript que fornece uma interface intuitiva para gerenciar sessões WhatsApp através da API Whaileys.

**Características principais:**

- Interface responsiva e moderna com Tailwind CSS
- Autenticação segura via Manus OAuth
- Listagem em tempo real de sessões WhatsApp
- Criação e exclusão de sessões
- Monitoramento de status (conectado/desconectado)
- Dashboard com estatísticas
- Deploy automatizado via GitHub Actions

---

## ✨ Funcionalidades

### 🔐 Autenticação
- Login via Manus OAuth
- Gerenciamento automático de sessões
- Controle de acesso seguro

### 📱 Gerenciamento de Sessões WhatsApp
- ✅ Listagem completa de sessões
- ✅ Visualização de detalhes (ID, nome, número, status)
- ✅ Criação de novas sessões
- ✅ Exclusão de sessões
- ✅ Indicadores de status em tempo real
- ✅ Filtros e busca

### 📊 Dashboard
- Estatísticas gerais do sistema
- Total de sessões cadastradas
- Sessões conectadas
- Status da API Whaileys

### 👥 Usuários
- Autenticação via OAuth
- Controle de acesso

---

## 🛠️ Tecnologias

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **Vite** - Build tool
- **Wouter** - Roteamento
- **shadcn/ui** - Componentes UI
- **Lucide React** - Ícones

### Backend
- **Express 4** - Servidor HTTP
- **tRPC 11** - Type-safe API
- **Drizzle ORM** - ORM para PostgreSQL
- **Zod** - Validação de schemas

### Banco de Dados
- **PostgreSQL 15** - Banco de dados principal

### DevOps
- **Docker** - Containerização
- **GitHub Actions** - CI/CD
- **Portainer** - Gerenciamento de containers

---

## 📦 Pré-requisitos

- **Node.js** 20+
- **pnpm** 8+
- **PostgreSQL** 15+
- **Docker** (para deploy)
- **Git**

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/developexi/whaileysFront.git
cd whaileysFront
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://whaileys_user:senha@localhost:5432/whaileys_front_db"

# API Whaileys
WHAILEYS_API_URL="https://whaileysapi.exisistemas.com.br"
WHAILEYS_API_TOKEN="seu_token_aqui"

# Manus OAuth (fornecido pela plataforma)
JWT_SECRET="seu_secret"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://login.manus.im"
VITE_APP_ID="seu_app_id"

# App Config
VITE_APP_TITLE="Whaileys Frontend"
VITE_APP_LOGO="/logo.svg"
```

### 4. Configure o banco de dados

Execute o script SQL para criar o banco:

```bash
psql -U postgres -f whaileys-front-db-setup.sql
```

Ou crie manualmente:

```sql
CREATE DATABASE whaileys_front_db;
GRANT ALL PRIVILEGES ON DATABASE whaileys_front_db TO whaileys_user;
```

### 5. Execute as migrations

```bash
pnpm db:push
```

### 6. Inicie o servidor de desenvolvimento

```bash
pnpm dev
```

Acesse: http://localhost:3000

---

## 🐳 Deploy

### Deploy com Docker

#### 1. Build da imagem

```bash
docker build -t whaileys-front .
```

#### 2. Execute o container

```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e WHAILEYS_API_URL="https://whaileysapi.exisistemas.com.br" \
  -e WHAILEYS_API_TOKEN="seu_token" \
  --name whaileys-front \
  whaileys-front
```

### Deploy com Portainer

#### 1. Configurar Secrets no GitHub

Adicione os secrets no repositório GitHub:

- `DOCKER_USERNAME` - Usuário do Docker Hub
- `DOCKER_PASSWORD` - Senha/Token do Docker Hub

#### 2. Push para GitHub

```bash
git add .
git commit -m "Deploy inicial"
git push origin main
```

O GitHub Actions irá:
- Fazer build da imagem
- Push para Docker Hub (`developexi/whaileys-front:latest`)

#### 3. Deploy no Portainer

1. Acesse Portainer
2. Vá em **Stacks** → **Add Stack**
3. Nome: `whaileys-frontend`
4. Cole o conteúdo de `whaileys-front-stack.yml`
5. **Importante:** Edite as variáveis de ambiente:
   - `WHAILEYS_API_TOKEN` - Token da API Whaileys
   - `DATABASE_URL` - String de conexão PostgreSQL
6. Clique em **Deploy the stack**

#### 4. Configurar DNS

Aponte o domínio `whaileys.exisistemas.com.br` para o servidor.

---

## ⚙️ Configuração

### Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `WHAILEYS_API_URL` | URL base da API Whaileys | `https://whaileysapi.exisistemas.com.br` |
| `WHAILEYS_API_TOKEN` | Token de autenticação da API | `Bearer token123...` |
| `JWT_SECRET` | Secret para JWT | Gerado automaticamente |
| `OAUTH_SERVER_URL` | URL do servidor OAuth | `https://api.manus.im` |
| `VITE_APP_TITLE` | Título da aplicação | `Whaileys Frontend` |
| `VITE_APP_LOGO` | Logo da aplicação | `/logo.svg` |

### Banco de Dados PostgreSQL

O projeto usa **PostgreSQL 15** com **Drizzle ORM**.

**Schema principal:**

- `users` - Usuários autenticados
- `api_config` - Configurações da API

Para aplicar mudanças no schema:

```bash
pnpm db:push
```

---

## 📱 Uso

### Acessando o Sistema

1. Acesse `https://whaileys.exisistemas.com.br`
2. Clique em **Sign in**
3. Faça login com sua conta Manus

### Gerenciando Sessões

#### Criar Nova Sessão

1. Vá em **Sessões WhatsApp**
2. Clique em **Nova Sessão**
3. Digite um ID único (ex: `sessao-001`)
4. Clique em **Criar Sessão**

#### Deletar Sessão

1. Na lista de sessões, clique no ícone de **lixeira**
2. Confirme a exclusão

### Monitorando Status

O dashboard mostra:
- Total de sessões cadastradas
- Sessões conectadas
- Status da API Whaileys

---

## 📂 Estrutura do Projeto

```
whaileys-front/
├── client/                  # Frontend React
│   ├── public/             # Arquivos estáticos
│   └── src/
│       ├── components/     # Componentes React
│       │   ├── ui/        # Componentes shadcn/ui
│       │   └── DashboardLayout.tsx
│       ├── pages/         # Páginas
│       │   ├── Home.tsx
│       │   ├── Sessions.tsx
│       │   └── Users.tsx
│       ├── lib/           # Utilitários
│       │   └── trpc.ts    # Cliente tRPC
│       └── App.tsx        # Rotas
│
├── server/                 # Backend Express + tRPC
│   ├── _core/            # Core do framework
│   ├── db.ts             # Helpers do banco
│   ├── routers.ts        # Routers tRPC
│   └── whaileys-api.ts   # Cliente API Whaileys
│
├── drizzle/               # Schema e migrations
│   └── schema.ts         # Schema do banco
│
├── shared/                # Código compartilhado
│
├── Dockerfile            # Docker build
├── .dockerignore        # Arquivos ignorados no build
├── .github/
│   └── workflows/
│       └── docker-build.yml  # CI/CD
│
├── whaileys-front-stack.yml  # Stack Portainer
├── whaileys-front-db-setup.sql  # Setup DB
│
└── README.md            # Esta documentação
```

---

## 🔄 Workflow de Desenvolvimento

### 1. Criar Feature

```bash
git checkout -b feature/nova-funcionalidade
```

### 2. Desenvolver

```bash
pnpm dev  # Inicia dev server
```

### 3. Testar

```bash
pnpm build  # Testa build de produção
```

### 4. Commit e Push

```bash
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/nova-funcionalidade
```

### 5. Merge para Main

Após aprovação, merge para `main` dispara deploy automático.

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto é privado e pertence à **Exi Sistemas**.

---

## 👥 Autores

- **Exi Sistemas** - Desenvolvimento completo

---

## 📞 Suporte

Para suporte, entre em contato:

- **Email:** contato@exisistemas.com.br
- **Website:** https://exisistemas.com.br

---

## 🎯 Roadmap

- [x] Sistema de autenticação
- [x] Listagem de sessões
- [x] Criação/exclusão de sessões
- [x] Dashboard com estatísticas
- [x] Deploy automatizado
- [ ] Gerenciamento avançado de usuários
- [ ] Logs de atividades
- [ ] Notificações em tempo real
- [ ] Exportação de relatórios

---

**Desenvolvido com ❤️ por Exi Sistemas**
