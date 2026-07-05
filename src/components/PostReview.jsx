import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, RefreshCw, Edit3, Send, Hash, Clock, Image, ChevronDown, ChevronUp, AlertCircle, Sparkles } from 'lucide-react'
import { getDrafts, updateDraft, approveDraft, rejectDraft, publishNow, regenerateContent } from '../api/client'

const PLATFORMS = [
  { key: 'facebook_caption', label: 'Facebook', emoji: '📘' },
  { key: 'instagram_caption', label: 'Instagram', emoji: '📸' },
  { key: 'twitter_caption', label: 'Twitter/X', emoji: '🐦' },
  { key: 'linkedin_caption', label: 'LinkedIn', emoji: '💼' },
  { key: 'threads_caption', label: 'Threads', emoji: '🧵' },
]

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status === 'pending_approval' ? 'pending' : status}`}>
    {status === 'pending_approval' ? '⏳ Pending' : status === 'approved' ? '✅ Approved' : status === 'published' ? '🚀 Published' : status === 'rejected' ? '❌ Rejected' : status}
  </span>
)

export default function PostReview() {
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDraft, setSelectedDraft] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({})
  const [expandedPlatform, setExpandedPlatform] = useState('facebook_caption')
  const [toast, setToast] = useState(null)
  const [publishing, setPublishing] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [statusFilter, setStatusFilter] = useState('pending_approval')

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000) }

  const loadDrafts = async () => {
    setLoading(true)
    try { const res = await getDrafts(statusFilter); setDrafts(res.data.drafts || []) }
    catch (e) { showToast('Drafts load করতে সমস্যা', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadDrafts() }, [statusFilter])

  const openDraft = (draft) => { setSelectedDraft(draft); setEditData({ ...draft }); setEditMode(false); setExpandedPlatform('facebook_caption') }

  const handleSaveEdit = async () => {
    try {
      const payload = {}
      PLATFORMS.forEach(p => { if (editData[p.key] !== undefined) payload[p.key] = editData[p.key] })
      payload.hashtags = Array.isArray(editData.hashtags) ? JSON.stringify(editData.hashtags) : editData.hashtags
      payload.cta = editData.cta; payload.image_url = editData.image_url; payload.scheduled_at = editData.scheduled_at
      await updateDraft(selectedDraft.id, payload)
      showToast('✅ Draft updated!'); setEditMode(false); loadDrafts()
    } catch (e) { showToast('Update করতে সমস্যা', 'error') }
  }

  const handleApprove = async (id) => {
    try { await approveDraft(id); showToast('✅ Post approved!'); loadDrafts(); setSelectedDraft(null) }
    catch (e) { showToast('Approve করতে সমস্যা', 'error') }
  }

  const handleReject = async (id) => {
    const reason = prompt('Reject করার কারণ (optional):') || ''
    try { await rejectDraft(id, reason); showToast('Post rejected'); loadDrafts(); setSelectedDraft(null) }
    catch (e) { showToast('Reject করতে সমস্যা', 'error') }
  }

  const handlePublishNow = async (id) => {
    if (!confirm('এখনই সব platform এ publish করবেন?')) return
    setPublishing(true)
    try {
      const res = await publishNow(id)
      showToast(`🚀 ${res.data.success_count}/${res.data.total_platforms} platform এ publish হয়েছে!`)
      loadDrafts(); setSelectedDraft(null)
    } catch (e) { showToast(e.response?.data?.detail || 'Publish করতে সমস্যা', 'error') }
    finally { setPublishing(false) }
  }

  const handleRegenerate = async (id) => {
    setRegenerating(true); showToast('🤖 AI content regenerate করছে...')
    try {
      const res = await regenerateContent(id); showToast('✅ Content regenerate হয়েছে!')
      loadDrafts()
    } catch (e) { showToast('Regenerate করতে সমস্যা', 'error') }
    finally { setRegenerating(false) }
  }

  const parseHashtags = (h) => {
    if (!h) return []
    if (Array.isArray(h)) return h
    try { return JSON.parse(h) } catch { return h.split(' ').filter(Boolean) }
  }

  const parseAltCaptions = (a) => {
    if (!a) return []
    if (Array.isArray(a)) return a
    try { return JSON.parse(a) } catch { return [] }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500/20 border border-red-500/40 text-red-300' : 'bg-green-500/20 border border-green-500/40 text-green-300'}`}>
          {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />} {toast.msg}
        </div>
      )}

      {/* List Panel */}
      <div className={`flex flex-col border-r border-white/5 ${selectedDraft ? 'hidden lg:flex w-80' : 'flex-1'}`} style={{ background: '#08080f' }}>
        <div className="p-4 border-b border-white/5">
          <h1 className="text-xl font-bold text-white mb-3">Post Review</h1>
          <div className="flex gap-1.5 flex-wrap">
            {[{ v: 'pending_approval', l: '⏳ Pending' }, { v: 'approved', l: '✅ Approved' }, { v: 'rejected', l: '❌ Rejected' }, { v: null, l: '📋 All' }].map(f => (
              <button key={f.v || 'all'} onClick={() => { setStatusFilter(f.v); setSelectedDraft(null) }}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={statusFilter === f.v ? { background: 'rgba(232,25,44,0.2)', border: '1px solid rgba(232,25,44,0.4)', color: '#e8192c' } : { background: 'rgba(255,255,255,0.05)', border: '1px solid transparent', color: '#666' }}>
                {f.l}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? <div className="text-center py-12"><RefreshCw size={24} className="loading-spin mx-auto" style={{ color: '#e8192c' }} /></div>
          : drafts.length === 0 ? <div className="text-center py-12"><p className="text-sm" style={{ color: '#555570' }}>কোনো post নেই</p></div>
          : drafts.map(d => (
            <button key={d.id} onClick={() => openDraft(d)} className={`w-full text-left p-3 rounded-xl transition-all glass glass-hover`}
              style={selectedDraft?.id === d.id ? { background: 'rgba(232,25,44,0.1)', border: '1px solid rgba(232,25,44,0.3)' } : {}}>
              <div className="flex items-start gap-3">
                {d.product_image ? <img src={d.product_image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  : <div className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: '#0d0d1a' }}><Image size={16} style={{ color: '#333350' }} /></div>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-white truncate">{d.product_name || `Draft #${d.id}`}</p>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="text-xs line-clamp-2" style={{ color: '#555570' }}>{d.facebook_caption?.substring(0, 80)}...</p>
                  <p className="text-xs mt-1" style={{ color: '#333350' }}>{new Date(d.created_at).toLocaleDateString('bn-BD')}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedDraft ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedDraft(null)} className="lg:hidden btn-ghost text-sm p-2">←</button>
              <div><h2 className="text-white font-semibold">{selectedDraft.product_name || `Draft #${selectedDraft.id}`}</h2><StatusBadge status={selectedDraft.status} /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleRegenerate(selectedDraft.id)} disabled={regenerating} className="btn-ghost text-xs flex items-center gap-1.5">
                {regenerating ? <RefreshCw size={13} className="loading-spin" /> : <Sparkles size={13} />} Regenerate
              </button>
              {editMode ? <>
                <button onClick={() => setEditMode(false)} className="btn-ghost text-xs">Cancel</button>
                <button onClick={handleSaveEdit} className="btn-primary text-xs">Save</button>
              </> : <button onClick={() => setEditMode(true)} className="btn-ghost text-xs flex items-center gap-1.5"><Edit3 size={13} /> Edit</button>}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {(editData.image_url || selectedDraft.product_image) && (
              <div className="flex gap-3 items-center">
                <img src={editData.image_url || selectedDraft.product_image} alt="product" className="w-20 h-20 rounded-xl object-cover" />
                {editMode && <div className="flex-1"><label className="text-xs mb-1 block" style={{ color: '#a0a0c0' }}>Image URL</label><input className="input-field text-sm" value={editData.image_url || ''} onChange={e => setEditData(p => ({ ...p, image_url: e.target.value }))} /></div>}
              </div>
            )}

            {PLATFORMS.map(platform => (
              <div key={platform.key} className="glass rounded-xl overflow-hidden">
                <button onClick={() => setExpandedPlatform(expandedPlatform === platform.key ? null : platform.key)} className="w-full flex items-center justify-between p-3">
                  <div className="flex items-center gap-2"><span className="text-lg">{platform.emoji}</span><span className="font-medium text-white text-sm">{platform.label}</span><span className="text-xs" style={{ color: '#333350' }}>{editData[platform.key]?.length || 0} chars</span></div>
                  {expandedPlatform === platform.key ? <ChevronUp size={15} style={{ color: '#555570' }} /> : <ChevronDown size={15} style={{ color: '#555570' }} />}
                </button>
                {expandedPlatform === platform.key && (
                  <div className="px-3 pb-3">
                    {editMode ? <textarea className="textarea-field text-sm" rows={5} value={editData[platform.key] || ''} onChange={e => setEditData(p => ({ ...p, [platform.key]: e.target.value }))} />
                    : <div className="text-sm whitespace-pre-wrap p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)', color: '#c8c8e0', lineHeight: '1.7' }}>{selectedDraft[platform.key] || <span style={{ color: '#333350' }}>কোনো content নেই</span>}</div>}
                  </div>
                )}
              </div>
            ))}

            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3"><Hash size={15} style={{ color: '#e8192c' }} /><span className="text-sm font-medium text-white">Hashtags</span></div>
              <div className="flex flex-wrap gap-1.5">
                {parseHashtags(selectedDraft.hashtags).map((tag, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(232,25,44,0.1)', color: '#e8192c', border: '1px solid rgba(232,25,44,0.2)' }}>{tag}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-3">
                <p className="text-xs mb-1" style={{ color: '#555570' }}>Call to Action</p>
                {editMode ? <input className="input-field text-sm" value={editData.cta || ''} onChange={e => setEditData(p => ({ ...p, cta: e.target.value }))} />
                : <p className="text-sm text-white">{selectedDraft.cta || 'N/A'}</p>}
              </div>
              <div className="glass rounded-xl p-3">
                <div className="flex items-center gap-1 mb-1"><Clock size={12} style={{ color: '#555570' }} /><p className="text-xs" style={{ color: '#555570' }}>Schedule</p></div>
                {editMode ? <input type="datetime-local" className="input-field text-sm" value={editData.scheduled_at?.substring(0, 16) || ''} onChange={e => setEditData(p => ({ ...p, scheduled_at: e.target.value }))} />
                : <p className="text-sm text-white">{selectedDraft.scheduled_at ? new Date(selectedDraft.scheduled_at).toLocaleString('bn-BD') : 'Not set'}</p>}
              </div>
            </div>

            {parseAltCaptions(selectedDraft.alternative_captions).length > 0 && (
              <div className="glass rounded-xl p-4">
                <p className="text-sm font-medium text-white mb-3">✨ Alternative Captions</p>
                <div className="space-y-2">
                  {parseAltCaptions(selectedDraft.alternative_captions).map((alt, i) => (
                    <div key={i} className="p-3 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.03)', color: '#a0a0c0', lineHeight: '1.6' }}>
                      <span className="text-xs font-bold" style={{ color: '#555570' }}>Alt {i + 1}: </span>{alt}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedDraft.status === 'pending_approval' && (
            <div className="p-4 border-t border-white/5 flex gap-3 flex-shrink-0" style={{ background: '#08080f' }}>
              <button onClick={() => handleReject(selectedDraft.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                <XCircle size={16} /> Reject
              </button>
              <button onClick={() => handleApprove(selectedDraft.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                <CheckCircle size={16} /> Approve
              </button>
              <button onClick={() => handlePublishNow(selectedDraft.id)} disabled={publishing} className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm">
                {publishing ? <RefreshCw size={15} className="loading-spin" /> : <Send size={15} />} {publishing ? 'Publishing...' : 'Publish Now'}
              </button>
            </div>
          )}
          {selectedDraft.status === 'approved' && (
            <div className="p-4 border-t border-white/5 flex-shrink-0">
              <button onClick={() => handlePublishNow(selectedDraft.id)} disabled={publishing} className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                {publishing ? <RefreshCw size={15} className="loading-spin" /> : <Send size={16} />} {publishing ? 'সব Platform এ Publish হচ্ছে...' : '🚀 One-Click Publish to All Platforms'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 hidden lg:flex items-center justify-center" style={{ color: '#333350' }}>
          <div className="text-center"><Edit3 size={48} className="mx-auto mb-4 opacity-30" /><p className="text-lg font-medium">একটি post select করুন</p></div>
        </div>
      )}
    </div>
  )
}
