import { FolderUp, FileText, Clock, Mic, BrainCircuit, Rocket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface Step {
  number: string;
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
}

export default function HowItWorksSection() {
  const { t } = useLanguage();

  const steps: Step[] = [
    {
      number: '01',
      titleKey: 'step.uploadPpt',
      descKey: 'step.uploadPptDesc',
      icon: FolderUp,
    },
    {
      number: '02',
      titleKey: 'step.configure',
      descKey: 'step.configureDesc',
      icon: FileText,
    },
    {
      number: '03',
      titleKey: 'step.setDuration',
      descKey: 'step.setDurationDesc',
      icon: Clock,
    },
    {
      number: '04',
      titleKey: 'step.practiceOutLoud',
      descKey: 'step.practiceOutLoudDesc',
      icon: Mic,
    },
    {
      number: '05',
      titleKey: 'step.getReview',
      descKey: 'step.getReviewDesc',
      icon: BrainCircuit,
    },
    {
      number: '06',
      titleKey: 'step.presentConfidence',
      descKey: 'step.presentConfidenceDesc',
      icon: Rocket,
    },
  ];
  return (
    <section id="how-it-works" className="relative py-28 lg:py-36 bg-warm-surface">
      {/* Subtle divider gradient at top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-warm-border to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-20">
          <span className="inline-block mb-4 rounded-full border border-brown/15 bg-brown/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brown">
            {t('howItWorks.label')}
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-brown sm:text-5xl">
            {t('howItWorks.title')}{' '}
            <span className="text-teal-dark">
              {t('howItWorks.titleHighlight')}
            </span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <div
              key={step.number}
              id={`step-${step.number}`}
              className="group relative text-center bg-white rounded-2xl border border-warm-border p-8 hover:shadow-lg hover:border-teal/30 transition-all duration-300"
              style={{ animation: `slide-in-up 0.6s ease-out ${i * 0.1}s both` }}
            >
              {/* Icon circle */}
              <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-teal/5 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-warm-border bg-cream-warm text-brown transition-all duration-300 group-hover:border-teal group-hover:scale-105">
                  <step.icon className="h-8 w-8" />
                </div>
              </div>

              <span className="mb-3 block font-display text-xs font-bold uppercase tracking-widest text-teal">
                {t(`step.${step.number}`)}
              </span>
              <h3 className="mb-4 font-display text-lg font-bold text-brown min-h-[3.5rem] flex items-center justify-center">
                {t(step.titleKey)}
              </h3>
              <p className="text-sm leading-relaxed text-brown-muted min-h-[4.5rem]">
                {t(step.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
