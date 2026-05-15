const API_BASE = '' // proxied by Vite to http://localhost:3000

async function parseResponse(res, fallbackMessage) {
  if (res.ok) {
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      return res.json()
    }
    return res.text()
  }

  let message = fallbackMessage
  try {
    const data = await res.json()
    message = data?.error || message
  } catch {
    // Keep fallback message when response is not JSON.
  }

  throw new Error(message)
}

export async function getProducts() {
  const res = await fetch(`${API_BASE}/products`)
  return parseResponse(res, 'Failed to fetch products')
}

export async function createProduct(payload) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return parseResponse(res, 'Failed to create product')
}

export async function updateProduct(id, payload) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return parseResponse(res, 'Failed to update product')
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' })
  return parseResponse(res, 'Failed to delete product')
}
