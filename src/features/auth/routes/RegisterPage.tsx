import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../contexts/LanguageContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (signUpError) throw signUpError;

      toast.success("Account created successfully!");
      // Auto redirect to dashboard on success (or we can redirect to a check email page, but for hackathon let's just go to dashboard if session exists or if email confirmation is off)
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('auth.register.title')}
      subtitle={t('auth.register.subtitle')}
    >
      <form className="space-y-4" method="POST" onSubmit={handleRegister}>
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-brown mb-2"
          >
            {t('auth.register.username')}
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="block w-full rounded-xl border border-warm-border px-4 py-3 text-brown placeholder-brown-muted focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal text-base bg-cream-warm/50"
            placeholder="johndoe"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-brown mb-2"
          >
            {t('auth.register.email')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-xl border border-warm-border px-4 py-3 text-brown placeholder-brown-muted focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal text-base bg-cream-warm/50"
            placeholder="you@university.edu"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-brown mb-2"
          >
            {t('auth.register.password')}
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border border-warm-border px-4 py-3 pr-12 text-brown placeholder-brown-muted focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal text-base bg-cream-warm/50"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-muted hover:text-brown transition-colors p-1"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-brown-muted">
            {t('auth.register.passwordHint')}
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-full bg-teal px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-teal-light hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? t('auth.register.creating') : t('auth.register.button')}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-warm-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-brown-muted">
              {t('auth.register.haveAccount')}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <Link
            to="/login"
            className="flex w-full justify-center rounded-full border-2 border-warm-border bg-white px-4 py-3 text-sm font-semibold text-brown shadow-sm hover:border-brown/20 hover:bg-cream-warm transition-all"
          >
            {t('auth.register.signIn')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
