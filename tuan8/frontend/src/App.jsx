import React, { useMemo, useState } from 'react'
import ProductList from './components/ProductList'
import ProductForm from './components/ProductForm'
import { useQuery } from '@tanstack/react-query'
import { getProducts } from './api'

function FlowNode({ title, detail, status }) {
  return (
    <div className="flow-node">
      <div className={`flow-dot ${status ? 'is-online' : 'is-offline'}`} />
      <div>
        <h4>{title}</h4>
        <p>{detail}</p>
      </div>
    </div>
  )
}

function formatNow() {
  return new Date().toLocaleTimeString('vi-VN', { hour12: false })
}

export default function App() {
  const [editing, setEditing] = useState(null)
  const [notify, setNotify] = useState([])

  const {
    data: products = [],
    isFetching,
    error,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    refetchInterval: 4000
  })

  const architectureHealth = !error
  const averagePrice = useMemo(() => {
    if (!products.length) return 0
    const total = products.reduce((sum, item) => sum + Number(item.price || 0), 0)
    return Math.round(total / products.length)
  }, [products])

  const showNotification = (message, kind = 'ok') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setNotify((prev) => [...prev, { id, message, kind }])

    setTimeout(() => {
      setNotify((prev) => prev.filter((item) => item.id !== id))
    }, 2800)
  }

  return (
    <div className="page-shell">
      <div className="glow glow-left" />
      <div className="glow glow-right" />

      <main className="content-shell">
        <header className="hero-card">
          <div>
            <span className="hero-chip">Week 8 • Space-based Architecture Demo</span>
            <h1>Product Command/Query Console</h1>
            <p>
              Mien ghi du lieu (write model) va mien doc du lieu (read model) duoc tach rieng,
              dong bo qua Redis queue + event stream.
            </p>
          </div>

          <div className="hero-stats">
            <div className="stat-tile">
              <strong>{products.length}</strong>
              <span>Total products</span>
            </div>
            <div className="stat-tile">
              <strong>{averagePrice.toLocaleString('vi-VN')} VND</strong>
              <span>Average price</span>
            </div>
            <div className="stat-tile">
              <strong>{isFetching ? 'Syncing...' : 'Stable'}</strong>
              <span>Read model status</span>
            </div>
          </div>
        </header>
        <div className="workspace-grid">
          <aside>
            <ProductForm
              editing={editing}
              onDone={() => setEditing(null)}
              showNotification={showNotification}
            />
          </aside>

          <section>
            <ProductList
              products={products}
              isFetching={isFetching}
              error={error}
              onEdit={(product) => setEditing(product)}
              showNotification={showNotification}
            />
          </section>
        </div>

        <footer className="footer-note">
          <span>Event log:</span>
          <strong>{error ? `Gateway error at ${formatNow()}` : `Healthy at ${formatNow()}`}</strong>
        </footer>
      </main>

      <div className="toast-zone">
        {notify.map((item) => (
          <div key={item.id} className={`toast ${item.kind === 'error' ? 'is-error' : ''}`}>
            {item.message}
          </div>
        ))}
      </div>
    </div>
  )
}
