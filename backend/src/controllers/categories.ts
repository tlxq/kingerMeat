import type { Request, Response } from "express"
import prisma from "../db/prisma.js"

// Returnera all kategorier med koll på antal produkter
export async function getAllCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({

    include: {
      _count: { select: { products: true } },
    }
  })

  res.json(categories)
}

export async function getCategoryById(req: Request<{ id: string }>, res: Response) {
  const id = parseInt(req.params.id)

  const category = await prisma.category.findUnique({
    where: { id },

    include: { products: true },
  })

  if (!category) {
    res.status(404).json({ error: 'Category not found' })
    return
  }

  res.json(category)
}


