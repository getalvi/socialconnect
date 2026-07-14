'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';

export function AuthPage() {
  const { login } = useAuthStore();
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoginLoading(true);
    try {
      const res = await api.post('/api/auth/login', loginForm);
      if (res.success && res.data) {
        const d = res.data as { user: { id: string; email: string; name: string | null; role: string; avatar: string | null }; token: string; refreshToken: string };
        login(d.token, d.refreshToken, d.user);
        toast.success('Welcome back!');
      } else {
        toast.error(res.error || 'Login failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async () => {
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (registerForm.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setRegisterLoading(true);
    try {
      const res = await api.post('/api/auth/register', {
        email: registerForm.email,
        password: registerForm.password,
        name: registerForm.name || undefined,
      });
      if (res.success && res.data) {
        const d = res.data as { user: { id: string; email: string; name: string | null; role: string; avatar: string | null }; token: string; refreshToken: string };
        login(d.token, d.refreshToken, d.user);
        toast.success('Account created successfully!');
      } else {
        toast.error(res.error || 'Registration failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">SocialConnect AI</h1>
          </div>
          <p className="text-muted-foreground">AI-Powered Digital Marketing Platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" className="flex items-center gap-1.5">
                  <LogIn className="h-3.5 w-3.5" /> Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" /> Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="you@example.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" placeholder="Enter password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                </div>
                <Button className="w-full" onClick={handleLogin} disabled={loginLoading}>
                  {loginLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Name (optional)</Label>
                  <Input id="reg-name" placeholder="Your name" value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" type="email" placeholder="you@example.com" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input id="reg-password" type="password" placeholder="Min 8 characters" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm">Confirm Password</Label>
                  <Input id="reg-confirm" type="password" placeholder="Repeat password" value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleRegister()} />
                </div>
                <Button className="w-full" onClick={handleRegister} disabled={registerLoading}>
                  {registerLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}