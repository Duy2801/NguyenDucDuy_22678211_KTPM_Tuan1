import React, { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProduct, updateProduct } from '../api'

export default function ProductForm({ editing, onDone, showNotification }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ name: '', price: '' })

  useEffect(() => {
    if (!editing) {
      setForm({ name: '', price: '' })
      return
    }

    setForm({
      name: editing.name || '',
      price: editing.price || ''
    })
  }, [editing])

  const createMut = useMutation({
    mutationFn: (data) => createProduct(data),
    onSuccess() {
      qc.invalidateQueries(['products'])
      showNotification('Command CREATE queued successfully')
      setForm({ name: '', price: '' })
    },
    onError(error) {
      showNotification(error.message || 'Create failed', 'error')
    }
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess() {
      qc.invalidateQueries(['products'])
      showNotification('Command UPDATE queued successfully')
      onDone()
      setForm({ name: '', price: '' })
    },
    onError(error) {
      showNotification(error.message || 'Update failed', 'error')
    }
  })

  const submit = (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      showNotification('Name is required', 'error')
      return
    }

    const numericPrice = Number(form.price)
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      showNotification('Price must be a positive number', 'error')
      return
    }

    const payload = {
      name: form.name.trim(),
      price: numericPrice
    }

    if (editing && editing.id) updateMut.mutate({ id: editing.id, data: payload })
    else createMut.mutate(payload)
  }

  const isBusy = createMut.isLoading || updateMut.isLoading

  return (
    <div className="panel-card">
      <div className="panel-head">
        <span className="panel-kicker">Write Model</span>
        <h3>{editing ? 'Update Product Command' : 'Create Product Command'}</h3>
      </div>

      <form onSubmit={submit} className="form-stack">
        <div>
          <label htmlFor="name" className="field-label">Product name</label>
          <input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="field-input"
            placeholder="e.g. AirPods Pro 2"
          />
        </div>
        <div>
          <label htmlFor="price" className="field-label">Price (VND)</label>
          <input
            id="price"
            type="number"
            min="1"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="field-input"
            placeholder="e.g. 4990000"
          />
        </div>

        <div className="helper-text">
          Lenh ghi du lieu se dua vao Redis queue. Service-write xu ly va phat event cap nhat cache.
        </div>

        <div className="action-row">
          <button type="submit" className="btn-primary" disabled={isBusy}>
            {isBusy ? 'Sending command...' : editing ? 'Update command' : 'Create command'}
          </button>

          {editing && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                onDone()
                setForm({ name: '', price: '' })
              }}
              disabled={isBusy}
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
