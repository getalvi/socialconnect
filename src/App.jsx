import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Package, Clock, CheckCircle, XCircle,
  MessageSquareText, BarChart3, Settings, Menu, X,
  Zap, Bell, ChevronRight, AlertCircle, Calendar
} from 'lucide-react'
import Dashboard from './components/Dashboard'
import ProductManager from './components/ProductManager'
import PostReview from './components/PostReview'
import ScheduledPosts from './components/ScheduledPosts'
import PublishedPosts from './components/PublishedPosts'
import AIChat from './components/AIChat'
import Analytics from './components/Analytics'
import SettingsPage from './components/SettingsPage'
import { getAnalytics } from './api/client'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'review', label: 'Pending Review', icon: AlertCircle, badge: 'pending' },
  { id: 'scheduled', label: 'Scheduled', icon: Calendar, badge: 'scheduled' },
  { id: 'published', label: 'Published', icon: CheckCircle },
  { id: 'ai-chat', label: 'AI Assistant', icon: MessageSquareText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [stats, setStats] = useState({ pending_approval: 0 })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await getAnalytics()
        setStats(res.data.overview || {})
      } catch (e) {}
    }
    loadStats()
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={setPage} />
      case 'products': return <ProductManager />
      case 'review': return <PostReview />
      case 'scheduled': return <ScheduledPosts />
      case 'published': return <PublishedPosts />
      case 'ai-chat': return <AIChat />
      case 'analytics': return <Analytics />
      case 'settings': return <SettingsPage />
      default: return <Dashboard onNavigate={setPage} />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080810' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col transition-all duration-300 flex-shrink-0"
        style={{
          width: sidebarOpen ? '220px' : '64px',
          background: 'rgba(10, 10, 22, 0.98)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #e8192c, #c21525)' }}>
            <Zap size={18} className="text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <div className="font-bold text-sm text-white leading-tight">SocialAI</div>
              <div className="text-xs" style={{ color: '#e8192c' }}>Automation</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto p-1 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: '#555570' }}
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = page === item.id
            const badgeCount = item.badge === 'pending' ? stats.pending_approval : 0

            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left group relative ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(232,25,44,0.2), rgba(194,21,37,0.1))',
                  borderLeft: '2px solid #e8192c',
                } : {}}
              >
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    {badgeCount > 0 && (
                      <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: '#e8192c', color: 'white', minWidth: '18px', textAlign: 'center' }}>
                        {badgeCount}
                      </span>
                    )}
                  </>
                )}
                {!sidebarOpen && badgeCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 text-xs font-bold rounded-full flex items-center justify-center"
                        style={{ background: '#e8192c', color: 'white' }}>
                    {badgeCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-3 border-t border-white/5">
            <div className="text-xs text-center" style={{ color: '#333350' }}>
              AI Digital Marketing v1.0
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  )
}
