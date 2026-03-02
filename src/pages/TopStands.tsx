/**
 * ============================================================
 * TOPSTANDS.TSX - STANDS EM DESTAQUE (RANKING)
 * ============================================================
 * 
 * DESCRIÇÃO:
 * Exibe ranking dos 10 stands mais visitados da FENEARTE.
 * Top 3 recebem medalha especial (ouro, prata, bronze).
 * Clique em um stand navega para sua página de detalhes.
 * 
 * ============================================================
 * FUNCIONALIDADES E REQUISITOS DE BACKEND:
 * ============================================================
 * 
 * 1. RANKING DE STANDS
 *    - Lista os 10 stands com maior access_count
 *    - Ordenados por número de visitas (decrescente)
 *    - Mostra: nome, categoria, contagem de visitas
 *    
 *    BACKEND NECESSÁRIO:
 *    - GET /api/stands/top?limit=10
 *    - Retorna: [{ id, name, category, access_count, map_x, map_y }]
 *    - Ordenado por access_count DESC
 * 
 * 2. NAVEGAÇÃO PARA DETALHES
 *    - Clique no card navega para /stands/:id
 *    
 *    BACKEND: Não requer chamada adicional
 * 
 * ============================================================
 * ESTRUTURA DE DADOS:
 * ============================================================
 * 
 * TopStand:
 * {
 *   id: number,
 *   name: string,
 *   category: string,
 *   access_count: number,
 *   map_x: number,
 *   map_y: number
 * }
 * 
 * ============================================================
 * VISUAL:
 * ============================================================
 * 
 * MEDALHAS:
 * - 1º lugar: Ouro (amarelo) com troféu
 * - 2º lugar: Prata (cinza) com troféu
 * - 3º lugar: Bronze (âmbar) com troféu
 * - 4º-10º: Número simples
 * 
 * ============================================================
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageFooter } from '@/components/layout/PageFooter';
import { Trophy, TrendingUp, MapPin } from 'lucide-react';
import { standService } from '@/services/stand.service';

// ============================================================
// TIPOS E INTERFACES
// ============================================================

/** Interface do stand no ranking */
interface Stand {
  id: string;
  number: number;
  name: string;
  category: string;
  accessCount?: number;
  mapX: number;
  mapY: number;
}

/**
 * getMedalColor - Retorna classes CSS para cor da medalha
 * @param rank - Posição no ranking (1-10)
 */
function getMedalColor(rank: number): string {
  switch (rank) {
    case 1: return 'bg-yellow-400 text-yellow-900';  // Ouro
    case 2: return 'bg-gray-300 text-gray-700';      // Prata
    case 3: return 'bg-amber-600 text-amber-100';    // Bronze
    default: return 'bg-muted text-muted-foreground'; // Normal
  }
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function TopStands() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  /** Lista de stands no ranking */
  const [stands, setStands] = useState<Stand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    standService.getTopStands(10)
      .then((data) => {
        if (!active) return;
        setStands(data as Stand[]);
      })
      .catch(() => {
        if (active) setStands([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // ============================================================
  // RENDERIZAÇÃO
  // ============================================================

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title={t('topStandsTitle')} />

      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto">
          
          {/* ============================================================
              CABEÇALHO COM ÍCONE
              ============================================================ */}
          <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in">
            <TrendingUp className="w-6 h-6 text-primary" />
            <p className="text-accessible-base text-muted-foreground text-center">
              {t('topStandsDescription')}
            </p>
          </div>

          {/* ============================================================
              LISTA DE STANDS EM DESTAQUE
              - Top 3 com troféu
              - 4º-10º com número
              - Cada card é clicável
              ============================================================ */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="bg-card border-2 border-border rounded-xl p-6 text-center">
                <p className="text-muted-foreground">Carregando ranking...</p>
              </div>
            ) : stands.length > 0 ? (
              stands.map((stand, index) => (
              <article
                key={stand.id}
                onClick={() => navigate(`/stands/${stand.id}`)}
                className={`
                  bg-card border-4 rounded-2xl p-4 shadow-card cursor-pointer
                  opacity-0 animate-slide-up hover:shadow-card-hover transition-all
                  ${index === 0 ? 'border-yellow-400' : 'border-primary/20'}
                `}
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-center gap-4">
                  
                  {/* BADGE DE POSIÇÃO */}
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                    ${getMedalColor(index + 1)}
                  `}>
                    {index < 3 ? (
                      <Trophy className="w-6 h-6" />
                    ) : (
                      <span className="text-accessible-lg font-bold">{index + 1}</span>
                    )}
                  </div>

                  {/* INFORMAÇÕES DO STAND */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-accessible-lg font-bold text-foreground truncate">
                      {stand.name}
                    </h3>
                    <p className="text-accessible-sm text-muted-foreground">
                      {stand.category}
                    </p>
                  </div>

                  {/* CONTAGEM DE VISITAS */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-accessible-lg font-bold text-primary">
                      {(stand.accessCount ?? 0).toLocaleString()}
                    </p>
                    <p className="text-accessible-sm text-muted-foreground">
                      {t('visits')}
                    </p>
                  </div>
                </div>

                {/* LOCALIZAÇÃO */}
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-accessible-sm">
                    Stand #{stand.number}
                  </span>
                </div>
              </article>
              ))
            ) : (
              <div className="bg-card border-2 border-border rounded-xl p-6 text-center">
                <p className="text-muted-foreground">Nenhum stand encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
