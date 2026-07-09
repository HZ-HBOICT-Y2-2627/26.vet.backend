# week_5_start — Branch Notes

Improvements made on this branch to the `registry` API and the `api-gateway-service` in front of it (see [registry/README.md](registry/README.md) and [api-gateway-service/README.md](api-gateway-service/README.md) for full project docs).

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

## 8. GDPR consent moved to its own history table

`gdprConsent` / `gdprConsentDate` used to live as two columns directly on `Owner`. Since a consent decision can be granted, withdrawn, and re-granted over time, storing it as columns meant every update overwrote the previous decision — no audit trail of what an owner had actually agreed to, or when. Consent is now tracked in a new `ConsentRecord` table, one-to-many from `Owner`, so each decision is an immutable row instead of a value that gets clobbered.

`POST /owners` still accepts `gdprConsent` / `gdprConsentDate` in the request body — it now creates the owner's first `ConsentRecord`. `GET /owners` and `GET /owners/:id` return a `consentRecords` array (newest first) instead of the old top-level `gdprConsent` fields:

```http
GET /owners
→ {
  "data": [
    {
      "id": "...",
      "firstName": "Anke",
      ...
      "consentRecords": [
        { "id": "...", "ownerId": "...", "granted": true, "consentDate": "2024-03-01T00:00:00.000Z", "createdAt": "..." }
      ]
    }
  ]
}
```

Existing owners' `gdpr_consent` / `gdpr_consent_date` values were backfilled into one `ConsentRecord` each as part of the migration, so no consent history was lost.

- [registry/prisma/schema.prisma](registry/prisma/schema.prisma) — new `ConsentRecord` model, fields removed from `Owner`
- [registry/prisma/migrations/20260709070932_move_gdpr_consent_to_consent_records](registry/prisma/migrations/20260709070932_move_gdpr_consent_to_consent_records) — schema change + data backfill
- [registry/src/services/OwnerService.ts](registry/src/services/OwnerService.ts)
- [registry/src/types/index.ts](registry/src/types/index.ts)
- [registry/prisma/seed.ts](registry/prisma/seed.ts)

## 9. API gateway proxies all registry CRUD routes

The gateway previously only forwarded `/animals`. It now proxies every registry route — `/owners`, `/animals`, and `/vaccinations` — covering the full CRUD surface (`GET`/`POST`/`PATCH`/`DELETE`) added in sections 1–8. It's a pass-through: the gateway doesn't re-implement any route or validation logic, it just forwards matching requests to the registry service and streams back whatever it returns.

```http
POST /animals          (via gateway, http://localhost:3000)
→ proxied to registry   http://localhost:4000/animals
→ 201 { "data": { "id": "...", ... } }
```

Fixing this also surfaced a real bug: `server.ts` calls `express.json()` before the proxy (so the gateway's own `/health` route and future local logic can read a JSON body), which drains the request stream. Without countermeasures, any proxied `POST`/`PATCH` would hang forever waiting for a body that was already consumed. The proxy now re-serializes the parsed body via `http-proxy-middleware`'s `fixRequestBody` helper, wired into `on.proxyReq`.

- [api-gateway-service/src/routes/registry.ts](api-gateway-service/src/routes/registry.ts) — `REGISTRY_PATHS` list, `fixRequestBody` wiring
- [api-gateway-service/src/server.ts](api-gateway-service/src/server.ts)

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

---

## How to: Extract a field into a related table (with data backfill)

Same idea as above, but for a bigger reshape: moving one or more columns off a table into a new related table, without losing the data already in those columns. Worked example below is section 8, splitting `Owner.gdprConsent` / `Owner.gdprConsentDate` out into `ConsentRecord`.

1. **Edit the schema**: remove the field(s) from the source model, add the new model with a relation back to it.

   ```prisma
   model Owner {
     // ...existing fields
     consentRecords ConsentRecord[]
   }

   model ConsentRecord {
     id          String   @id @default(uuid())
     ownerId     String   @map("owner_id")
     granted     Boolean
     consentDate DateTime @map("consent_date")
     createdAt   DateTime @default(now()) @map("created_at")
     owner       Owner    @relation(fields: [ownerId], references: [id], onDelete: Cascade)
   }
   ```

2. **Generate the migration SQL without applying it.** `prisma migrate dev` refuses to run non-interactively when it detects a data-losing change (dropping a non-empty column), so generate the raw SQL instead:

   ```bash
   npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
   ```

3. **Hand-edit the migration to backfill data** before the old column is dropped. Save the output into a new folder under `prisma/migrations/<timestamp>_<name>/migration.sql`, and insert a data-migration step between the `CREATE TABLE` for the new model and the `RedefineTables` block that rebuilds the source table:

   ```sql
   -- Backfill: turn each owner's existing gdpr_consent/gdpr_consent_date into its initial consent record
   INSERT INTO "consent_records" ("id", "owner_id", "granted", "consent_date", "created_at")
   SELECT
       lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
       "id", "gdpr_consent", "gdpr_consent_date", "created_at"
   FROM "owners";
   ```

   SQLite has no built-in UUID generator, hence the `randomblob`/`hex` expression to produce one per row.

4. **Apply it and regenerate the client**:

   ```bash
   npx prisma migrate deploy   # applies pending migrations, non-interactive
   npx prisma generate
   ```

5. **Update the application layer**: hand-written types ([registry/src/types/index.ts](registry/src/types/index.ts)), the service's `create`/`getAll`/`getById` methods to nest-create and `include` the new relation ([registry/src/services/OwnerService.ts](registry/src/services/OwnerService.ts)), and the seed script ([registry/prisma/seed.ts](registry/prisma/seed.ts)).

6. **Verify**: `npx tsc --noEmit`, re-run `npm run prisma:seed`, then hit the affected routes (`GET`/`POST /owners`) against the dev server and confirm the backfilled and newly created records show up correctly under the new relation.
