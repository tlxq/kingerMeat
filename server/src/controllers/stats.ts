import type { Request, Response } from 'express'
import prisma from '../db/prisma.js'

// Räknar ihop produkter, kategorier och lagersaldo och returnerar som JSON.
export async function getStats(_req: Request, res: Response) {
  // Promise.all kör alla tre db-anrop samtidigt istället för ett i taget.
  const [totalProducts, totalCategories, stockResult] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.product.aggregate({ _sum: { stockQty: true } }),
  ])
  // ?? 0 för att _sum kan vara null om det inte finns några produkter.
  const totalStock = stockResult._sum.stockQty ?? 0

  res.json({ totalProducts, totalCategories, totalStock })
}
