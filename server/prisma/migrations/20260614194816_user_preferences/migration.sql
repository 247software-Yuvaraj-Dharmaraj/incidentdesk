-- AlterTable
ALTER TABLE "User" ADD COLUMN     "density" TEXT NOT NULL DEFAULT 'comfortable',
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'light';
