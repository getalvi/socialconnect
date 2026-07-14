"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { SocialAccount } from "@/types";
import { PLATFORMS } from "@/lib/constants";
import {
  Link as LinkIcon, Unlink, RefreshCw, ExternalLink,
  Loader2, Plus, Check, X, Users,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ConnectionsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [platforms, setPlatforms] = useState<{ id: string; name: string; icon: string; enabled: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<SocialAccount[]>("/social"),
      api.get<{ platforms: { id: string; name: string; icon: string; enabled: boolean }[] }>("/social/platforms"),
    ]).then(([accs, plats]) => {
      setAccounts(accs);
      setPlatforms(plats.platforms);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function connectPlatform(platform: string) {
    setConnecting(platform);
    try {
      const data = await api.post<{ authorization_url: string; state: string }>(`/social/connect/${platform}`);
      window.open(data.authorization_url, "_blank", "width=600,height=700");
      toast.success("Opening OAuth window. Complete the connection there.");
    } catch (e) {
      toast.error("Failed to initiate connection");
    }
    setConnecting(null);
  }

  async function disconnectAccount(id: string) {
    if (!confirm("Disconnect this account?")) return;
    setDisconnecting(id);
    try {
      await api.delete(`/social/${id}`);
      setAccounts(accounts.filter(a => a.id !== id));
      toast.success("Account disconnected");
    } catch { toast.error("Failed to disconnect"); }
    setDisconnecting(null);
  }

  const connectedPlatformIds = new Set(accounts.map(a => a.platform));

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i=><div key={i} className="card h-36 skeleton" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Social Connections</h1>
        <p className="text-surface-400 text-sm mt-1">Connect and manage your social media accounts</p>
      </div>

      {/* Connected Accounts */}
      {accounts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Connected Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => {
              const platform = PLATFORMS.find(p => p.id === acc.platform);
              return (
                <div key={acc.id} className="card-hover">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: platform?.color || "#666" }}>
                      {acc.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{acc.display_name || acc.username}</p>
                      <p className="text-sm text-surface-400">@{acc.username}</p>
                      <p className="text-xs text-surface-500">{platform?.name}</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-green-400" title="Active" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4 text-center">
                    <div className="bg-surface-800 rounded-lg p-2">
                      <p className="text-lg font-bold">{formatNum(acc.followers_count)}</p>
                      <p className="text-xs text-surface-500">Followers</p>
                    </div>
                    <div className="bg-surface-800 rounded-lg p-2">
                      <p className="text-lg font-bold">{formatNum(acc.following_count)}</p>
                      <p className="text-xs text-surface-500">Following</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => disconnectAccount(acc.id)}
                      disabled={disconnecting === acc.id}
                      className="btn-secondary flex-1 text-xs py-1.5 text-red-400 border-red-800/50 hover:bg-red-900/20"
                    >
                      {disconnecting === acc.id ? <Loader2 size={14} className="animate-spin" /> : <><Unlink size={14} /> Disconnect</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Platforms */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Available Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.filter(p => !connectedPlatformIds.has(p.id)).map((platform) => {
            const isConnected = connectedPlatformIds.has(platform.id);
            const p = PLATFORMS.find(x => x.id === platform.id);
            return (
              <div key={platform.id} className={`card ${!platform.enabled ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: p?.color || "#666" }}>
                    {platform.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{platform.name}</p>
                    {!platform.enabled && <p className="text-xs text-yellow-500">Configure API credentials first</p>}
                  </div>
                </div>
                <button
                  onClick={() => connectPlatform(platform.id)}
                  disabled={!platform.enabled || connecting === platform.id}
                  className={`w-full ${platform.enabled ? "btn-primary" : "btn-secondary"} text-sm`}
                >
                  {connecting === platform.id ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Connect</>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}