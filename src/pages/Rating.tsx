/**
 * ============================================================
 * RATING.TSX - PESQUISA DE SATISFAÇÃO DA FENEARTE
 * ============================================================
 * 
 * DESCRIÇÃO:
 * Permite que visitantes avaliem sua experiência na FENEARTE
 * através de um formulário com nome, descrição curta e estrelas.
 * Exibe lista de avaliações enviadas com filtro por nota.
 * 
 * ============================================================
 * FUNCIONALIDADES E REQUISITOS DE BACKEND:
 * ============================================================
 * 
 * 1. FORMULÁRIO DE AVALIAÇÃO
 *    - Campo: Nome do visitante (obrigatório, máx. 50 chars)
 *    - Campo: Descrição (opcional, máx. 30 chars)
 *    - Campo: Nota em estrelas (1-5, obrigatório)
 *    - Requer login para enviar
 *    
 *    BACKEND NECESSÁRIO:
 *    - POST /api/ratings
 *    - Body: { name: string, description: string, rating: number }
 *    - Retorna: { id, name, description, rating, createdAt }
 * 
 * 2. LISTA DE AVALIAÇÕES
 *    - Exibe todas as avaliações enviadas
 *    - Ordenadas por data (mais recentes primeiro)
 *    
 *    BACKEND NECESSÁRIO:
 *    - GET /api/ratings
 *    - Retorna: [{ id, name, description, rating, createdAt }]
 * 
 * 3. FILTRO POR ESTRELAS
 *    - Botões para filtrar por número de estrelas (1-5)
 *    - Botão "Todas" remove filtro
 *    
 *    BACKEND: Pode ser filtrado no frontend ou via query
 *    - GET /api/ratings?rating={1-5}
 * 
 * ============================================================
 * ESTRUTURA DE DADOS:
 * ============================================================
 * 
 * Review:
 * {
 *   id: number,
 *   name: string,
 *   description: string (máx 30 chars),
 *   rating: number (1-5),
 *   createdAt: Date
 * }
 * 
 * ============================================================
 * DIFERENÇA DE StandDetail.tsx:
 * ============================================================
 * 
 * - StandDetail: Avaliação de um STAND específico
 * - Rating: Avaliação da FENEARTE como um todo (experiência geral)
 * 
 * ============================================================
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageFooter } from '@/components/layout/PageFooter';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { ratingService } from '@/services/rating.service';
import { mapService } from '@/services/map.service';

// ============================================================
// TIPOS E INTERFACES
// ============================================================

/** Interface de uma avaliação */
interface Review {
  id: string;
  name: string;
  description?: string | null;
  rating: number;
  createdAt: string | Date;
}

// ============================================================
// DADOS MOCK
// ============================================================

/**
 * AVALIAÇÕES MOCK
 * 
 * BACKEND: Substituir por GET /api/ratings
 */
// initial empty list; will be loaded from backend
const mockReviews: Review[] = [];

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

/**
 * StarRating - Componente de estrelas clicáveis ou somente leitura
 */
function StarRating({ 
  rating, 
  onRate, 
  size = 'md',
  readonly = false 
}: { 
  rating: number; 
  onRate?: (rating: number) => void;
  size?: 'sm' | 'md';
  readonly?: boolean;
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-8 h-8';
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={`transition-transform ${readonly ? 'cursor-default' : 'hover:scale-110'}`}
        >
          <Star 
            className={`${starSize} transition-colors ${
              star <= (hoverRating || rating) 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-muted-foreground'
            }`} 
          />
        </button>
      ))}
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function Rating() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // ============================================================
  // ESTADOS DO FORMULÁRIO
  // ============================================================
  
  /** Nome do visitante */
  const [name, setName] = useState('');
  
  /** Descrição da experiência (máx. 30 chars) */
  const [description, setDescription] = useState('');
  
  /** Nota em estrelas (1-5) */
  const [rating, setRating] = useState(0);
  
  /** Se está enviando */
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ============================================================
  // ESTADOS DA LISTA
  // ============================================================
  
  /** Lista de avaliações */
  const [reviews, setReviews] = useState<Review[]>(mockReviews);

  /** Marcadores do mapa (apenas carregados para exibição/resumo) */
  const [markersCount, setMarkersCount] = useState<number | null>(null);
  
  /** Filtro por número de estrelas (null = todas) */
  const [filterRating, setFilterRating] = useState<number | null>(null);

  /** Lista filtrada por estrelas */
  const filteredReviews = filterRating 
    ? reviews.filter(r => r.rating === filterRating)
    : reviews;

  /**
   * ENVIAR AVALIAÇÃO
   * 
   * BACKEND: POST /api/ratings
   * Body: { name, description, rating }
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error(t('loginToReview'));
      navigate('/login');
      return;
    }
    
    // Validações
    if (!name.trim()) {
      toast.error(t('pleaseEnterName'));
      return;
    }
    
    if (rating === 0) {
      toast.error(t('pleaseSelectRating'));
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await ratingService.createRating({
        name: name.trim(),
        description: description.trim(),
        rating,
      });

      // Prepend created review to list
      setReviews((prev) => [created as Review, ...prev]);

      setName('');
      setDescription('');
      setRating(0);
      toast.success(t('ratingSuccess'));
    } catch (err) {
      toast.error(t('ratingError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load ratings and markers on mount or when filter changes
  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const params = filterRating ? { rating: filterRating } : undefined;
        const data = await ratingService.getRatings(params as any);
        if (!active) return;
        setReviews(data.map(r => ({ ...r, createdAt: new Date(r.createdAt) })));
      } catch {
        if (active) setReviews([]);
      }

      try {
        const markers = await mapService.getMarkers();
        if (!active) return;
        setMarkersCount(markers.length);
      } catch {
        if (active) setMarkersCount(null);
      }
    };

    load();

    return () => { active = false; };
  }, [filterRating]);

  // ============================================================
  // RENDERIZAÇÃO
  // ============================================================

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title={t('ratingTitle')} />

      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          
          {/* ============================================================
              TÍTULO E DESCRIÇÃO
              ============================================================ */}
          <div className="text-center animate-fade-in">
            <h2 className="text-accessible-xl font-bold text-primary mb-2">
              {t('satisfactionSurvey')}
            </h2>
            <p className="text-muted-foreground">
              {t('tellUsExperience')}
            </p>
          </div>

          {/* ============================================================
              FORMULÁRIO DE AVALIAÇÃO
              - Nome (obrigatório)
              - Descrição (opcional, máx. 30 chars)
              - Estrelas (obrigatório)
              ============================================================ */}
          <form 
            onSubmit={handleSubmit}
            className="bg-card border-2 border-border rounded-2xl p-5 space-y-4 animate-fade-in animation-delay-100"
          >
            {/* CAMPO: NOME */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('yourName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                className="w-full px-4 py-3 border-2 border-border rounded-xl text-accessible-base
                           focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors bg-background"
                placeholder={t('enterYourName')}
              />
            </div>

            {/* CAMPO: DESCRIÇÃO (limite 30 caracteres) */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('descriptionMax30')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 30))}
                maxLength={30}
                rows={2}
                className="w-full px-4 py-3 border-2 border-border rounded-xl text-accessible-base
                           focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors bg-background resize-none"
                placeholder={t('howWasExperience')}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {description.length}/30
              </p>
            </div>

            {/* CAMPO: AVALIAÇÃO POR ESTRELAS */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('ratingLabel')}
              </label>
              <StarRating rating={rating} onRate={setRating} />
            </div>

            {/* BOTÃO ENVIAR */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl
                         text-accessible-lg font-bold shadow-button hover:shadow-button-hover
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? t('submitting') : t('submitRating')}
            </button>
          </form>

          {/* ============================================================
              LISTA DE AVALIAÇÕES
              - Filtros por estrelas
              - Cards de avaliações
              ============================================================ */}
          <div className="space-y-4 animate-fade-in animation-delay-200">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
              {t('reviews')}
            </h3>

            {/* FILTROS POR ESTRELAS */}
            <div className="flex flex-wrap gap-2">
              {/* Botão: Todas */}
              <button
                onClick={() => setFilterRating(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                           ${filterRating === null 
                             ? 'bg-primary text-primary-foreground' 
                             : 'bg-card border-2 border-border text-foreground hover:bg-secondary'}`}
              >
                {t('allFilter')}
              </button>
              {/* Botões: 1-5 estrelas */}
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFilterRating(filterRating === star ? null : star)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                             flex items-center gap-1
                             ${filterRating === star 
                               ? 'bg-primary text-primary-foreground' 
                               : 'bg-card border-2 border-border text-foreground hover:bg-secondary'}`}
                >
                  <Star className="w-3 h-3" />
                  {star}
                </button>
              ))}
            </div>

            {/* LISTA DE REVIEWS */}
            <div className="space-y-3">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-card border-2 border-border rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-bold text-foreground">{review.name}</h4>
                    </div>
                    {review.description && (
                      <p className="text-sm text-muted-foreground mb-2">{review.description}</p>
                    )}
                    <StarRating rating={review.rating} size="sm" readonly />
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t('noReviewsFound')}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <PageFooter variant="page" />
    </div>
  );
}
