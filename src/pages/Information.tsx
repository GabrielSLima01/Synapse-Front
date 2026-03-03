/**
 * ============================================================
 * INFORMATION.TSX - INFORMAÇÕES DA FENEARTE
 * ============================================================
 * 
 * DESCRIÇÃO:
 * Exibe informações gerais sobre a FENEARTE, incluindo horário,
 * localização e entrada. Contém botão para acessar site oficial.
 * 
 * ============================================================
 * FUNCIONALIDADES E REQUISITOS DE BACKEND:
 * ============================================================
 * 
 * 1. CARDS INFORMATIVOS
 *    - Sobre a FENEARTE (descrição geral)
 *    - Horário de funcionamento
 *    - Localização (endereço)
 *    - Entrada gratuita
 *    
 *    BACKEND: Pode ser estático ou vir de CMS
 *    - GET /api/info (opcional)
 *    - Retorna: { about, schedule, location }
 * 
 * 2. LINK PARA SITE OFICIAL
 *    - Botão que abre https://fenearte.pe.gov.br em nova aba
 *    
 *    BACKEND: Não requer
 * 
 * ============================================================
 * ESTRUTURA DE DADOS (se dinâmico):
 * ============================================================
 * 
 * EventInfo:
 * {
 *   about: string,
 *   schedule: string,
 *   location: string,
 *   entry: 'free' | 'paid',
 *   website: string
 * }
 * 
 * ============================================================
 * OBSERVAÇÃO:
 * ============================================================
 * 
 * Esta página é principalmente estática e não requer backend
 * complexo. Pode ser alimentada por um CMS simples se precisar
 * de atualizações frequentes.
 * 
 * ============================================================
 */

import { useLanguage } from '@/contexts/LanguageContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageFooter } from '@/components/layout/PageFooter';
import { Calendar, MapPin, Clock, Ticket, ExternalLink } from 'lucide-react';

export default function Information() {
  const { t } = useLanguage();

  /**
   * CARDS INFORMATIVOS
   * Conteúdo traduzido via LanguageContext
   */
  const infoCards = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: t('aboutFenearte'),
      content: t('aboutDescription'),
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: t('schedule'),
      content: t('scheduleTime'),
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: t('location'),
      content: t('locationText'),
    },
  ];

  // ============================================================
  // RENDERIZAÇÃO
  // ============================================================

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title={t('information')} />

      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto space-y-4">
          
          {/* ============================================================
              CARDS INFORMATIVOS
              - Sobre a FENEARTE
              - Horário
              - Localização
              ============================================================ */}
          {infoCards.map((card, index) => (
            <article
              key={card.title}
              className="bg-card border-4 border-primary/20 rounded-2xl p-5 shadow-card
                         opacity-0 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                  {card.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-accessible-lg font-bold text-foreground mb-2">
                    {card.title}
                  </h2>
                  <p className="text-accessible-base text-muted-foreground leading-relaxed">
                    {card.content}
                  </p>
                </div>
              </div>
            </article>
          ))}

          {/* ============================================================
              CARD: ENTRADA GRATUITA
              Destaque visual em cor primária
              ============================================================ */}
          <article
            className="bg-primary text-primary-foreground rounded-2xl p-5 shadow-button
                       opacity-0 animate-slide-up"
            style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-foreground/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Ticket className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-accessible-lg font-bold mb-1">
                  {t('freeAdmission')}
                </h2>
                <p className="text-accessible-base opacity-90">
                  {t('freeAdmissionDesc')}
                </p>
              </div>
            </div>
          </article>

          {/* ============================================================
              BOTÃO: IR PARA O SITE DA FENEARTE
              Abre site oficial em nova aba
              ============================================================ */}
          <a
            href="https://fenearte.pe.gov.br"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-card border-4 border-primary rounded-2xl p-5 shadow-card
                       hover:shadow-card-hover hover:bg-primary/5 transition-all
                       opacity-0 animate-slide-up"
            style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-accessible-lg font-bold text-foreground mb-1">
                    {t('goToFenearteSite')}
                  </h2>
                  <p className="text-accessible-base text-muted-foreground">
                    {t('accessOfficialInfo')}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-6 h-6 text-primary flex-shrink-0" />
            </div>
          </a>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
