export type Category = {
  id: number
  name: string
  slug: string
  description: string | null
}

export type Product = {
  id: number
  name: string
  description: string | null
  price: string
  weightGrams: number
  stockQty: number
  categoryId: number
  createdAt: string
  category: Category
}

export type CartItem = {
  product: Product
  quantity: number
}
