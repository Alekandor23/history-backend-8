/*
  Warnings:

  - You are about to drop the column `FechaNacimiento` on the `Usuario` table. All the data in the column will be lost.
  - Made the column `imagenPerfil` on table `Usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "FechaNacimiento",
ALTER COLUMN "imagenPerfil" SET NOT NULL;
