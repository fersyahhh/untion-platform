import { useState } from 'react';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function FAQSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      questionKey: 'faq.q1',
      answerKey: 'faq.a1',
    },
    {
      questionKey: 'faq.q2',
      answerKey: 'faq.a2',
    },
    {
      questionKey: 'faq.q3',
      answerKey: 'faq.a3',
    },
    {
      questionKey: 'faq.q4',
      answerKey: 'faq.a4',
    }
  ];

  return (
    <section id="faq" className="relative py-28 lg:py-36 bg-cream overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-teal/5 via-transparent to-transparent" />
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-brown/5 blur-[100px]" />
      
      {/* Top Border */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-warm-border to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-8 items-start">
          
          {/* Left Column: Heading & Context */}
          <div className="lg:col-span-5 lg:sticky lg:top-32" style={{ animation: 'slide-in-left 0.8s ease-out' }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-4 py-1.5 text-sm font-bold tracking-wide text-teal-dark shadow-sm">
              <MessageCircleQuestion className="h-4 w-4" />
              {t('faq.label')}
            </div>
            
            <h2 className="font-display text-4xl font-bold tracking-tight text-brown sm:text-5xl drop-shadow-sm">
              {t('faq.title')} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-teal-dark to-teal">
                {t('faq.titleHighlight')}
              </span>
            </h2>
            
            <p className="mt-6 text-lg leading-relaxed text-brown-muted max-w-md">
              {t('faq.subtitle')}
            </p>
          </div>

          {/* Right Column: Accordion */}
          <div className="lg:col-span-7" style={{ animation: 'slide-in-right 0.8s ease-out 0.2s both' }}>
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div 
                    key={index}
                    className={`group rounded-2xl border transition-all duration-300 ease-in-out ${
                      isOpen 
                        ? 'border-teal/30 bg-white shadow-lg shadow-teal/5' 
                        : 'border-warm-border bg-white/50 hover:border-brown/20 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <button
                      className="flex w-full items-center justify-between px-6 py-6 text-left focus:outline-none"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                    >
                      <span className={`font-display text-lg font-bold transition-colors duration-300 ${isOpen ? 'text-teal-dark' : 'text-brown group-hover:text-brown-light'}`}>
                        {t(faq.questionKey)}
                      </span>
                      <div className={`ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isOpen ? 'bg-teal/10' : 'bg-warm-surface group-hover:bg-brown/5'}`}>
                        <ChevronDown 
                          className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-teal-dark' : 'text-brown-muted group-hover:text-brown'}`} 
                        />
                      </div>
                    </button>
                    
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="px-6 pb-6 pt-2">
                        <div className="h-px w-full bg-gradient-to-r from-warm-border to-transparent mb-4" />
                        <p className="text-base leading-relaxed text-brown-muted">
                          {t(faq.answerKey)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
