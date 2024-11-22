/*
  Warnings:

  - Made the column `categoriaId` on table `Libro` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Libro" ALTER COLUMN "categoriaId" SET NOT NULL,
ALTER COLUMN "categoriaId" DROP DEFAULT;
