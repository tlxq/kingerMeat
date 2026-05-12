import type { Request, Response } from 'express'
import prisma from '../db/prisma.js'
import { AppError } from '../lib/AppError.js'
import { parseId } from '../lib/idSchema.js'

// Returnera all kategorier med koll på antal produkter
export async function getAllCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { id: 'asc' },
  })
  res.json(categories)
}

// Hämtar en kategori med tillhörande produkter, 404 om den inte finns.
export async function getCategoryById(
  req: Request<{ id: string }>,
  res: Response,
) {
  const id = parseId(req.params.id)

  const category = await prisma.category.findUnique({
    where: { id },
    include: { products: true },
  })

  if (!category) {
    throw new AppError(404, 'Category not found')
  }

  res.json(category)
}
