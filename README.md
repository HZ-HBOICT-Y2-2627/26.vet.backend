# week_3_start — Branch Notes

Improvements made on this branch to the `registry` API (see [registry/README.md](registry/README.md) for full project docs).

## 1. Filter animals by species

`GET /animals` now accepts an optional `species` query parameter.

```http
GET /animals?species=RABBIT
```

Returns only animals matching the given species. Valid values: `DOG`, `CAT`, `RABBIT`, `GUINEA_PIG`, `EXOTIC`. An unknown value returns `400 VALIDATION_ERROR` with the list of accepted species.

- [registry/src/routes/animals.ts](registry/src/routes/animals.ts)
- [registry/src/services/AnimalService.ts](registry/src/services/AnimalService.ts)

## 2. Request logging middleware

Every incoming request is now logged to the console with its method, URL, and the client's `User-Agent` (browser).

```
GET /animals?species=RABBIT - Mozilla/5.0 ...
```

- [registry/src/middleware/requestLogger.ts](registry/src/middleware/requestLogger.ts)
- wired into [registry/src/server.ts](registry/src/server.ts)

## 3. Vaccinations endpoint

New `GET /vaccinations` route returning every vaccination record in the database.

```http
GET /vaccinations
→ { "data": [...], "meta": { "count": 8 } }
```

- [registry/src/routes/vaccinations.ts](registry/src/routes/vaccinations.ts)
- [registry/src/services/VaccinationService.ts](registry/src/services/VaccinationService.ts)

## 4. Create owner endpoint

New `POST /owners` route to create a new owner, validated with Zod.

```http
POST /owners
Content-Type: application/json

{
  "firstName": "Jan",
  "lastName": "de Vries",
  "email": "jan.devries@example.com",
  "phone": "+31611112222",
  "address": "Dorpsstraat 1, 1000 AA Testdorp",
  "reminderChannel": "SMS",
  "gdprConsent": true,
  "gdprConsentDate": "2026-07-03"
}
→ 201 { "data": { "id": "...", ... } }
```

Invalid or missing fields (e.g. a malformed email) return `400 VALIDATION_ERROR`.

- [registry/src/routes/owners.ts](registry/src/routes/owners.ts)
- [registry/src/services/OwnerService.ts](registry/src/services/OwnerService.ts)
- [registry/src/validation/schemas.ts](registry/src/validation/schemas.ts)

## 5. Create animal endpoint

New `POST /animals` route to create a new animal for an existing owner, validated with Zod. Returns `404 NOT_FOUND` if `ownerId` doesn't match an existing owner.

```http
POST /animals
Content-Type: application/json

{
  "ownerId": "8407292b-a54f-4375-91fe-748c015b9bf5",
  "name": "Milo",
  "species": "CAT",
  "breed": "Siamese",
  "dateOfBirth": "2022-01-15",
  "sex": "MALE"
}
→ 201 { "data": { "id": "...", ... } }
```

Invalid or missing fields return `400 VALIDATION_ERROR`.

- [registry/src/routes/animals.ts](registry/src/routes/animals.ts)
- [registry/src/services/AnimalService.ts](registry/src/services/AnimalService.ts)
- [registry/src/validation/schemas.ts](registry/src/validation/schemas.ts)

## 6. Update animal endpoint

New `PATCH /animals/:id` route to partially update an existing animal. Any subset of `ownerId`, `name`, `species`, `breed`, `dateOfBirth`, `sex` may be sent. Returns `404 NOT_FOUND` if the animal doesn't exist, or if a given `ownerId` doesn't match an existing owner.

```http
PATCH /animals/6877b168-d26e-4fcf-9e20-7de5cfa8c4a5
Content-Type: application/json

{
  "breed": "Updated Breed",
  "name": "UpdatedName"
}
→ 200 { "data": { "id": "...", ... } }
```

Invalid fields return `400 VALIDATION_ERROR`.

- [registry/src/routes/animals.ts](registry/src/routes/animals.ts)
- [registry/src/services/AnimalService.ts](registry/src/services/AnimalService.ts)
- [registry/src/validation/schemas.ts](registry/src/validation/schemas.ts)

## 7. Delete animal endpoint (soft delete)

New `DELETE /animals/:id` route. Animals are never hard-deleted — the row is kept and marked with `deleted: true` and a `deletedAt` timestamp instead, preserving history (owner, patient identifier, vaccinations). Soft-deleted animals are excluded from `GET /animals`, `GET /animals/:id`, and `PATCH /animals/:id` (all treated as `404 NOT_FOUND`).

```http
DELETE /animals/6877b168-d26e-4fcf-9e20-7de5cfa8c4a5
→ 200 { "data": { "id": "...", "deleted": true, "deletedAt": "2026-07-03T08:12:54.806Z", ... } }
```

Returns `404 NOT_FOUND` if the animal doesn't exist or was already deleted.

- [registry/prisma/schema.prisma](registry/prisma/schema.prisma) — `deleted` / `deletedAt` fields on `Animal`
- [registry/src/routes/animals.ts](registry/src/routes/animals.ts)
- [registry/src/services/AnimalService.ts](registry/src/services/AnimalService.ts)

---

## How to: Update an existing database table with Prisma

Steps to change a table's shape (add/remove/rename a column, change a type, etc.) and get that change working end-to-end in the API. Worked example below is the `deleted` / `deletedAt` columns added to `Animal` in section 7.

1. **Edit the model** in [registry/prisma/schema.prisma](registry/prisma/schema.prisma). This is the single source of truth for the database shape.

   ```prisma
   model Animal {
     // ...existing fields
     deleted   Boolean   @default(false)
     deletedAt DateTime? @map("deleted_at")
   }
   ```

2. **Create and apply a migration** from the `registry/` folder:

   ```bash
   npx prisma migrate dev --name add_animal_soft_delete
   ```

   This writes a new SQL file under `prisma/migrations/`, applies it to the local SQLite database, and — as part of the same command — regenerates the Prisma client.

3. **Regenerate the client explicitly if needed.** `migrate dev` normally does this automatically, but if TypeScript still complains that a field "does not exist" (e.g. because a dev server was already running), run it by hand:

   ```bash
   npx prisma generate
   ```

   This rewrites the generated, type-safe client in `src/generated/prisma/` — do not edit those files directly, they're overwritten on every generate.

4. **Update the hand-written types** in [registry/src/types/index.ts](registry/src/types/index.ts) to match, so the rest of the app gets the new field with proper typing:

   ```ts
   export interface Animal {
     // ...
     deleted: boolean;
     deletedAt: Date | null;
   }
   ```

5. **Use the new field in the service/route layer** — e.g. include it in a `where` filter, a Zod schema in [registry/src/validation/schemas.ts](registry/src/validation/schemas.ts), or the `data` object passed to `prisma.<model>.create()` / `.update()`.

6. **Verify**: `npx tsc --noEmit` to catch any place still missing the field, then start the dev server and hit the affected routes to confirm the new column round-trips correctly.
