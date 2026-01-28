-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "lastName" TEXT,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "image" TEXT,
    "displayUsername" TEXT
);
INSERT INTO "new_user" ("createdAt", "displayUsername", "email", "emailVerified", "id", "image", "lastName", "name", "passwordHash", "role", "updatedAt", "username") SELECT "createdAt", "displayUsername", "email", "emailVerified", "id", "image", "lastName", "name", "passwordHash", "role", "updatedAt", "username" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");
CREATE INDEX "user_email_idx" ON "user"("email");
CREATE INDEX "user_username_idx" ON "user"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
