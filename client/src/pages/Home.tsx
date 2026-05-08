import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiFetch } from '../lib/api'
import { images } from '../lib/images'
import type { Category } from '../types'

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    apiFetch<Category[]>('/api/categories').then(setCategories).catch(console.error)
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Hero */}
      <section
        style={{
          height: '100vh',
          backgroundImage: `linear-gradient(to bottom, rgba(13,15,13,0.2) 0%, rgba(13,15,13,0.85) 100%), url(${images.hero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Sörmland, Sverige
          </p>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              color: 'var(--text)',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem',
            }}
          >
            KINGER MEAT
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '2.5rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Viltkött från naturen
          </p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/produkter"
              style={{
                display: 'inline-block',
                padding: '0.9rem 2.8rem',
                background: 'var(--accent)',
                color: '#0d0f0d',
                fontWeight: 'bold',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                borderRadius: '2px',
              }}
            >
              Utforska sortimentet
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Categories */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', fontSize: '1.5rem', color: 'var(--accent)', marginBottom: '3rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}
        >
          Sortiment
        </motion.h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -4 }}
            >
              <Link to={`/produkter?category=${cat.slug}`}>
                <div
                  style={{
                    height: '240px',
                    backgroundImage: `linear-gradient(to bottom, rgba(13,15,13,0.1) 0%, rgba(13,15,13,0.85) 100%), url(${images.categories[cat.slug] ?? images.fallback})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '1.5rem',
                    border: '1px solid var(--border)',
                  }}
                >
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text)', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{cat.description}</p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  )
}
