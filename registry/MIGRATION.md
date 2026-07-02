# Allegro Migration Summary: PHP to Node.js REST

## Migration Completed

The example domain application has been migrated from a PHP/Maestro framework to a Node.js/Express/Prisma REST API with TypeScript. The project is now named **Allegro**.

---

## What Was Done

### Phase 1: Project Setup

- Initialized Node.js project with TypeScript configuration
- Created `package.json` with all required dependencies
- Set up `tsconfig.json` with strict type checking
- Configured `.env` file for environment variables

### Phase 2: Database Model

- Created Prisma schema (`schema.prisma`) with:
  - Project model
  - Task model with relationships
  - Tag model
  - TaskTag junction table for many-to-many relationships
- Ran Prisma migrations to create SQLite database
- Created seed file with original LOTR sample data

### Phase 3: REST API

- Set up Express.js with CORS middleware
- Created route files per resource (`src/routes/`)
- Implemented `asyncHandler` wrapper and central error handler (`src/middleware/errorHandling.ts`)
- REST endpoints for tasks, projects, and tags

### Phase 4: Business Logic

- Implemented `TaskService` with:
  - `getAllTasks` with filtering by projectId, tagId, priority, status
  - `getTaskById` with full relationships
  - `createTask`, `updateTask`, `deleteTask`
  - Tag management: `addTagToTask`, `removeTagFromTask`
- Implemented `ProjectService` with full CRUD
- Implemented `TagService` with full CRUD

### Phase 5: Input Validation

- Created Zod schemas for all input types:
  - CreateTaskInput, UpdateTaskInput
  - CreateProjectInput, UpdateProjectInput
  - CreateTagInput, UpdateTagInput
- Validation runs in routes before reaching the service layer
- ZodError is caught centrally and returned as HTTP 400

### Phase 6: Documentation

- Updated README with full API reference and developer guide
- Added sequence diagrams for request and error flows
- Created `test-api.js` for manual REST testing

---

## Project Structure

```
src/
├── server.ts                  # App setup: middleware, route mounting, error handler
├── lib/
│   └── prisma.ts              # Shared Prisma client (SQLite adapter)
├── middleware/
│   └── errorHandling.ts       # asyncHandler wrapper + central error handler
├── routes/
│   ├── projects.ts
│   ├── tasks.ts
│   └── tags.ts
├── services/
│   ├── ProjectService.ts
│   ├── TaskService.ts
│   ├── TagService.ts
│   └── index.ts
├── types/
│   └── index.ts
└── validation/
    └── schemas.ts

prisma/
├── schema.prisma
├── seed.ts
└── migrations/

generated/
└── prisma/                    # Generated Prisma client (do not edit)
```

---

## Key Architectural Changes

### PHP Controllers → Express Routes

| PHP | Allegro |
| --- | --- |
| GET /tasks | GET /tasks |
| GET /tasks/:id | GET /tasks/:id |
| POST /tasks | POST /tasks |
| POST /tasks/:id/edit | PUT /tasks/:id |
| POST /tasks/:id/delete | DELETE /tasks/:id |

### Repository Pattern → Prisma ORM

```
PHP:     Repository → PDO → Database
Allegro: Service → Prisma Client → Database
```

### Manual Validation → Zod Schemas

```
PHP:     Manual checks in controller
Allegro: Zod schemas parsed in route, ZodError caught centrally
```

### Error Handling → Central Middleware

```
PHP:     Per-controller try/catch
Allegro: asyncHandler forwards all errors to a single errorHandler middleware
```

---

## Quick Start

```bash
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Server available at <http://localhost:4000>.

---

## Dependencies

### Production

- `express` (v4) — web framework
- `@prisma/client` (v7) — database ORM
- `@prisma/adapter-better-sqlite3` (v7) — SQLite driver
- `better-sqlite3` — SQLite native driver
- `zod` — runtime validation
- `cors` — CORS middleware
- `dotenv` — environment variables

### Development

- `prisma` (v7) — Prisma CLI
- `typescript` — TypeScript compiler
- `ts-node-dev` — hot reload dev runner

---

## Features

- Full CRUD for Tasks, Projects, and Tags
- Many-to-many Task-Tag relationships
- Task filtering by project, tag, priority, and status
- Task priority (0–3), status (0–4), and progress (0–100) tracking
- Input validation with Zod
- Central error handling middleware
- Type-safe TypeScript throughout
- Seeded sample data (15 tasks, 3 projects, 4 tags)

---

## Security

- Input validation on all write endpoints
- Parameterized queries via Prisma (SQL injection safe)
- CORS configured for local development

---

## Troubleshooting

**Port already in use** — change `PORT` in `.env`

**Database issues:**
```bash
rm prisma/database.sqlite
npm run prisma:migrate
npm run prisma:seed
```

**TypeScript errors:**
```bash
npm run type-check
```

---

## Migration Checklist

- [x] PHP/Maestro → Node.js/Express
- [x] REST controllers → Express Router (per-resource route files)
- [x] PDO Repository Pattern → Prisma ORM (v7)
- [x] Manual validation → Zod schemas
- [x] Per-route try/catch → central error handler middleware
- [x] Twig templates → removed (API-only)
- [x] Database structure preserved
- [x] Sample data migrated
- [x] TypeScript type safety
- [x] Documentation updated

---

**Original Authors**: Frans Blauw, Valeria Stamenova
