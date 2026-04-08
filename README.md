# BookQuest 📚

Plataforma de rastreamento de leituras com sistema de gamificação. Acompanhe seus livros, ganhe XP e suba de nível conforme você lê.

![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=flat-square&logo=next.js)
![Express](https://img.shields.io/badge/Express-4.21-lightgrey?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-8.9-green?style=flat-square&logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)

## Funcionalidades

- **Estante de livros** — organize seus livros por status: Quero ler, Lendo e Lido
- **Gamificação** — ganhe 100 XP por livro lido e suba de nível
- **Estatísticas** — visualize gêneros mais lidos, meses mais produtivos e média de notas
- **Filtros** — busque por título, autor, gênero (select), status e período (intervalo de datas)
- **Releituras** — marque livros que você leu mais de uma vez
- **Autocomplete de livros e autores** — busca integrada com a Open Library ao adicionar/editar livros
- **Gêneros predefinidos** — select com categorias literárias em vez de texto livre
- **Sidebar responsiva** — navegação lateral colapsável com ícones no desktop; menu hambúrguer no mobile
- **Bottom sheet no mobile** — formulário de adicionar/editar livros abre como sheet deslizante em telas pequenas
- **Responsivo** — layout e inputs adaptados para desktop e mobile

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Express.js, Node.js (ES Modules) |
| Banco de dados | MongoDB (Mongoose) |
| Autenticação | JWT + x-api-key estática |
| Deploy | Vercel (frontend + backend) + MongoDB Atlas |

## Estrutura do projeto

```
bookquest/
├── backend/
│   ├── config/         # Configurações (DB, Swagger)
│   ├── middleware/     # Autenticação JWT e API Key
│   ├── models/         # Schemas Mongoose (User, Book)
│   ├── routes/         # auth, books, profile, stats
│   └── server.js
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── components/   # AppSidebar, BookTable, BookForm, BookFormModal
│       │   │                 # MobileHeader, LevelBar
│       │   ├── dashboard/
│       │   ├── login/
│       │   ├── register/
│       │   └── stats/
│       ├── components/ui/    # shadcn/ui (sidebar, drawer, date-range-picker…)
│       ├── hooks/            # use-mobile
│       └── lib/              # constants (GENRE_OPTIONS, STATUS_LABELS)
└── docker-compose.yml
```

## Rodando localmente

### Pré-requisitos

- Node.js 20+
- Docker (para MongoDB local)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # preencha as variáveis
npm run dev            # porta 5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # porta 3000
```

### Com Docker

```bash
docker compose up -d
```

### Variáveis de ambiente

**backend/.env**
```env
MONGODB_URI=mongodb://localhost:27017/bookquest
JWT_SECRET=sua-chave-secreta
API_KEY=sua-api-key
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## API

A documentação completa está disponível em `/api-docs` (Swagger UI).

### Autenticação

Todas as rotas protegidas aceitam dois métodos:

**Bearer Token (JWT)**
```
Authorization: Bearer <token>
```

**API Key estática**
```
x-api-key: <chave>
x-user-id: <id do usuário>
```

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastro de usuário |
| POST | `/api/auth/login` | Login |
| GET | `/api/books` | Lista livros do usuário |
| POST | `/api/books` | Adiciona livro |
| PUT | `/api/books/:id` | Atualiza livro |
| DELETE | `/api/books/:id` | Remove livro |
| GET | `/api/profile` | Perfil com XP e nível |
| GET | `/api/stats` | Estatísticas de leitura |

## Gamificação

- **+100 XP** ao marcar um livro como "Lido"
- **-100 XP** ao reverter o status para outro
- Fórmula de nível: `floor((1 + √(1 + 8·xp/100)) / 2)`

## Deploy

- **Frontend**: [bookquest-frontend.vercel.app](https://bookquest-frontend.vercel.app)
- **Backend**: [bookquest-orcin.vercel.app](https://bookquest-orcin.vercel.app)
- **Banco**: MongoDB Atlas (M0 Free)
