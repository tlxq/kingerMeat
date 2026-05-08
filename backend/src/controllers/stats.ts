import type { Request, Response } from 'express'
import prisma from '../db/prisma.js'

// Returnerar totalt antal produkter, kategorier och lagersaldo
export async function getStats(_req: Request, res: Response) {
  const totalProducts = await prisma.product.count()
  const totalCategories = await prisma.category.count()

  const stockResult = await prisma.product.aggregate({
    _sum: { stockQty: true },
  })
  const totalStock = stockResult._sum.stockQty ?? 0

  res.json({ totalProducts, totalCategories, totalStock })
}
