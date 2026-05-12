import type { Request, Response } from 'express'
import prisma from '../db/prisma.js'

// Returnerar totalt antal produkter, kategorier och lagersaldo
export async function getStats(_req: Request, res: Response) {
  const [totalProducts, totalCategories, stockResult] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.product.aggregate({ _sum: { stockQty: true } }),
  ])
  const totalStock = stockResult._sum.stockQty ?? 0

  res.json({ totalProducts, totalCategories, totalStock })
}
