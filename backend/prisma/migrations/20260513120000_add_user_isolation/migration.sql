-- Wipe all transactional and catalog data for a clean start
DELETE FROM "QuoteItem";
DELETE FROM "Quote";
DELETE FROM "Client";
DELETE FROM "Product";

-- Add userId to Client
ALTER TABLE "Client" ADD COLUMN "userId" INTEGER;
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add userId to Quote
ALTER TABLE "Quote" ADD COLUMN "userId" INTEGER;
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
