import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

type Props = {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, removeFromCart, updateQty, totalPrice, clearCart } = useCart()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200 }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '420px',
              maxWidth: '100vw',
              background: 'var(--bg-card)',
              borderLeft: '1px solid var(--border)',
              zIndex: 300,
              display: 'flex',
              flexDirection: 'column',
              padding: '2rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', letterSpacing: '0.15em', color: 'var(--accent)', textTransform: 'uppercase' }}>
                Varukorg
              </h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem' }}>
                ×
              </button>
            </div>

            {items.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '3rem' }}>
                Varukorgen är tom
              </p>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {items.map(item => (
                    <div
                      key={item.product.id}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center',
                        padding: '1rem',
                        background: 'var(--bg-elevated)',
                        borderRadius: '4px',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{item.product.name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {item.product.weightGrams}g
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {(['−', '+'] as const).map((sym, idx) => (
                          <button
                            key={sym}
                            onClick={() => updateQty(item.product.id, item.quantity + (idx === 0 ? -1 : 1))}
                            style={{
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border)',
                              color: 'var(--text)',
                              width: '28px',
                              height: '28px',
                              borderRadius: '2px',
                              fontSize: '1rem',
                            }}
                          >
                            {sym}
                          </button>
                        ))}
                        <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
                          {item.quantity}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '70px' }}>
                        <p style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>
                          {(parseFloat(item.product.price) * item.quantity).toFixed(2)} kr
                        </p>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', padding: 0, marginTop: '0.2rem' }}
                        >
                          Ta bort
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Totalt</span>
                    <span style={{ color: 'var(--accent)', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
                      {totalPrice.toFixed(2)} kr
                    </span>
                  </div>
                  <button
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'var(--accent)',
                      color: '#0d0f0d',
                      border: 'none',
                      borderRadius: '2px',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginBottom: '0.75rem',
                    }}
                  >
                    Gå till kassan
                  </button>
                  <button
                    onClick={clearCart}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'none',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                      borderRadius: '2px',
                      fontSize: '0.85rem',
                    }}
                  >
                    Töm varukorg
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
