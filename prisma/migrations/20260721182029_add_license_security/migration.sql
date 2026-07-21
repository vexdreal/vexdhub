-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Key" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceId" TEXT,
    "lastUsed" DATETIME,
    "useCount" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Key" ("active", "createdAt", "deviceId", "expiresAt", "id", "key") SELECT "active", "createdAt", "deviceId", "expiresAt", "id", "key" FROM "Key";
DROP TABLE "Key";
ALTER TABLE "new_Key" RENAME TO "Key";
CREATE UNIQUE INDEX "Key_key_key" ON "Key"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
