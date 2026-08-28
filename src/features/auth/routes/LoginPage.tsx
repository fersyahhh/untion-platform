import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthLayout from "../components/AuthLayout";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../contexts/LanguageContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
    >
      <form className="space-y-5" method="POST" onSubmit={handleLogin}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-brown mb-2"
          >
            {t('auth.login.email')}
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
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-brown"
            >
              {t('auth.login.password')}
            </label>
            <a
              href="#"
              className="text-xs font-semibold text-teal hover:text-teal-light"
            >
              {t('auth.login.forgotPassword')}
            </a>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-xl border border-warm-border px-4 py-3 text-brown placeholder-brown-muted focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal text-base bg-cream-warm/50"
            placeholder="••••••••"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-full bg-teal px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-teal-light hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? t('auth.login.signingIn') : t('auth.login.button')}
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
              {t('auth.login.noAccount')}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <Link
            to="/register"
            className="flex w-full justify-center rounded-full border-2 border-warm-border bg-white px-4 py-3 text-sm font-semibold text-brown shadow-sm hover:border-brown/20 hover:bg-cream-warm transition-all"
          >
            {t('auth.login.createAccount')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
