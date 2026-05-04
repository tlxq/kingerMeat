import { PrismaClient } from "@prisma/client" // den genererade klienten

const prisma = new PrismaClient()

async function main() {
  // rensa först så vi inte får dubbletter vid omstart
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  // skapa kategorier — spara i variabler för att få id:na till produkterna
  const deer = await prisma.category.create({
    data: { name: "Hjort", slug: "hjort", description: "Viltkött från hjort" },
  })

  const elk = await prisma.category.create({
    data: { name: "Älg", slug: "alg", description: "Viltkött från älg" },
  })

  const boar = await prisma.category.create({
    data: { name: "Vildsvin", slug: "vildsvin", description: "Viltkött från vildsvin" },
  })

  // skapa produkter — categoryId kopplar produkten till rätt kategori
  await prisma.product.createMany({
    data: [
      { name: "Hjortfilé", description: "Mör och smakrik filé", price: 289, weightGrams: 500, stockQty: 20, categoryId: deer.id },
      { name: "Hjortgryta", description: "Perfekt för långkok", price: 179, weightGrams: 800, stockQty: 15, categoryId: deer.id },
      { name: "Älgfilé", description: "Klassiskt viltkött", price: 259, weightGrams: 500, stockQty: 10, categoryId: elk.id },
      { name: "Älgbiff", description: "Saftig och mager", price: 199, weightGrams: 400, stockQty: 25, categoryId: elk.id },
      { name: "Vildsvinskorv", description: "Rökt med naturlig smak", price: 149, weightGrams: 400, stockQty: 30, categoryId: boar.id },
      { name: "Vildsvinskarré", description: "Marmorerat och smakrikt", price: 219, weightGrams: 600, stockQty: 12, categoryId: boar.id },
    ],
  })

  console.log("Seed klar!")
}

main()
  .catch(console.error)          // skriv ut fel om något går snett
  .finally(() => prisma.$disconnect()) // stäng alltid kopplingen till databasen
