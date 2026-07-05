import { useState, useEffect, useRef } from 'react'
import { Send, RefreshCw, Trash2, Bot, User, Sparkles } from 'lucide-react'
import { sendChatMessage, clearChatHistory } from '../api/client'

const QUICK = [
  "Trending hashtags suggest করো",
  "Best posting time বলো",
  "Eid এর জন্য Facebook post লিখো",
  "Engagement বাড়ানোর tips দাও",
  "Instagram caption strategy কী?",
  "Product launch post লিখে দাও",
]

export default function AIChat() {
  const [messages, setMessages] = useState([{
    role: 'assistant', id: 'welcome',
    content: `আস্সালামু আলাইকুম! 👋 আমি আপনার AI Digital Marketing Assistant।\n\nআমি সাহায্য করতে পারি:\n📝 Social media content তৈরিতে\n#️⃣ Trending hashtags খুঁজে পেতে\n📅 Best posting time suggest করতে\n📊 Marketing strategy তে\n🚀 Engagement বাড়ানোর tips এ\n\nআজকে কী নিয়ে কাজ করব? 😊`
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    const userMsg = { role: 'user', content: msg, id: Date.now() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setLoading(true)
    try {
      const api = updated.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, content: m.content }))
      const res = await sendChatMessage(api)
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response, id: Date.now() + 1 }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ দুঃখিত, connect করতে পারছি না। Backend URL settings এ check করুন।', id: Date.now() + 1 }])
    } finally { setLoading(false) }
  }

  const fmt = (text) => text.split('\n').map((l, i, a) => <span key={i}>{l}{i < a.length - 1 && <br />}</span>)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center glow-pulse" style={{ background: 'linear-gradient(135deg, #e8192c, #c21525)' }}><Bot size={20} className="text-white" /></div>
          <div><h1 className="text-lg font-bold text-white">AI Marketing Assistant</h1><p className="text-xs" style={{ color: '#22c55e' }}>🟢 Online • poolside/laguna-m.1</p></div>
        </div>
        <button onClick={async () => { if(confirm('Clear chat?')) { await clearChatHistory(); setMessages([{ role: 'assistant', id: 'c', content: 'Chat clear! নতুন কিছু জানতে চান? 😊' }]) }}} className="btn-ghost text-xs flex items-center gap-1.5"><Trash2 size={13} /> Clear</button>
      </div>

      <div className="px-4 py-3 border-b border-white/5 overflow-x-auto flex-shrink-0">
        <div className="flex gap-2 pb-1">
          {QUICK.map((p, i) => (
            <button key={i} onClick={() => send(p)} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(232,25,44,0.1)', color: '#e8192c', border: '1px solid rgba(232,25,44,0.2)' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-white/10' : 'bg-gradient-to-br from-red-600 to-red-800'}`}>
              {msg.role === 'user' ? <User size={15} className="text-white" /> : <Bot size={15} className="text-white" />}
            </div>
            <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
              style={msg.role === 'user' ? { background: 'rgba(232,25,44,0.15)', border: '1px solid rgba(232,25,44,0.2)', color: '#e8e8f0', borderTopRightRadius: '4px' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: '#d0d0e8', borderTopLeftRadius: '4px' }}>
              {fmt(msg.content)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-600 to-red-800"><Bot size={15} className="text-white" /></div>
            <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex gap-1.5 items-center h-5">
                {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#e8192c', animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="flex gap-3 items-end">
          <textarea className="textarea-field flex-1 text-sm" placeholder="Marketing question জিজ্ঞেস করুন..." rows={2} value={input}
            onChange={e => setInput(e.target.value)} style={{ minHeight: '60px', maxHeight: '120px', resize: 'none' }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} />
          <button onClick={() => send()} disabled={loading || !input.trim()} className="btn-primary w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0 p-0">
            {loading ? <RefreshCw size={16} className="loading-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: '#333350' }}>Enter to send • Shift+Enter for new line</p>
      </div>
    </div>
  )
}
