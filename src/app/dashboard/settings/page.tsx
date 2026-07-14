"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import {
  User, Key, Shield, Bell, Palette, Save, Loader2,
  Eye, EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved successfully");
    }, 1000);
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-surface-400 text-sm mt-1">Manage your account and application preferences</p>
      </div>

      {/* Profile */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><User size={18} /> Profile</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-400 font-bold text-xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-surface-400">{user?.email}</p>
            <span className="badge badge-info mt-1">{user?.plan}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Key size={18} /> API Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="label">OpenRouter API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                defaultValue="sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx"
                className="input-field pr-10"
              />
              <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300">
                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-surface-500 mt-1">Get your key from openrouter.ai/keys</p>
          </div>
          <div>
            <label className="label">Default AI Model</label>
            <select className="input-field">
              <option>google/gemini-2.0-flash-exp:free</option>
              <option>anthropic/claude-3.5-sonnet</option>
              <option>openai/gpt-4o</option>
              <option>meta-llama/llama-3.1-70b-instruct</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Bell size={18} /> Notifications</h3>
        <div className="space-y-3">
          {[
            { label: "Post published successfully", default: true },
            { label: "Post failed to publish", default: true },
            { label: "AI generation completed", default: true },
            { label: "Weekly analytics report", default: false },
            { label: "New trend alerts", default: true },
          ].map((item) => (
            <label key={item.label} className="flex items-center justify-between py-2 cursor-pointer">
              <span className="text-sm">{item.label}</span>
              <div className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${item.default ? "bg-brand-600" : "bg-surface-700"}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${item.default ? "translate-x-5" : "translate-x-1"}`} />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}