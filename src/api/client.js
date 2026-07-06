import axios from 'axios'

// ─────────────────────────────────────────────────────────────────
// Backend URL — getalvi এর HuggingFace Space
// HF Space: https://huggingface.co/spaces/getalvi/socialconnect
// Actual API URL: https://getalvi-socialconnect.hf.space
// ─────────────────────────────────────────────────────────────────
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  'https://getalvi-socialconnect.hf.space'

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
})

// Log the URL being used (helpful for debugging)
console.log('🔗 Backend URL:', BACKEND_URL)

api.interceptors.response.use(
  response => response,
  error => {
    const msg = error.response?.data?.detail || error.message
    console.error('❌ API Error:', msg)
    return Promise.reject(error)
  }
)

// ── Settings ──────────────────────────────────────────────────────
export const getSettings        = ()     => api.get('/api/settings')
export const updateSettings     = (data) => api.post('/api/settings', data)

// ── Products ──────────────────────────────────────────────────────
export const getProducts        = ()          => api.get('/api/products')
export const fetchProductsFromURL = (url, max=20) =>
  api.post('/api/products/fetch', { website_url: url, max_products: max })
export const addProductManually = (data)      => api.post('/api/products/add', data)
export const deleteProduct      = (id)        => api.delete(`/api/products/${id}`)

// ── Workflow ──────────────────────────────────────────────────────
export const runWorkflow        = (productId, auto=true) =>
  api.post('/api/workflow/run', { product_id: productId, auto_schedule: auto })
export const getWorkflowLogs    = (productId) => api.get(`/api/workflow/logs/${productId}`)

// ── Drafts ────────────────────────────────────────────────────────
export const getDrafts          = (status)    =>
  api.get('/api/drafts', { params: status ? { status } : {} })
export const getDraft           = (id)        => api.get(`/api/drafts/${id}`)
export const updateDraft        = (id, data)  => api.put(`/api/drafts/${id}`, data)
export const approveDraft       = (id)        => api.post(`/api/drafts/${id}/approve`)
export const rejectDraft        = (id, reason='') =>
  api.post(`/api/drafts/${id}/reject`, null, { params: { reason } })
export const publishNow         = (id)        => api.post(`/api/drafts/${id}/publish`)
export const regenerateContent  = (id)        => api.post(`/api/drafts/${id}/regenerate`)
export const deleteDraft        = (id)        => api.delete(`/api/drafts/${id}`)

// ── Published Posts ───────────────────────────────────────────────
export const getPublishedPosts  = ()          => api.get('/api/published')

// ── AI Chat ───────────────────────────────────────────────────────
export const sendChatMessage    = (messages, sessionId='default') =>
  api.post('/api/ai/chat', { messages, session_id: sessionId })
export const getChatHistory     = (sessionId='default') =>
  api.get('/api/ai/history', { params: { session_id: sessionId } })
export const clearChatHistory   = (sessionId='default') =>
  api.delete('/api/ai/history', { params: { session_id: sessionId } })

// ── Analytics ─────────────────────────────────────────────────────
export const getAnalytics       = ()          => api.get('/api/analytics')

export default api
