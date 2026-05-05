import type { Request, Response } from "express"
import prisma from "../db/prisma.js"

export async function getAllProducts(req: Request, res: Response) {

  const { category } = req.query

  // hämta alla produkter inkl. kategorinamnet på varje produkt
  const products = await prisma.product.findMany({
    where: category
      ? { category: { slug: category as string } }
      : undefined,
    include: { category: true },
  })

  res.json(products)
}

export async function getProductById(req: Request, res: Response) {
  const id = parseInt(req.params.id)

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
