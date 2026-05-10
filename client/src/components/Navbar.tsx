import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CartDrawer from './CartDrawer'

export default function Navbar() {
  const { totalItems } = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.2rem 2.5rem',
          background: 'rgba(13, 15, 13, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.3rem',
            color: 'var(--accent)',
            letterSpacing: '0.15em',
          }}
        >
          KINGER MEAT
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <Link
            to="/produkter"
            style={{ color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            Produkter
          </Link>
          <Link
            to="/om-oss"
            style={{ color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            Om oss
          </Link>
          <button
            onClick={() => setCartOpen(true)}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '0.5rem 1.2rem',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.85rem',
              letterSpacing: '0.05em',
            }}
          >
            Varukorg
            {totalItems > 0 && (
              <span
                style={{
                  background: 'var(--accent)',
                  color: '#0d0f0d',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                }}
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
