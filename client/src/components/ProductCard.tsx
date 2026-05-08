import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getProductImage } from '../lib/images'
import type { Product } from '../types'

type Props = {
  product: Product
  index: number
}

export default function ProductCard({ product, index }: Props) {
  const { addToCart } = useCart()
  const inStock = product.stockQty > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: '180px',
          backgroundImage: `url(${getProductImage(product.name)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <Link to={`/produkter/${product.id}`} style={{ flex: 1, padding: '1.5rem', display: 'block' }}>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--green)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          {product.category.name}
        </span>
        <h3 style={{ margin: '0.5rem 0 0.4rem', fontSize: '1.1rem', color: 'var(--text)' }}>
          {product.name}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {product.weightGrams}g
        </p>
        <p style={{ color: 'var(--accent)', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
          {parseFloat(product.price).toFixed(2)} kr
        </p>
      </Link>

      <div style={{ padding: '0 1.5rem 1.5rem' }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => addToCart(product)}
          disabled={!inStock}
          style={{
            width: '100%',
            padding: '0.7rem',
            background: inStock ? 'var(--accent)' : 'var(--bg-elevated)',
            color: inStock ? '#0d0f0d' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '2px',
            fontWeight: 'bold',
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {inStock ? 'Lägg i varukorg' : 'Slutsålt'}
        </motion.button>
      </div>
    </motion.div>
  )
}
