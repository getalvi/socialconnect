import { AuthProvider } from "@/hooks/useAuth";
import Login from "./login";
import Register from "./register";

export const metadata = { title: "Auth - SocialConnect AI" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center bg-surface-950 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-400">SocialConnect AI</h1>
            <p className="text-surface-400 mt-2">AI-Powered Digital Marketing Platform</p>
          </div>
          {children}
        </div>
      </div>
    </AuthProvider>
  );
}