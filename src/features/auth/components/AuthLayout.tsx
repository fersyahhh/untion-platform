import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import logoUntion from '../../../assets/icon-untion.png';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-8 px-4 sm:py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal/5 via-transparent to-transparent" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-brown/5 blur-[100px]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-brown-muted hover:text-brown mb-6 sm:mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t('auth.backToHome')}
        </a>

        <div className="flex items-center gap-2 justify-center mb-4 sm:mb-6">
          <img 
            src={logoUntion} 
            alt="Untion Logo" 
            className="h-10 w-10 object-contain"
          />
          <span className="font-display text-xl sm:text-2xl font-bold text-brown">
            Untion
          </span>
        </div>
        
        <h2 className="mt-2 text-center text-2xl sm:text-3xl font-display font-bold tracking-tight text-brown">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-brown-muted px-4 sm:px-0">
          {subtitle}
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-6 px-5 sm:py-8 sm:px-10 shadow-xl shadow-brown/5 rounded-2xl sm:rounded-[2rem] border border-warm-border">
          {children}
        </div>
      </div>
    </div>
  );
}
