import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiFetch } from '../lib/api'
import { useCart } from '../context/CartContext'
import { getProductImage } from '../lib/images'
import type { Product } from '../types'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    apiFetch<Product>(`/api/products/${id}`)
      .then(setProduct)
      .catch(() => setError(true))
  }, [id])

  if (error) {
    return (
      <div style={{ paddingTop: '8rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Produkten hittades inte.</p>
        <button
          onClick={() => navigate('/produkter')}
          style={{ marginTop: '1rem', background: 'none', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.5rem 1rem', borderRadius: '2px' }}
        >
          Tillbaka
        </button>
      </div>
    )
  }

  if (!product) return null

  const productImage = getProductImage(product.name)
  const inStock = product.stockQty > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ paddingTop: '6rem', minHeight: '100vh' }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '3rem 2rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'start',
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            height: '420px',
            backgroundImage: `url(${productImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '4px',
            border: '1px solid var(--border)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {product.category.name}
          </span>
          <h1 style={{ fontSize: '2rem', color: 'var(--text)', margin: '0.5rem 0 1rem', fontFamily: 'var(--font-heading)' }}>
            {product.name}
          </h1>
          <p style={{ fontSize: '2rem', color: 'var(--accent)', fontFamily: 'var(--font-heading)', marginBottom: '1.5rem' }}>
            {parseFloat(product.price).toFixed(2)} kr
          </p>

          {product.description && (
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem' }}>
              {product.description}
            </p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Vikt', value: `${product.weightGrams}g` },
              { label: 'Lager', value: inStock ? `${product.stockQty} st` : 'Slutsålt', warn: !inStock },
            ].map(({ label, value, warn }) => (
              <div key={label} style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                  {label}
                </p>
                <p style={{ fontSize: '1.1rem', color: warn ? '#e06060' : 'var(--text)' }}>{value}</p>
              </div>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => addToCart(product)}
            disabled={!inStock}
            style={{
              width: '100%',
              padding: '1rem',
              background: inStock ? 'var(--accent)' : 'var(--bg-elevated)',
              color: inStock ? '#0d0f0d' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '2px',
              fontWeight: 'bold',
              fontSize: '1rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {inStock ? 'Lägg i varukorg' : 'Slutsålt'}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}
