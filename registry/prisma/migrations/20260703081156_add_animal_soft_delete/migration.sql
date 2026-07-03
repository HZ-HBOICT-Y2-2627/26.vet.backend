-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_animals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "date_of_birth" DATETIME NOT NULL,
    "sex" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" DATETIME,
    CONSTRAINT "animals_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_animals" ("breed", "created_at", "date_of_birth", "id", "name", "owner_id", "sex", "species") SELECT "breed", "created_at", "date_of_birth", "id", "name", "owner_id", "sex", "species" FROM "animals";
DROP TABLE "animals";
ALTER TABLE "new_animals" RENAME TO "animals";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
