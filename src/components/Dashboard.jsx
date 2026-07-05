import { useState, useEffect } from 'react'
import {
  Package, Clock, CheckCircle, XCircle, AlertCircle,
  TrendingUp, RefreshCw, ChevronRight, Zap, Calendar,
  BarChart2, Activity
} from 'lucide-react'
import { getAnalytics } from '../api/client'

export default function Dashboard({ onNavigate }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const res = await getAnalytics()
      setData(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const overview = data?.overview || {}
  const platformStats = data?.platform_stats || []
  const recentLogs = data?.recent_logs || []

  const statCards = [
    { label: 'মোট Products', value: overview.total_products || 0, icon: Package, color: '#3b82f6', nav: 'products' },
    { label: 'Pending Approval', value: overview.pending_approval || 0, icon: AlertCircle, color: '#f59e0b', nav: 'review' },
    { label: 'Published Posts', value: overview.published || 0, icon: CheckCircle, color: '#22c55e', nav: 'published' },
    { label: 'Failed Posts', value: overview.failed || 0, icon: XCircle, color: '#ef4444', nav: 'published' },
    { label: 'Approved', value: overview.approved || 0, icon: Clock, color: '#8b5cf6', nav: 'scheduled' },
    { label: 'Rejected', value: overview.rejected || 0, icon: XCircle, color: '#6b7280', nav: 'review' },
  ]

  const platformColors = {
    facebook: '#1877f2',
    instagram: '#e1306c',
    twitter: '#1da1f2',
    linkedin: '#0077b5',
    threads: '#000000',
  }

  const platformEmojis = {
    facebook: '📘',
    instagram: '📸',
    twitter: '🐦',
    linkedin: '💼',
    threads: '🧵',
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: '#555570' }}>
            আপনার Social Media Automation Overview
          </p>
        </div>
        <button onClick={load} className="btn-ghost flex items-center gap-2 text-sm">
          <RefreshCw size={15} className={loading ? 'loading-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Welcome Banner */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
           style={{
             background: 'linear-gradient(135deg, rgba(232,25,44,0.15), rgba(139,92,246,0.1))',
             border: '1px solid rgba(232,25,44,0.2)'
           }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(232,25,44,0.2)' }}>
            <Zap size={24} style={{ color: '#e8192c' }} />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">AI Social Media Automation 🚀</h2>
            <p className="text-sm" style={{ color: '#a0a0c0' }}>
              Product fetch করুন → AI research → Content generate → Review → Publish!
            </p>
          </div>
          <button onClick={() => onNavigate('products')}
                  className="ml-auto btn-primary flex items-center gap-2 text-sm">
            শুরু করুন <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <button key={i} onClick={() => card.nav && onNavigate(card.nav)}
                    className="stat-card text-left group cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ background: `${card.color}20` }}>
                  <Icon size={20} style={{ color: card.color }} />
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: '#e8192c' }} />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {loading ? '...' : card.value}
              </div>
              <div className="text-xs" style={{ color: '#555570' }}>{card.label}</div>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Performance */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={18} style={{ color: '#e8192c' }} />
            <h3 className="font-semibold text-white">Platform Performance</h3>
          </div>
          {platformStats.length === 0 ? (
            <div className="text-center py-8" style={{ color: '#333350' }}>
              <p className="text-sm">কোনো published post নেই এখনো</p>
              <p className="text-xs mt-1">Products add করুন এবং workflow run করুন</p>
            </div>
          ) : (
            <div className="space-y-3">
              {platformStats.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{platformEmojis[p.platform] || '📱'}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize text-white font-medium">{p.platform}</span>
                      <span style={{ color: '#555570' }}>{p.success}/{p.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-1.5 rounded-full transition-all"
                           style={{
                             width: p.count > 0 ? `${(p.success / p.count) * 100}%` : '0%',
                             background: platformColors[p.platform] || '#e8192c'
                           }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} style={{ color: '#e8192c' }} />
            <h3 className="font-semibold text-white">Recent Activity</h3>
          </div>
          {recentLogs.length === 0 ? (
            <div className="text-center py-8" style={{ color: '#333350' }}>
              <p className="text-sm">কোনো activity নেই</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentLogs.slice(0, 6).map((log, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl"
                     style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    log.status === 'done' ? 'bg-green-500' :
                    log.status === 'running' ? 'bg-yellow-500' :
                    log.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{log.message}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#333350' }}>
                      {log.step} • {new Date(log.created_at).toLocaleTimeString('bn-BD')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-2xl p-5">
        <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Products Fetch করুন', icon: '📦', nav: 'products' },
            { label: 'Posts Review করুন', icon: '✅', nav: 'review' },
            { label: 'AI কে জিজ্ঞেস করুন', icon: '🤖', nav: 'ai-chat' },
            { label: 'Analytics দেখুন', icon: '📊', nav: 'analytics' },
          ].map((action, i) => (
            <button key={i} onClick={() => onNavigate(action.nav)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all glass-hover">
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs text-center" style={{ color: '#a0a0c0' }}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
