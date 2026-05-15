import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteProduct } from '../api'

export default function ProductList({ products, isFetching, error, onEdit, showNotification }) {
  const qc = useQueryClient()

  const del = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess() {
      qc.invalidateQueries(['products'])
      showNotification('Command DELETE queued successfully')
    },
    onError(err) {
      showNotification(err.message || 'Delete failed', 'error')
    }
  })

  if (error) {
    return (
      <div className="panel-card">
        <div className="panel-head">
          <span className="panel-kicker">Read Model</span>
          <h3>Product Materialized View</h3>
        </div>
        <p className="error-block">Gateway error: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="panel-card panel-card-large">
      <div className="panel-head panel-head-row">
        <div>
          <span className="panel-kicker">Read Model</span>
          <h3>Product Materialized View</h3>
        </div>
        <span className={`sync-badge ${isFetching ? 'is-active' : ''}`}>
          {isFetching ? 'Refreshing cache...' : 'Cache ready'}
        </span>
      </div>

      <div className="list-stack">
        {products.length === 0 && <div className="empty-block">No products in read model yet.</div>}

        {products.map((product) => (
          <article key={product.id} className="product-card">
            <div>
              <h4>{product.name}</h4>
              <p>ID: {product.id}</p>
              <strong>{Number(product.price || 0).toLocaleString('vi-VN')} VND</strong>
            </div>

            <div className="product-actions">
              <button className="btn-ghost" onClick={() => onEdit(product)}>
                Edit
              </button>
              <button
                className="btn-danger"
                onClick={() => del.mutate(product.id)}
                disabled={del.isLoading}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
