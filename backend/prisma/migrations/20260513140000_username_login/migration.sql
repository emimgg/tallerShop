ALTER TABLE "User" RENAME COLUMN "email" TO "username";
ALTER TABLE "User" DROP COLUMN "name";
UPDATE "User" SET "username" = 'emi' WHERE "username" = 'emimggapi@gmail.com';
