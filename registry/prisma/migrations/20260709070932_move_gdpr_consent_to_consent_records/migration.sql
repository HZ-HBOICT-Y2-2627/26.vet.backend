-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "owner_id" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "consent_date" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "consent_records_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Backfill: turn each owner's existing gdpr_consent/gdpr_consent_date into its initial consent record
INSERT INTO "consent_records" ("id", "owner_id", "granted", "consent_date", "created_at")
SELECT
    lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
    "id",
    "gdpr_consent",
    "gdpr_consent_date",
    "created_at"
FROM "owners";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_owners" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "reminder_channel" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_owners" ("address", "created_at", "email", "first_name", "id", "last_name", "phone", "reminder_channel") SELECT "address", "created_at", "email", "first_name", "id", "last_name", "phone", "reminder_channel" FROM "owners";
DROP TABLE "owners";
ALTER TABLE "new_owners" RENAME TO "owners";
CREATE UNIQUE INDEX "owners_email_key" ON "owners"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
