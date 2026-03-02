import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageFooter } from '@/components/layout/PageFooter';
import { HelpCircle, Phone, MessageCircle, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface FAQItem {
  question: {
    pt: string;
    en: string;
    es: string;
  };
  answer: {
    pt: string;
    en: string;
    es: string;
  };
}

const faqItems: FAQItem[] = [
  {
    question: {
      pt: 'Qual o horário de funcionamento?',
      en: 'What are the opening hours?',
      es: '¿Cuál es el horario de apertura?',
    },
    answer: {
      pt: 'A FENEARTE funciona diariamente das 14h às 22h.',
      en: 'FENEARTE is open daily from 2 PM to 10 PM.',
      es: 'FENEARTE está abierta diariamente de 14h a 22h.',
    },
  },
  {
    question: {
      pt: 'A entrada é paga?',
      en: 'Is admission free?',
      es: '¿La entrada es gratuita?',
    },
    answer: {
      pt: 'Sim, a entrada é totalmente gratuita para todos os visitantes.',
      en: 'Yes, admission is completely free for all visitors.',
      es: 'Sí, la entrada es totalmente gratuita para todos los visitantes.',
    },
  },
  {
    question: {
      pt: 'Onde fica a praça de alimentação?',
      en: 'Where is the food court?',
      es: '¿Dónde está el patio de comidas?',
    },
    answer: {
      pt: 'A praça de alimentação está localizada no setor central da feira, próximo ao palco principal.',
      en: 'The food court is located in the central sector of the fair, near the main stage.',
      es: 'El patio de comidas está ubicado en el sector central de la feria, cerca del escenario principal.',
    },
  },
  {
    question: {
      pt: 'Posso trazer crianças?',
      en: 'Can I bring children?',
      es: '¿Puedo traer niños?',
    },
    answer: {
      pt: 'Sim! A feira é para toda a família. Temos área kids com atividades especiais.',
      en: 'Yes! The fair is for the whole family. We have a kids area with special activities.',
      es: '¡Sí! La feria es para toda la familia. Tenemos área infantil con actividades especiales.',
    },
  },
];

export default function Help() {
  const { t, language } = useLanguage();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title={t('helpTitle')} />

      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto">
          <p className="text-accessible-base text-muted-foreground text-center mb-6 animate-fade-in">
            {t('helpDescription')}
          </p>

          {/* Emergency Contact */}
          <div 
            className="bg-destructive/10 border-2 border-destructive rounded-2xl p-4 mb-6 
                       opacity-0 animate-slide-up"
            style={{ animationFillMode: 'forwards' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-destructive rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-destructive-foreground" />
              </div>
              <div>
                <h2 className="text-accessible-lg font-bold text-foreground">
                  {t('emergency')}
                </h2>
                <p className="text-accessible-base text-muted-foreground">
                  (81) 3355-8000
                </p>
              </div>
            </div>
          </div>

          {/* Contact Options */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <a
              href="tel:+558133558000"
              className="btn-fenearte min-h-[100px] opacity-0 animate-slide-up"
              style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
            >
              <Phone className="w-8 h-8 text-primary" />
              <span className="text-accessible-base font-bold">{t('contact')}</span>
            </a>
            <button
              className="btn-fenearte min-h-[100px] opacity-0 animate-slide-up"
              style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
            >
              <MessageCircle className="w-8 h-8 text-primary" />
              <span className="text-accessible-base font-bold">Chat</span>
            </button>
          </div>

          {/* FAQ Section */}
          <section>
            <h2 className="text-accessible-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" />
              {t('faq')}
            </h2>

            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-card border-2 border-border rounded-xl overflow-hidden
                             opacity-0 animate-slide-up"
                  style={{ animationDelay: `${300 + index * 100}ms`, animationFillMode: 'forwards' }}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between p-4 text-left
                               hover:bg-secondary/50 transition-colors"
                    aria-expanded={openFAQ === index}
                  >
                    <span className="text-accessible-base font-semibold text-foreground pr-4">
                      {item.question[language]}
                    </span>
                    {openFAQ === index ? (
                      <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  
                  {openFAQ === index && (
                    <div className="px-4 pb-4 animate-accordion-down">
                      <p className="text-accessible-base text-muted-foreground leading-relaxed">
                        {item.answer[language]}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
