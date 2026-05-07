import type { Request, Response } from "express"
import prisma from "../db/prisma.js"
import { z } from "zod"

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

export async function getProductById(req: Request<{ id: string }>, res: Response) {
  const parsed = idSchema.safeParse(req.params.id)

  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid id' })
    return
  }

  const id = parsed.data

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  })

  if (!product) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  res.json(product)
}
