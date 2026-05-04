import type { Request, Response } from "express"
import prisma from "../db/prisma.js"

export async function getAllProducts(req: Request, res: Response) {
  // hämta alla produkter inkl. kategorinamnet på varje produkt
  const products = await prisma.product.findMany({
    include: { category: true },
  })

  res.json(products)
}
