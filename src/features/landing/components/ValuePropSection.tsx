import { BookOpen, Target, Clock } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function ValuePropSection() {
  const { t } = useLanguage();

  const valueProps = [
    {
      icon: BookOpen,
      titleKey: 'value.masterMaterial',
      descKey: 'value.masterMaterialDesc',
    },
    {
      icon: Target,
      titleKey: 'value.perfectDelivery',
      descKey: 'value.perfectDeliveryDesc',
    },
    {
      icon: Clock,
      titleKey: 'value.savePrepTime',
      descKey: 'value.savePrepTimeDesc',
    },
  ];

  return (
    <section id="value-prop" className="relative border-y border-warm-border bg-white py-12 shadow-sm">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-warm-border/60">
          {valueProps.map((prop, i) => (
            <div key={i} className="flex flex-col items-center text-center px-4 py-4 md:py-0">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/5 text-teal shadow-inner border border-teal/10">
                <prop.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-display text-lg font-bold text-brown">
                {t(prop.titleKey)}
              </h3>
              <p className="text-sm text-brown-muted leading-relaxed">
                {t(prop.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
