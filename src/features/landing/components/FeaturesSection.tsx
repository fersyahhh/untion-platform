import {
  Upload,
  Mic,
  BrainCircuit,
  CheckCircle,
  Users,
  FileText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface Feature {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  accent: string;
  iconBg: string;
}

function FeaturesSection() {
  const { t } = useLanguage();

  const features: Feature[] = [
    {
      icon: Upload,
      titleKey: 'feature.uploadSlides',
      descKey: 'feature.uploadSlidesDesc',
      accent: 'text-teal-dark',
      iconBg: 'bg-teal/10',
    },
    {
      icon: Mic,
      titleKey: 'feature.practiceSpeech',
      descKey: 'feature.practiceSpeechDesc',
      accent: 'text-brown',
      iconBg: 'bg-brown/8',
    },
    {
      icon: BrainCircuit,
      titleKey: 'feature.aiFeedback',
      descKey: 'feature.aiFeedbackDesc',
      accent: 'text-teal-dark',
      iconBg: 'bg-teal/10',
    },
    {
      icon: FileText,
      titleKey: 'feature.contentCorrections',
      descKey: 'feature.contentCorrectionsDesc',
      accent: 'text-brown',
      iconBg: 'bg-brown/8',
    },
    {
      icon: CheckCircle,
      titleKey: 'feature.confidenceScore',
      descKey: 'feature.confidenceScoreDesc',
      accent: 'text-teal-dark',
      iconBg: 'bg-teal/10',
    },
    {
      icon: Users,
      titleKey: 'feature.groupMode',
      descKey: 'feature.groupModeDesc',
      accent: 'text-brown',
      iconBg: 'bg-brown/8',
    },
  ];

  function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
    return (
      <div
        id={`feature-card-${index}`}
        className="group relative rounded-2xl border border-warm-border bg-white p-7 transition-all duration-300 hover:border-teal/30 hover:shadow-xl hover:shadow-teal/5 hover:-translate-y-1"
        style={{ animation: `slide-in-up 0.6s ease-out ${index * 0.1}s both` }}
      >
        <div className="relative">
          <div
            className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconBg} transition-transform duration-300 group-hover:scale-110`}
          >
            <feature.icon className={`h-6 w-6 ${feature.accent}`} />
          </div>

          <h3 className="mb-3 font-display text-lg font-bold text-brown">
            {t(feature.titleKey)}
          </h3>

          <p className="text-sm leading-relaxed text-brown-muted">
            {t(feature.descKey)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section id="features" className="relative py-28 lg:py-36">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="inline-block mb-4 rounded-full border border-teal/30 bg-teal/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-dark">
            {t('features.label')}
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-brown sm:text-5xl">
            {t('features.title')}{' '}
            <span className="text-teal-dark">
              {t('features.titleHighlight')}
            </span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-brown-muted">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FeatureCard key={feature.titleKey} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
