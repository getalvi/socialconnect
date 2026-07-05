import { useState, useEffect } from 'react'
import { Calendar, RefreshCw, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { getDrafts, publishNow } from '../api/client'

export default function ScheduledPosts() {
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState({})
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000) }

  const load = async () => {
    setLoading(true)
    try {
      const res = await getDrafts('approved')
      setDrafts(res.data.drafts || [])
    } catch (e) {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handlePublish = async (id) => {
    if (!confirm('এখনই publish করবেন?')) return
    setPublishing(p => ({ ...p, [id]: true }))
    try {
      const res = await publishNow(id)
      showToast(`🚀 ${res.data.success_count}/${res.data.total_platforms} platform এ publish হয়েছে!`)
      load()
    } catch (e) { showToast('Publish করতে সমস্যা', 'error') }
    finally { setPublishing(p => ({ ...p, [id]: false })) }
  }

  return (
    <div className="p-6 space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500/20 border border-red-500/40 text-red-300' : 'bg-green-500/20 border border-green-500/40 text-green-300'}`}>
          {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />} {toast.msg}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Scheduled Posts</h1><p className="text-sm mt-1" style={{ color: '#555570' }}>Approved posts যা publish এর অপেক্ষায় আছে</p></div>
        <button onClick={load} className="btn-ghost flex items-center gap-2 text-sm"><RefreshCw size={13} className={loading ? 'loading-spin' : ''} /> Refresh</button>
      </div>

      {loading ? <div className="text-center py-16"><RefreshCw size={28} className="loading-spin mx-auto" style={{ color: '#e8192c' }} /></div>
      : drafts.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Calendar size={40} className="mx-auto mb-4" style={{ color: '#333350' }} />
          <p className="text-white font-medium mb-2">কোনো scheduled post নেই</p>
          <p className="text-sm" style={{ color: '#555570' }}>Posts approve করুন review page থেকে</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map(d => (
            <div key={d.id} className="glass rounded-xl p-4 flex items-center gap-4">
              {d.product_image && <img src={d.product_image} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold">{d.product_name || `Draft #${d.id}`}</h3>
                <p className="text-xs mt-1 line-clamp-1" style={{ color: '#555570' }}>{d.facebook_caption?.substring(0, 100)}...</p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock size={12} style={{ color: '#8b5cf6' }} />
                  <span className="text-xs" style={{ color: '#8b5cf6' }}>
                    {d.scheduled_at ? new Date(d.scheduled_at).toLocaleString('bn-BD') : 'Manual publish এর অপেক্ষায়'}
                  </span>
                </div>
                <div className="flex gap-1 mt-2">
                  {['📘', '📸', '🐦', '💼', '🧵'].map((e, i) => <span key={i} className="text-sm">{e}</span>)}
                </div>
              </div>
              <button onClick={() => handlePublish(d.id)} disabled={publishing[d.id]}
                className="btn-primary text-xs flex items-center gap-1.5 whitespace-nowrap">
                {publishing[d.id] ? <RefreshCw size={12} className="loading-spin" /> : <Send size={12} />}
                {publishing[d.id] ? 'Publishing...' : 'Publish Now'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
