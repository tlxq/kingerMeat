// Byt ut URL:erna mot riktiga foton när de finns
// Storlekar: hero 1920x1080, kategorier 800x500, produkter 800x800, om-oss 1200x800
export const images = {
  hero: 'https://images.unsplash.com/photo-1723893905879-0e309c2a8e06?w=1920&q=80',
  about: 'https://images.unsplash.com/photo-1580139612475-cd60fa02e6bc?w=1200&q=80',
  fallback: 'https://images.unsplash.com/photo-1448697138198-9aa6d0d84bf4?w=800&q=80',

  products: {
    hjortfile: 'https://images.unsplash.com/photo-1602470521007-20293bd1fd31?w=800&q=80',
    hjortgryta: 'https://images.unsplash.com/photo-1751347999317-a0ed6f471cb3?w=800&q=80',
    algfile: 'https://images.unsplash.com/photo-1723893905879-0e309c2a8e06?w=800&q=80',
    algbiff: 'https://images.unsplash.com/photo-1728376336154-cfa772d600fb?w=800&q=80',
    vildsvinskorv: 'https://plus.unsplash.com/premium_photo-1723618899939-b19ead33e15c?w=800&q=80',
    vildsvinskarre: 'https://images.unsplash.com/photo-1623047437095-27418540c288?w=800&q=80',
  } as Record<string, string>,

  categories: {
    hjort: 'https://plus.unsplash.com/premium_photo-1661833885736-e6df42210638?w=800&q=80',
    alg: 'https://images.unsplash.com/photo-1534804442465-9689d85be37b?w=800&q=80',
    vildsvin: 'https://images.unsplash.com/photo-1545426908-a67f44ed0291?w=800&q=80',
  } as Record<string, string>,
}

export function getProductImage(productName: string): string {
  const key = productName
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[éè]/g, 'e')
    .replace(/\s+/g, '')
  return images.products[key] ?? images.fallback
}
