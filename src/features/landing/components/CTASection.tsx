import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function CTASection() {
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    <section id="get-started" className="relative py-28 lg:py-36">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-warm-border bg-warm-surface">
          {/* Background accents */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal/5 via-transparent to-brown/5" />

          <div className="relative px-8 py-20 text-center sm:px-16 lg:py-28">
            <h2 className="mx-auto max-w-3xl font-display text-4xl font-bold tracking-tight text-brown sm:text-5xl lg:text-6xl">
              {t('cta.title')}{' '}
              <span className="text-teal-dark">
                {t('cta.titleHighlight')}
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-brown-muted">
              {t('cta.subtitle')}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to={isLoggedIn ? "/dashboard" : "/register"}
                id="cta-primary"
                className="group inline-flex items-center gap-2 rounded-full bg-brown px-10 py-4 text-base font-semibold text-cream transition-all duration-200 hover:bg-brown-light hover:shadow-xl hover:shadow-brown/15 active:scale-95"
              >
                {t('cta.button')}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            <p className="mt-5 text-xs text-brown-muted/60">
              {t('cta.note')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
