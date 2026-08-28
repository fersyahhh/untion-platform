import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mic } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../contexts/LanguageContext";

export default function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden pt-20"
    >
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 w-full">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left: Text */}
          <div
            className="max-w-2xl relative"
            style={{ animation: "slide-in-left 0.8s ease-out" }}
          >
            <h1 className="font-display text-5xl font-bold leading-[1.15] tracking-tight text-brown sm:text-6xl lg:text-7xl">
              {t('hero.title1')}
              <br />
              {t('hero.title2')}
            </h1>

            <p className="mt-8 text-lg leading-relaxed text-brown-muted sm:text-xl max-w-lg">
              {t('hero.subtitle')}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to={isLoggedIn ? "/dashboard" : "/register"}
                id="hero-cta-primary"
                className="inline-flex items-center justify-center rounded-full bg-brown px-8 py-4 text-base font-medium text-cream shadow-md shadow-brown/10 transition-all duration-300 hover:bg-brown-light hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
              >
                {t('hero.startPracticing')}
              </Link>
              <a
                href="#how-it-works"
                id="hero-cta-secondary"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-warm-border bg-white px-8 py-4 text-base font-medium text-brown shadow-sm transition-all duration-300 hover:border-brown/20 hover:bg-cream-warm hover:-translate-y-0.5"
              >
                <Mic className="h-4 w-4" />
                {t('hero.tryItOut')}
              </a>
            </div>
          </div>

          {/* Right: Visual — Presentation Room Concept */}
          <div
            className="flex items-center justify-center lg:justify-end"
            style={{ animation: "slide-in-right 0.8s ease-out 0.2s both" }}
          >
            <div className="relative w-full max-w-[650px] aspect-[6/5] rounded-[2rem] bg-white shadow-2xl shadow-brown/10 border border-warm-border overflow-hidden flex flex-col">
              {/* Header - Compact & Clean */}
              <div className="h-10 bg-brown-light px-5 flex items-center justify-between shrink-0">
                <span className="text-xs font-bold text-cream">Presentation Room</span>
                <span className="text-xs font-bold text-cream">02:45</span>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex overflow-hidden bg-cream">
                {/* Left: PDF Slide - Takes 65% */}
                <div className="w-2/3 bg-white border-r border-warm-border p-4 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-cream-warm to-cream-deep rounded-xl border border-warm-border/50 shadow-sm flex flex-col p-4 justify-between">
                    {/* Slide Title Area */}
                    <div className="space-y-2">
                      <div className="w-2/3 h-3 bg-brown-muted rounded" />
                      <div className="w-1/2 h-2 bg-brown-muted/50 rounded" />
                    </div>

                    {/* Slide Content - Simple Grid */}
                    <div className="flex gap-3 flex-1 items-center justify-center">
                      <div className="w-1/4 h-3/4 bg-teal/30 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-2.5 bg-brown-muted/40 rounded w-full" />
                        <div className="h-2.5 bg-brown-muted/40 rounded w-5/6" />
                        <div className="h-2.5 bg-brown-muted/40 rounded w-4/5" />
                      </div>
                    </div>

                    {/* Slide Footer */}
                    <div className="text-right">
                      <div className="text-xs font-bold text-brown-muted">Slide 1/10</div>
                    </div>
                  </div>
                </div>

                {/* Right: Transcript Panel - Takes 35% */}
                <div className="w-1/3 bg-cream-warm/50 border-l border-warm-border flex flex-col">
                  {/* Transcript Header */}
                  <div className="px-4 py-3 border-b border-warm-border bg-cream-warm">
                    <p className="text-xs font-bold text-brown-muted">Live Transcript</p>
                  </div>

                  {/* Transcript Content */}
                  <div className="flex-1 overflow-hidden p-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="h-2 bg-cream-deep rounded w-full" />
                      <div className="h-2 bg-cream-deep rounded w-5/6" />
                      <div className="h-2 bg-cream-deep rounded w-4/5" />
                      <div className="h-2 bg-cream-deep rounded w-3/4 opacity-50" />
                    </div>
                  </div>

                  {/* Mic Indicator */}
                  <div className="px-3 py-3 border-t border-warm-border flex justify-center">
                    <div className="w-6 h-6 rounded-full bg-teal flex items-center justify-center shadow-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-cream animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Controls */}
              <div className="h-9 bg-brown-light/20 border-t border-warm-border px-5 flex items-center justify-between text-xs font-bold text-brown-muted shrink-0">
                <div>Slide Controls</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>Recording</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
