import { motion } from 'framer-motion'
import { images } from '../lib/images'

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ paddingTop: '4rem', minHeight: '100vh' }}
    >
      <div
        style={{
          height: '420px',
          backgroundImage: `linear-gradient(to bottom, rgba(13,15,13,0.1) 0%, rgba(13,15,13,1) 100%), url(${images.about})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '3rem',
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--text)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          Om oss
        </motion.h1>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '4rem 2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--text-muted)' }}>
            Kinger Meat är ett familjeföretag i Sörmland som levererar viltkött av högsta kvalitet
            direkt från naturen. Allt kött kommer från jakten som bedrivs av Peter Jonsson på de
            omgivande skogarna.
          </p>
          <p style={{ lineHeight: 1.8, color: 'var(--text-muted)' }}>
            Vi erbjuder hjort, älg och vildsvin — naturligt uppfött vilt utan tillsatser.
            Köttet hanteras med omsorg från jakt till leverans för att bevara smak och kvalitet.
          </p>
          <p style={{ lineHeight: 1.8, color: 'var(--text-muted)' }}>
            Sörmlands rika marker ger optimala förutsättningar för friskt och välnärt vilt.
            Peter kombinerar generationers jakttradition med modern hantering.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: '3rem',
            padding: '2rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
          }}
        >
          <h2 style={{ fontSize: '0.85rem', letterSpacing: '0.2em', color: 'var(--accent)', marginBottom: '1rem', textTransform: 'uppercase' }}>
            Kontakt
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 2 }}>
            Peter Jonsson<br />
            Sörmland, Sverige
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
