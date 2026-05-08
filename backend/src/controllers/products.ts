import type { Request, Response } from 'express'
import prisma from '../db/prisma.js'
import { AppError } from '../lib/AppError.js'
import { z } from 'zod'

// Hämtar alla produkter, filtrerar på kategori om query skickas med
export async function getAllProducts(req: Request, res: Response) {
  const { category } = req.query

  // hämta alla produkter inkl. kategorinamnet på varje produkt
  const products = await prisma.product.findMany({
    ...(category ? { where: { category: { slug: category as string } } } : {}),
    include: { category: true },
  })

  res.json(products)
}

const idSchema = z.coerce.number().int().positive()

// Hämtar från produktens id 400 om id är fel eller 404 om produkten inte finns
export async function getProductById(
  req: Request<{ id: string }>,
  res: Response,
) {
  const parsed = idSchema.safeParse(req.params.id)
  if (!parsed.success) {
    throw new AppError(400, 'Invalid id')
  }

  const id = parsed.data
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  })

  if (!product) {
    throw new AppError(404, 'Product not found')
  }

  res.json(product)
}
