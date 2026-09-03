import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight, Globe } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../contexts/LanguageContext";
import logoUntion from "../../../assets/icon-untion.png";

const navLinks = [
  { label: 'nav.features', href: "#features" },
  { label: 'nav.howItWorks', href: "#how-it-works" },
  { label: 'nav.faq', href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = loading
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = language === 'id' ? 'en' : 'id';
    setLanguage(newLanguage);
    // Refresh browser to ensure all components re-render with new language
    window.location.reload();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    // Check auth status immediately
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      subscription.unsubscribe();
    };
  }, []);

  // Auth loading state
  const isLoading = isLoggedIn === null;

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream/85 backdrop-blur-2xl border-b border-warm-border/60 shadow-lg shadow-brown/[0.04]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-1.5 group"
            id="logo-link"
          >
            <img 
              src={logoUntion} 
              alt="Untion Logo" 
              className="h-12 w-12 object-contain transition-all duration-200 group-hover:scale-110"
            />
            <span className="font-display text-xl font-bold text-brown">
              Untion
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-brown-muted transition-colors duration-200 hover:text-brown"
              >
                {t(link.label)}
              </a>
            ))}
          </div>

          {/* CTA - Always render to prevent layout shift */}
          <div className="hidden items-center gap-3 lg:flex">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-brown-muted transition-colors duration-200 hover:text-brown hover:bg-cream-warm"
              title="Change Language"
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase">{language}</span>
            </button>
            
            {isLoading ? (
              // Loading skeleton - prevents layout shift
              <>
                <div className="h-9 w-20 rounded-xl bg-warm-border/30 animate-pulse" />
                <div className="h-9 w-32 rounded-full bg-warm-border/30 animate-pulse" />
              </>
            ) : isLoggedIn ? (
              <>
                <button
                  onClick={handleLogout}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-brown-muted transition-colors duration-200 hover:text-brown"
                >
                  {t('nav.logout')}
                </button>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-cream shadow-md shadow-teal/20 transition-all duration-200 hover:bg-teal-light hover:shadow-lg hover:shadow-teal/25 active:scale-95"
                >
                  <ArrowRight className="h-4 w-4" />
                  {t('nav.dashboard')}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  id="nav-signin"
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-brown-muted transition-colors duration-200 hover:text-brown"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  to="/register"
                  id="nav-cta"
                  className="inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-cream shadow-md shadow-teal/20 transition-all duration-200 hover:bg-teal-light hover:shadow-lg hover:shadow-teal/25 active:scale-95"
                >
                  <ArrowRight className="h-4 w-4" />
                  {t('nav.getStarted')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-toggle"
            className="flex items-center justify-center rounded-lg p-2 text-brown-muted lg:hidden hover:text-brown"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="border-t border-warm-border bg-cream pb-6 pt-4 lg:hidden animate-[slide-in-up_0.2s_ease-out]">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-brown-muted transition-colors hover:text-brown"
                  onClick={() => setMobileOpen(false)}
                >
                  {t(link.label)}
                </a>
              ))}
              
              {/* Language Toggle - Mobile */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 text-base font-medium text-brown-muted transition-colors hover:text-brown"
              >
                <Globe className="h-5 w-5" />
                <span>{language === 'id' ? 'Bahasa Indonesia' : 'English'}</span>
              </button>
              
              <div className="mt-2 flex flex-col gap-2">
                {isLoading ? (
                  // Loading skeleton for mobile
                  <>
                    <div className="h-12 w-full rounded-xl bg-warm-border/30 animate-pulse" />
                    <div className="h-12 w-full rounded-xl bg-warm-border/30 animate-pulse" />
                  </>
                ) : isLoggedIn ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-brown px-5 py-3 text-center text-sm font-semibold text-cream shadow-md shadow-brown/20"
                    >
                      <ArrowRight className="h-4 w-4" />
                      {t('nav.dashboard')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-transparent border border-warm-border px-5 py-3 text-center text-sm font-semibold text-brown shadow-sm"
                    >
                      {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-brown px-5 py-3 text-center text-sm font-semibold text-cream shadow-md shadow-brown/20"
                    >
                      <ArrowRight className="h-4 w-4" />
                      {t('nav.getStarted')}
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-transparent border border-warm-border px-5 py-3 text-center text-sm font-semibold text-brown shadow-sm"
                    >
                      {t('nav.signIn')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
