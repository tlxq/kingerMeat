import type { Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../db/prisma.js'
import { AppError } from '../lib/AppError.js'
import { parseId } from '../lib/idSchema.js'

// Validerar att ?category= är en sträng om den skickas med — annars är den optional.
const productQuerySchema = z.object({
  category: z.string().min(1).optional(),
})

// Hämtar alla produkter. Om ?category=slug skickas med så filtreras listan på den kategorin.
export async function getAllProducts(req: Request, res: Response) {
  const { category } = productQuerySchema.parse(req.query)

  // include drar med kategori-objektet på varje produkt så frontend slipper göra extra anrop.
  const products = await prisma.product.findMany({
    ...(category ? { where: { category: { slug: category } } } : {}),
    include: { category: true },
    orderBy: { id: 'asc' },
  })

  res.json(products)
}

// Hämtar en produkt via id. 400 om id är ogiltigt (parseId kastar), 404 om produkten inte finns.
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
