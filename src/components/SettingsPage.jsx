import { useState, useEffect } from 'react'
import { Save, Eye, EyeOff, RefreshCw, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { getSettings, updateSettings } from '../api/client'

const SECTIONS = [
  { title: '🤖 AI Configuration', fields: [
    { key: 'openrouter_api_key', label: 'OpenRouter API Key', placeholder: 'sk-or-v1-...', secret: true, hint: 'openrouter.ai থেকে নিন। Free models available।' }
  ]},
  { title: '🌐 Website', fields: [
    { key: 'website_url', label: 'আপনার Website URL', placeholder: 'https://yourshop.com.bd', hint: 'Product fetch এর জন্য e-commerce website URL' }
  ]},
  { title: '📘 Facebook', fields: [
    { key: 'fb_page_id', label: 'Facebook Page ID', placeholder: '123456789012345', hint: 'Page Settings > About > Page ID' },
    { key: 'fb_page_access_token', label: 'Page Access Token', placeholder: 'EAAxxxxxxxx...', secret: true, hint: 'Meta Developer Dashboard থেকে নিন' }
  ]},
  { title: '📸 Instagram', fields: [
    { key: 'ig_user_id', label: 'Instagram Business User ID', placeholder: '17841400...', hint: 'Meta Business Suite > Instagram Account ID' },
    { key: 'ig_access_token', label: 'Instagram Access Token', placeholder: 'EAAxxxxxxxx...', secret: true, hint: 'Facebook Page এর same token' }
  ]},
  { title: '🐦 Twitter / X', fields: [
    { key: 'twitter_api_key', label: 'API Key', placeholder: 'xxxxxxxxxxxxxxxx', secret: true },
    { key: 'twitter_api_secret', label: 'API Secret', placeholder: 'xxxxxxxxxxxxxxxx', secret: true },
    { key: 'twitter_access_token', label: 'Access Token', placeholder: '123456-xxxxxxxx', secret: true },
    { key: 'twitter_access_secret', label: 'Access Token Secret', placeholder: 'xxxxxxxxxxxxxxxx', secret: true, hint: 'developer.twitter.com থেকে নিন' }
  ]},
  { title: '💼 LinkedIn', fields: [
    { key: 'linkedin_person_id', label: 'Person URN ID', placeholder: 'xxxxxxxx' },
    { key: 'linkedin_access_token', label: 'Access Token', placeholder: 'AQxxxxxxxxx...', secret: true, hint: 'LinkedIn Developer Apps > OAuth token' }
  ]},
  { title: '🧵 Threads', fields: [
    { key: 'threads_user_id', label: 'Threads User ID', placeholder: '17841400...' },
    { key: 'threads_access_token', label: 'Access Token', placeholder: 'THRxxxxxxxxx...', secret: true }
  ]},
]

export default function SettingsPage() {
  const [values, setValues] = useState({})
  const [showSecrets, setShowSecrets] = useState({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),4000) }

  useEffect(()=>{
    const load = async()=>{
      try { const r=await getSettings(); setValues(r.data) }
      catch(e){ showToast('Settings load করতে সমস্যা','error') }
      finally { setLoading(false) }
    }; load()
  },[])

  const handleSave = async()=>{
    setSaving(true)
    try {
      const payload={}
      Object.entries(values).forEach(([k,v])=>{ if(v&&!v.includes('****')) payload[k]=v })
      await updateSettings(payload)
      showToast('✅ Settings saved!')
    } catch(e){ showToast('Save করতে সমস্যা','error') }
    finally { setSaving(false) }
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {toast&&<div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl flex items-center gap-2 ${toast.type==='error'?'bg-red-500/20 border border-red-500/40 text-red-300':'bg-green-500/20 border border-green-500/40 text-green-300'}`}>{toast.type==='error'?<AlertCircle size={15}/>:<CheckCircle size={15}/>}{toast.msg}</div>}

      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Settings</h1><p className="text-sm mt-1" style={{color:'#555570'}}>API keys এবং platform configurations</p></div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving?<RefreshCw size={15} className="loading-spin"/>:<Save size={15}/>} {saving?'Saving...':'Save All'}
        </button>
      </div>

      <div className="rounded-xl p-4" style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)'}}>
        <p className="text-sm font-semibold" style={{color:'#f59e0b'}}>⚠️ গুরুত্বপূর্ণ</p>
        <p className="text-xs mt-1" style={{color:'#a0a0c0'}}>Social media তে post করতে প্রতিটি platform এর API access দরকার। Facebook/Instagram এর জন্য Meta Business Account, Twitter এর জন্য Developer Account লাগবে। OpenRouter API Key দিয়ে AI content generation হবে।</p>
      </div>

      {loading ? <div className="text-center py-12"><RefreshCw size={24} className="loading-spin mx-auto" style={{color:'#e8192c'}}/></div>
      : SECTIONS.map((section,si)=>(
        <div key={si} className="glass rounded-2xl p-5">
          <h3 className="font-bold text-white mb-4 pb-2 border-b border-white/5">{section.title}</h3>
          <div className="space-y-4">
            {section.fields.map((field,fi)=>(
              <div key={fi}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium" style={{color:'#a0a0c0'}}>{field.label}</label>
                  {values[field.key]&&values[field.key].includes('****')&&<span className="text-xs" style={{color:'#22c55e'}}>✅ Configured</span>}
                </div>
                <div className="relative">
                  <input className="input-field pr-10" type={field.secret&&!showSecrets[field.key]?'password':'text'}
                    placeholder={field.placeholder} value={values[field.key]||''}
                    onChange={e=>setValues(p=>({...p,[field.key]:e.target.value}))}/>
                  {field.secret&&<button onClick={()=>setShowSecrets(p=>({...p,[field.key]:!p[field.key]}))} className="absolute right-3 top-1/2 -translate-y-1/2" style={{color:'#555570'}}>
                    {showSecrets[field.key]?<EyeOff size={15}/>:<Eye size={15}/>}
                  </button>}
                </div>
                {field.hint&&<p className="text-xs mt-1" style={{color:'#444460'}}>{field.hint}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="glass rounded-2xl p-5">
        <h3 className="font-bold text-white mb-4">📚 API Setup Guides</h3>
        <div className="space-y-2">
          {[
            {label:'Meta (Facebook & Instagram) Developer',url:'https://developers.facebook.com/docs/graph-api'},
            {label:'Twitter Developer Portal',url:'https://developer.twitter.com'},
            {label:'LinkedIn Developer Docs',url:'https://developer.linkedin.com'},
            {label:'OpenRouter - Free AI Models',url:'https://openrouter.ai'},
            {label:'Threads API Docs',url:'https://developers.facebook.com/docs/threads'},
          ].map((link,i)=>(
            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl transition-all glass-hover">
              <span className="text-sm" style={{color:'#a0a0c0'}}>{link.label}</span>
              <ExternalLink size={13} style={{color:'#e8192c'}}/>
            </a>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
        {saving?<RefreshCw size={16} className="loading-spin"/>:<Save size={16}/>} {saving?'Saving...':'সব Settings Save করুন'}
      </button>
    </div>
  )
}
