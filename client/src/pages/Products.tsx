import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiFetch } from '../lib/api'
import ProductCard from '../components/ProductCard'
import type { Product, Category } from '../types'

const filterBtnStyle = (active: boolean) => ({
  padding: '0.5rem 1.2rem',
  background: active ? 'var(--accent)' : 'var(--bg-card)',
  color: active ? '#0d0f0d' : 'var(--text-muted)',
  border: '1px solid var(--border)',
  borderRadius: '2px',
  fontSize: '0.85rem',
  letterSpacing: '0.05em',
  fontWeight: active ? 'bold' : 'normal',
  cursor: 'pointer',
})

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category')

  useEffect(() => {
    apiFetch<Category[]>('/api/categories').then(setCategories).catch(console.error)
  }, [])

  useEffect(() => {
    const path = activeCategory
      ? `/api/products?category=${activeCategory}`
      : '/api/products'
    apiFetch<Product[]>(path).then(setProducts).catch(console.error)
  }, [activeCategory])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ paddingTop: '6rem', minHeight: '100vh' }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--accent)', letterSpacing: '0.15em', marginBottom: '2.5rem', textTransform: 'uppercase' }}>
          Produkter
        </h1>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <button style={filterBtnStyle(!activeCategory)} onClick={() => setSearchParams({})}>
            Alla
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              style={filterBtnStyle(activeCategory === cat.slug)}
              onClick={() => setSearchParams({ category: cat.slug })}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
