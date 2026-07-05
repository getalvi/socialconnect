import { useState, useEffect } from 'react'
import { Package, Globe, Plus, Trash2, Play, RefreshCw, CheckCircle, AlertCircle, X } from 'lucide-react'
import { getProducts, fetchProductsFromURL, addProductManually, deleteProduct, runWorkflow, getWorkflowLogs } from '../api/client'

export default function ProductManager() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchUrl, setFetchUrl] = useState('')
  const [fetchLoading, setFetchLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [runningWorkflow, setRunningWorkflow] = useState({})
  const [workflowLogs, setWorkflowLogs] = useState({})
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', category: '', image_url: '', product_url: '' })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      const res = await getProducts()
      setProducts(res.data.products || [])
    } catch (e) {
      showToast('Products load করতে সমস্যা হয়েছে', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProducts() }, [])

  const handleFetch = async () => {
    if (!fetchUrl.trim()) return showToast('Website URL দিন', 'error')
    setFetchLoading(true)
    try {
      const res = await fetchProductsFromURL(fetchUrl, 20)
      showToast(`✅ ${res.data.count} টি product fetch হয়েছে!`)
      await loadProducts()
      setFetchUrl('')
    } catch (e) {
      showToast(e.response?.data?.detail || 'Fetch করতে সমস্যা হয়েছে', 'error')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleAddManual = async () => {
    if (!newProduct.name.trim()) return showToast('Product name দিন', 'error')
    try {
      await addProductManually(newProduct)
      showToast('✅ Product add হয়েছে!')
      setShowAddModal(false)
      setNewProduct({ name: '', price: '', description: '', category: '', image_url: '', product_url: '' })
      await loadProducts()
    } catch (e) {
      showToast('Add করতে সমস্যা হয়েছে', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('এই product delete করবেন?')) return
    try {
      await deleteProduct(id)
      showToast('Product deleted')
      setProducts(products.filter(p => p.id !== id))
    } catch (e) {
      showToast('Delete করতে সমস্যা হয়েছে', 'error')
    }
  }

  const handleRunWorkflow = async (productId) => {
    setRunningWorkflow(prev => ({ ...prev, [productId]: true }))
    showToast('🚀 Workflow শুরু হয়েছে! Background এ চলছে...')
    try {
      await runWorkflow(productId, true)
      const pollLogs = async () => {
        for (let i = 0; i < 20; i++) {
          await new Promise(r => setTimeout(r, 3000))
          const res = await getWorkflowLogs(productId)
          const logs = res.data.logs || []
          setWorkflowLogs(prev => ({ ...prev, [productId]: logs }))
          const done = logs.some(l => l.step === 'complete' && l.status === 'done')
          const failed = logs.some(l => l.step === 'error' && l.status === 'failed')
          if (done) { showToast('✅ Workflow complete! Review page এ post দেখুন।'); break }
          if (failed) { showToast('❌ Workflow এ সমস্যা হয়েছে', 'error'); break }
        }
        setRunningWorkflow(prev => ({ ...prev, [productId]: false }))
      }
      pollLogs()
    } catch (e) {
      showToast('Workflow start করতে সমস্যা', 'error')
      setRunningWorkflow(prev => ({ ...prev, [productId]: false }))
    }
  }

  return (
    <div className="p-6 space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl flex items-center gap-2
          ${toast.type === 'error' ? 'bg-red-500/20 border border-red-500/40 text-red-300' : 'bg-green-500/20 border border-green-500/40 text-green-300'}`}>
          {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
          {toast.msg}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-sm mt-1" style={{ color: '#555570' }}>Website থেকে products fetch করুন বা manually add করুন</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Manual Add
        </button>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={18} style={{ color: '#e8192c' }} />
          <h3 className="font-semibold text-white">Website থেকে Products Fetch করুন</h3>
        </div>
        <p className="text-xs mb-4" style={{ color: '#555570' }}>WooCommerce, Shopify বা যেকোনো e-commerce website URL দিন। Auto-detect করবে।</p>
        <div className="flex gap-3">
          <input className="input-field flex-1" placeholder="https://yourshop.com.bd" value={fetchUrl}
            onChange={e => setFetchUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleFetch()} />
          <button onClick={handleFetch} disabled={fetchLoading} className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap">
            {fetchLoading ? <><RefreshCw size={15} className="loading-spin" /> Fetching...</> : <><Globe size={15} /> Fetch করুন</>}
          </button>
        </div>
        {fetchLoading && <p className="mt-3 text-xs" style={{ color: '#f59e0b' }}>⏳ WooCommerce → Shopify → HTML scraping চেষ্টা করছে...</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">সব Products <span className="text-sm font-normal ml-1" style={{ color: '#555570' }}>({products.length})</span></h3>
          <button onClick={loadProducts} className="btn-ghost text-sm flex items-center gap-2">
            <RefreshCw size={13} className={loading ? 'loading-spin' : ''} /> Refresh
          </button>
        </div>
        {loading ? (
          <div className="text-center py-16"><RefreshCw size={30} className="loading-spin mx-auto mb-3" style={{ color: '#e8192c' }} /><p style={{ color: '#333350' }}>Loading...</p></div>
        ) : products.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Package size={40} className="mx-auto mb-4" style={{ color: '#333350' }} />
            <p className="text-white font-medium mb-2">কোনো Product নেই</p>
            <p className="text-sm" style={{ color: '#555570' }}>URL দিয়ে fetch করুন বা manually add করুন</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(p => {
              const logs = workflowLogs[p.id] || []
              const isRunning = runningWorkflow[p.id]
              const latestLog = logs[0]
              return (
                <div key={p.id} className="glass rounded-xl overflow-hidden group">
                  <div className="relative h-40 overflow-hidden" style={{ background: '#0d0d1a' }}>
                    {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      : <div className="w-full h-full flex items-center justify-center"><Package size={32} style={{ color: '#333350' }} /></div>}
                    <button onClick={() => handleDelete(p.id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(239,68,68,0.8)' }}>
                      <Trash2 size={12} className="text-white" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h4 className="text-white text-sm font-semibold truncate mb-1">{p.name}</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold" style={{ color: '#e8192c' }}>{p.price}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#555570' }}>{p.category}</span>
                    </div>
                    <p className="text-xs mb-3 line-clamp-2" style={{ color: '#555570' }}>{p.description}</p>
                    {latestLog && (
                      <div className={`text-xs px-2 py-1.5 rounded-lg mb-2 ${latestLog.status === 'done' ? 'bg-green-500/10 text-green-400' : latestLog.status === 'failed' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {latestLog.message?.substring(0, 55)}
                      </div>
                    )}
                    <button onClick={() => handleRunWorkflow(p.id)} disabled={isRunning}
                      className="w-full btn-primary text-xs flex items-center justify-center gap-1.5 py-2">
                      {isRunning ? <><RefreshCw size={12} className="loading-spin" /> Running...</> : <><Play size={12} /> AI Workflow Run করুন</>}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white text-lg">Product Manually Add করুন</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-white/10 rounded-lg"><X size={18} style={{ color: '#555570' }} /></button>
            </div>
            <div className="space-y-3">
              {[{ key: 'name', label: 'Product Name *', placeholder: 'যেমন: Shari, Punjabi...' },
                { key: 'price', label: 'মূল্য', placeholder: '1200 BDT' },
                { key: 'category', label: 'Category', placeholder: 'Fashion, Electronics...' },
                { key: 'image_url', label: 'Image URL', placeholder: 'https://...' },
                { key: 'product_url', label: 'Product URL', placeholder: 'https://yourshop.com/...' }].map(f => (
                <div key={f.key}>
                  <label className="text-xs mb-1 block" style={{ color: '#a0a0c0' }}>{f.label}</label>
                  <input className="input-field" placeholder={f.placeholder} value={newProduct[f.key]}
                    onChange={e => setNewProduct(prev => ({ ...prev, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#a0a0c0' }}>বিবরণ</label>
                <textarea className="textarea-field" placeholder="Product বিবরণ..." rows={3}
                  value={newProduct.description} onChange={e => setNewProduct(prev => ({ ...prev, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="btn-ghost flex-1 text-sm">Cancel</button>
              <button onClick={handleAddManual} className="btn-primary flex-1 text-sm">Add Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
