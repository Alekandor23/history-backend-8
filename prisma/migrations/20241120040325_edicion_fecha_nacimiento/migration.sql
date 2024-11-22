/*
  Warnings:

  - Made the column `fechaNacimiento` on table `Usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "fechaNacimiento" SET NOT NULL;
