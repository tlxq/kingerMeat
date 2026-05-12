import type { Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../db/prisma.js'
import { AppError } from '../lib/AppError.js'
import { parseId } from '../lib/idSchema.js'

const productQuerySchema = z.object({
  category: z.string().min(1).optional(),
})

// Hämtar alla produkter, filtrerar på kategori om query skickas med
export async function getAllProducts(req: Request, res: Response) {
  const { category } = productQuerySchema.parse(req.query)

  // hämta alla produkter inkl. kategorinamnet på varje produkt
  const products = await prisma.product.findMany({
    ...(category ? { where: { category: { slug: category } } } : {}),
    include: { category: true },
    orderBy: { id: 'asc' },
  })

  res.json(products)
}

// Hämtar från produktens id 400 om id är fel eller 404 om produkten inte finns
export async function getProductById(
  req: Request<{ id: string }>,
  res: Response,
) {
  const id = parseId(req.params.id)
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  })

  if (!product) {
    throw new AppError(404, 'Product not found')
  }

  res.json(product)
}
