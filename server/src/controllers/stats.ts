import type { Request, Response } from 'express'
import prisma from '../db/prisma.js'

// Räknar ihop produkter, kategorier, lagersaldo och totalt lagervärde och returnerar som JSON.
export async function getStats(_req: Request, res: Response) {
  // Promise.all kör alla db-anrop samtidigt istället för ett i taget.
  const [totalProducts, totalCategories, stockResult, priceRows] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.product.aggregate({ _sum: { stockQty: true } }),
    prisma.product.findMany({ select: { price: true, stockQty: true } }),
  ])
  // ?? 0 för att _sum kan vara null om det inte finns några produkter.
  const totalStock = stockResult._sum.stockQty ?? 0

  // price är Prisma Decimal — Number() konverterar till vanlig number för multiplikation.
  const totalStockValue = priceRows.reduce(
    (sum, p) => sum + Number(p.price) * p.stockQty,
    0,
  )

  res.json({ totalProducts, totalCategories, totalStock, totalStockValue })
}
