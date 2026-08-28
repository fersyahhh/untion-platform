import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Users, ArrowRight } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../contexts/LanguageContext";
import logoUntion from "../../../assets/icon-untion.png";

function getInitials(name: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export default function DashboardPage() {
  const [username, setUsername] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && user.user_metadata?.username) {
        setUsername(user.user_metadata.username);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-cream flex flex-col font-body">
      {/* Simple Authenticated Navbar */}
      <nav className="h-20 border-b border-warm-border bg-white/50 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between sticky top-0 z-50">
        <Link to="/dashboard" className="flex items-center gap-1.5">
          <img 
            src={logoUntion} 
            alt="Untion Logo" 
            className="h-12 w-12 object-contain transition-all duration-200 hover:scale-110"
          />
          <span className="font-display text-xl font-bold text-brown">
            Untion
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-sm font-semibold text-brown hover:text-teal transition-colors"
          >
            {t('dashboard.home')}
          </Link>
          <div className="h-4 w-px bg-warm-border" />
          <div
            className="h-9 w-9 rounded-full bg-teal/10 border border-teal/20 flex items-center justify-center"
            title={username}
          >
            <span className="text-teal font-bold text-sm">
              {getInitials(username)}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal/5 via-transparent to-transparent opacity-60" />

        <div className="relative z-10 w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold tracking-tight text-brown sm:text-5xl drop-shadow-sm mb-4">
              {t('dashboard.title')}
            </h1>
            <p className="text-lg text-brown-muted max-w-2xl mx-auto">
              {t('dashboard.subtitle')}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Solo Practice Card */}
            <Link
              to="/practice/solo"
              className="group relative flex flex-col rounded-3xl border border-warm-border bg-white p-8 shadow-sm transition-all duration-300 hover:border-teal/30 hover:shadow-xl hover:shadow-teal/5 hover:-translate-y-1"
            >
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-cream-warm text-brown transition-colors duration-300 group-hover:bg-teal group-hover:text-white">
                <User className="h-8 w-8" />
              </div>
              <h3 className="font-display text-2xl font-bold text-brown mb-3">
                {t('dashboard.soloPractice')}
              </h3>
              <p className="text-brown-muted leading-relaxed flex-1">
                {t('dashboard.soloPracticeDesc')}
              </p>
              <div className="mt-8 flex items-center gap-2 font-bold text-teal transition-transform duration-300 group-hover:translate-x-2">
                {t('dashboard.startSolo')} <ArrowRight className="h-5 w-5" />
              </div>
            </Link>

            {/* Group Practice Card */}
            <Link
              to="/practice/group"
              className="group relative flex flex-col rounded-3xl border border-warm-border bg-white p-8 shadow-sm transition-all duration-300 hover:border-brown/30 hover:shadow-xl hover:shadow-brown/5 hover:-translate-y-1"
            >
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-cream-warm text-brown transition-colors duration-300 group-hover:bg-brown group-hover:text-white">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="font-display text-2xl font-bold text-brown mb-3">
                {t('dashboard.groupPractice')}
              </h3>
              <p className="text-brown-muted leading-relaxed flex-1">
                {t('dashboard.groupPracticeDesc')}
              </p>
              <div className="mt-8 flex items-center gap-2 font-bold text-brown transition-transform duration-300 group-hover:translate-x-2">
                {t('dashboard.createRoom')} <ArrowRight className="h-5 w-5" />
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
