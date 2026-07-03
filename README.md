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
