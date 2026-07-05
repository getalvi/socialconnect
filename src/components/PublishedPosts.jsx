import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react'
import { getPublishedPosts } from '../api/client'

const PLATFORM_EMOJIS = { facebook: '📘', instagram: '📸', twitter: '🐦', linkedin: '💼', threads: '🧵' }

export default function PublishedPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = async () => {
    setLoading(true)
    try { const res = await getPublishedPosts(); setPosts(res.data.posts || []) }
    catch (e) {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 'all' ? posts : posts.filter(p => p.status === filter)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Published Posts</h1><p className="text-sm mt-1" style={{ color: '#555570' }}>সব platform এর publish history</p></div>
        <button onClick={load} className="btn-ghost flex items-center gap-2 text-sm"><RefreshCw size={13} className={loading ? 'loading-spin' : ''} /> Refresh</button>
      </div>
      <div className="flex gap-2">
        {[{ v: 'all', l: '📋 All' }, { v: 'published', l: '✅ Published' }, { v: 'failed', l: '❌ Failed' }].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)} className="px-3 py-1 rounded-full text-xs font-medium"
            style={filter === f.v ? { background: 'rgba(232,25,44,0.2)', color: '#e8192c', border: '1px solid rgba(232,25,44,0.4)' } : { background: 'rgba(255,255,255,0.05)', color: '#666', border: '1px solid transparent' }}>
            {f.l}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-16"><RefreshCw size={28} className="loading-spin mx-auto" style={{ color: '#e8192c' }} /></div>
      : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <CheckCircle size={40} className="mx-auto mb-4" style={{ color: '#333350' }} />
          <p className="text-white font-medium mb-2">কোনো post নেই</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <div key={p.id} className="glass rounded-xl p-4 flex items-center gap-4">
              <span className="text-2xl">{PLATFORM_EMOJIS[p.platform] || '📱'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium text-sm capitalize">{p.platform}</span>
                  {p.status === 'published' ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                  <span className={`text-xs ${p.status === 'published' ? 'text-green-400' : 'text-red-400'}`}>{p.status}</span>
                </div>
                <p className="text-xs line-clamp-1" style={{ color: '#555570' }}>{p.facebook_caption?.substring(0, 80)}...</p>
                {p.error_message && <p className="text-xs text-red-400 mt-1">❌ {p.error_message}</p>}
                <p className="text-xs mt-1" style={{ color: '#333350' }}>{p.published_at ? new Date(p.published_at).toLocaleString('bn-BD') : ''}</p>
              </div>
              {p.platform_post_id && (
                <a href="#" className="btn-ghost text-xs flex items-center gap-1"><ExternalLink size={12} /> View</a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
