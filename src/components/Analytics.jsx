import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { RefreshCw, TrendingUp, BarChart2 } from 'lucide-react'
import { getAnalytics } from '../api/client'

const PC = { facebook:'#1877f2', instagram:'#e1306c', twitter:'#1da1f2', linkedin:'#0077b5', threads:'#888' }
const CT = ({ active, payload, label }) => active && payload?.length ? (
  <div className="glass px-3 py-2 rounded-xl text-xs">{payload.map((p,i)=><p key={i} style={{color:p.color||'#e8192c'}}>{p.name}: {p.value}</p>)}</div>
) : null

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const load = async () => { setLoading(true); try { const r=await getAnalytics(); setData(r.data) } catch(e){} finally{setLoading(false)} }
  useEffect(()=>{load()},[])

  const ov=data?.overview||{}, ps=data?.platform_stats||[], ds=data?.daily_stats||[]
  const bars=[{name:'Products',value:ov.total_products||0,fill:'#3b82f6'},{name:'Pending',value:ov.pending_approval||0,fill:'#f59e0b'},
    {name:'Approved',value:ov.approved||0,fill:'#8b5cf6'},{name:'Published',value:ov.published||0,fill:'#22c55e'},
    {name:'Failed',value:ov.failed||0,fill:'#ef4444'},{name:'Rejected',value:ov.rejected||0,fill:'#6b7280'}]
  const pie=ps.map(p=>({name:p.platform,value:p.count||0,color:PC[p.platform]||'#888'}))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Analytics</h1><p className="text-sm mt-1" style={{color:'#555570'}}>Social media performance overview</p></div>
        <button onClick={load} className="btn-ghost flex items-center gap-2 text-sm"><RefreshCw size={13} className={loading?'loading-spin':''}/> Refresh</button>
      </div>
      {loading ? <div className="text-center py-16"><RefreshCw size={28} className="loading-spin mx-auto" style={{color:'#e8192c'}}/></div> : <>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {bars.map((item,i)=>(<div key={i} className="stat-card text-center"><div className="text-2xl font-bold text-white mb-1">{item.value}</div><div className="text-xs" style={{color:'#555570'}}>{item.name}</div><div className="mt-2 h-1 rounded-full" style={{background:`${item.fill}40`}}><div className="h-1 rounded-full" style={{background:item.fill,width:item.value>0?'100%':'0%'}}/></div></div>))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4"><BarChart2 size={16} style={{color:'#e8192c'}}/><h3 className="font-semibold text-white">Content Overview</h3></div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bars} margin={{top:5,right:5,left:-20,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                <XAxis dataKey="name" tick={{fill:'#555570',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#555570',fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CT/>}/>
                <Bar dataKey="value" radius={[6,6,0,0]}>{bars.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4"><TrendingUp size={16} style={{color:'#e8192c'}}/><h3 className="font-semibold text-white">Platform Distribution</h3></div>
            {pie.length===0 ? <div className="flex items-center justify-center h-52" style={{color:'#333350'}}><p className="text-sm">কোনো published post নেই</p></div> : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart><Pie data={pie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">{pie.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip content={<CT/>}/></PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2">{pie.map((p,i)=><div key={i} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{background:p.color}}/><span className="text-xs capitalize" style={{color:'#a0a0c0'}}>{p.name}</span><span className="text-xs font-bold text-white">{p.value}</span></div>)}</div>
              </div>
            )}
          </div>
        </div>
        {ds.length>0 && (
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4"><TrendingUp size={16} style={{color:'#e8192c'}}/><h3 className="font-semibold text-white">Daily Posts (Last 7 Days)</h3></div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={ds} margin={{top:5,right:5,left:-20,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                <XAxis dataKey="date" tick={{fill:'#555570',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#555570',fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CT/>}/>
                <Line type="monotone" dataKey="count" stroke="#e8192c" strokeWidth={2} dot={{fill:'#e8192c',r:4}} name="Posts"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {ps.length>0 && (
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4">Platform Success Rate</h3>
            <div className="space-y-3">{ps.map((p,i)=>{const r=p.count>0?Math.round((p.success/p.count)*100):0; return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm capitalize w-20 text-white">{p.platform}</span>
                <div className="flex-1 h-2 rounded-full" style={{background:'rgba(255,255,255,0.05)'}}><div className="h-2 rounded-full" style={{width:`${r}%`,background:PC[p.platform]||'#e8192c'}}/></div>
                <span className="text-xs font-bold w-12 text-right" style={{color:PC[p.platform]||'#e8192c'}}>{r}%</span>
                <span className="text-xs" style={{color:'#555570'}}>{p.success}/{p.count}</span>
              </div>
            )})}</div>
          </div>
        )}
      </>}
    </div>
  )
}
