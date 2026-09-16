# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Run the server: `node index.js` (listens on port 3000, hardcoded in `index.js`)
- Install dependencies: `npm install`
- There is no test suite configured (`npm test` just exits with an error) and no lint/build step — this is a plain Node/Express app run directly, with no transpilation.

## Architecture

Express 5 REST API with a SQLite database (`better-sqlite3`, synchronous API), organized as routes → controllers → shared db module:

- `index.js` — app entry point; mounts `userRoutes` at `/api/users` and `productRoutes` at `/api/products`.
- `src/routes/*Routes.js` — maps HTTP verb+path to a controller function. No middleware layer (no auth, no validation middleware, no error-handling middleware).
- `src/controllers/*Controller.js` — one file per resource; each exported function handles req/res directly and talks to the db synchronously via `better-sqlite3`'s `.prepare(...).all()/.get()/.run()`. Every handler wraps its body in try/catch and returns `{ error: error.message }` with a 500 on failure — follow this same pattern for new handlers rather than adding a shared error middleware.
- `src/config/db.js` — creates/opens `database.db` (SQLite file in the repo root) and runs `CREATE TABLE IF NOT EXISTS` for `users` and `products` on require. This is the only place schema is defined; there are no migration files — add new tables/columns here.
- `database.db` — the actual SQLite data file, committed at the repo root (not `.gitignore`d).

### Data model

- `users`: `id, name, email (unique)`
- `products`: `id, name, category, price, stock`

### Request handling conventions used throughout

- Controllers build SQL dynamically for optional filters (e.g. `productController.getProducts` conditionally appends `AND` clauses for `?category=` and `?search=` query params) — always via parameterized `?` placeholders, never string-interpolated values, to avoid SQL injection.
- PATCH handlers (`updateUser`, `updateProduct`) do partial updates: only fields present in `req.body` are included in the SQL update, other fields are left unchanged.
- `productController.bulkRestock` (`POST /api/products/bulk-restock`) updates stock for every row in the table at once — this route is registered before the `/:id` routes in `productRoutes.js` matters for GET but not for POST, since `bulk-restock` only collides with the `POST /` route path, not `/:id`.

## API Workflow Routing

For requests involving API documentation, Postman documentation, API testing, API test execution, or the complete API workflow, delegate the request to the `api-orchestrator` agent.

Do not invoke `api-documentation`, `api-testing`, or `api-test-execution` directly when the request is for the complete API workflow. The `api-orchestrator` is responsible for coordinating those stages.
