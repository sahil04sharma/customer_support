-- AlterTable
ALTER TABLE "BusinessSettings" ADD COLUMN     "chatMode" TEXT NOT NULL DEFAULT 'platform',
ADD COLUMN     "chatProvider" TEXT,
ADD COLUMN     "chatApiKeyEnc" TEXT,
ADD COLUMN     "chatModel" TEXT,
ADD COLUMN     "embedMode" TEXT NOT NULL DEFAULT 'platform',
ADD COLUMN     "embedProvider" TEXT,
ADD COLUMN     "embedApiKeyEnc" TEXT,
ADD COLUMN     "embedModel" TEXT,
ADD COLUMN     "embedConfigVersion" INTEGER NOT NULL DEFAULT 1;
