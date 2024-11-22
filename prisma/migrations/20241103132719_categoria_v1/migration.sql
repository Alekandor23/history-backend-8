/*
  Warnings:

  - You are about to drop the `_CategoriaToLibro` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoriaId` to the `Libro` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_publicacion` to the `Resenia` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_CategoriaToLibro" DROP CONSTRAINT "_CategoriaToLibro_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoriaToLibro" DROP CONSTRAINT "_CategoriaToLibro_B_fkey";

-- AlterTable
ALTER TABLE "Libro" ADD COLUMN "categoriaId" INTEGER DEFAULT 1;

-- AlterTable
ALTER TABLE "Resenia" ADD COLUMN     "fecha_publicacion" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "_CategoriaToLibro";

-- AddForeignKey
ALTER TABLE "Libro" ADD CONSTRAINT "Libro_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
