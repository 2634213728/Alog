-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ApiKey" ("createdAt", "id", "key", "name", "source") SELECT "createdAt", "id", "key", "name", "source" FROM "ApiKey";
DROP TABLE "ApiKey";
ALTER TABLE "new_ApiKey" RENAME TO "ApiKey";
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");
CREATE TABLE "new_Log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'unknown',
    "author" TEXT NOT NULL DEFAULT '',
    "workspace" TEXT NOT NULL DEFAULT '',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apiKeyId" TEXT,
    CONSTRAINT "Log_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Log" ("apiKeyId", "content", "createdAt", "id", "source", "title", "type", "workspace") SELECT "apiKeyId", "content", "createdAt", "id", "source", "title", "type", "workspace" FROM "Log";
DROP TABLE "Log";
ALTER TABLE "new_Log" RENAME TO "Log";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
