/**
 * ============================================================
 * STANDDETAIL.TSX - PÁGINA DE DETALHES DE UM STAND
 * ============================================================
 * 
 * DESCRIÇÃO:
 * Exibe informações completas de um stand específico, incluindo
 * foto, descrição, localização no mapa e avaliações dos visitantes.
 * 
 * ROTA: /stands/:id (onde id = 1 a 500)
 * 
 * ============================================================
 * FUNCIONALIDADES E REQUISITOS DE BACKEND:
 * ============================================================
 * 
 * 1. INFORMAÇÕES DO STAND
 *    - Foto principal do stand
 *    - Nome e categoria (badge)
 *    - Descrição do expositor
 *    - História do artesão
 *    - Média de avaliações
 *    
 *    BACKEND NECESSÁRIO:
 *    - GET /api/stands/:id
 *    - Retorna: { id, name, category, description, history, mapX, mapY, image, rating }
 * 
 * 2. LOCALIZAÇÃO NO MAPA
 *    - Mini-mapa com pin vermelho na posição do stand
 *    - Coordenadas x,y em porcentagem
 *    
 *    BACKEND: Usa dados do stand (mapX, mapY)
 * 
 * 3. SISTEMA DE AVALIAÇÕES
 *    - Lista de avaliações existentes
 *    - Formulário para nova avaliação:
 *      - Nome do visitante (obrigatório)
 *      - Comentário (máx. 30 caracteres)
 *      - Nota em estrelas (1-5)
 *    - Requer login para enviar
 *    
 *    BACKEND NECESSÁRIO:
 *    - GET /api/stands/:id/reviews
 *      Retorna: [{ id, name, comment, rating }]
 *    
 *    - POST /api/stands/:id/reviews
 *      Body: { name, comment, rating }
 *      Retorna: { id, name, comment, rating }
 * 
 * 4. CONTADOR DE VISITAS (implícito)
 *    - Cada vez que a página é acessada, incrementa contador
 *    - Usado para ranking em /top-stands
 *    
 *    BACKEND NECESSÁRIO:
 *    - POST /api/stands/:id/visit (ou incrementar no GET)
 * 
 * ============================================================
 * ESTRUTURA DE DADOS:
 * ============================================================
 * 
 * Stand:
 * {
 *   id: number,
 *   name: string,
 *   category: string,
 *   description: string,
 *   history: string,
 *   mapX: number (0-100),
 *   mapY: number (0-100),
 *   image: string (URL),
 *   rating: number (média, 1-5)
 * }
 * 
 * StandReview:
 * {
 *   id: number,
 *   name: string (nome do avaliador),
 *   comment: string (máx 30 chars),
 *   rating: number (1-5)
 * }
 * 
 * ============================================================
 */

import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageFooter } from '@/components/layout/PageFooter';
import { MapPin, Star, ChevronLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import mapaFenearte from '@/assets/mapa-fenearte.png';
import { standService } from '@/services/stand.service';

// ============================================================
// TIPOS E INTERFACES
// ============================================================

/** Dados completos de um stand */
interface Stand {
  id: string;
  name: string;
  category: string;
  descriptionPT?: string;
  descriptionEN?: string;
  descriptionES?: string;
  history?: string | null;
  mapX: number;
  mapY: number;
  image?: string | null;
  rating?: number | null;
}

/** Avaliação de um visitante */
interface StandReview {
  id: string;
  name: string;
  comment?: string | null;
  rating: number;
}

const fallbackStandImage = '/placeholder.svg';

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

/**
 * StarRating - Exibe estrelas de avaliação (somente leitura)
 */
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star}
          className={`${starSize} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} 
        />
      ))}
    </div>
  );
}

/**
 * StarInput - Input de estrelas clicável para avaliação
 */
function StarInput({ rating, onRate }: { rating: number; onRate: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star 
            className={`w-8 h-8 transition-colors ${
              star <= (hover || rating) 
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

export default function StandDetail() {
  // Extrai ID da URL
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const standId = id || '';

  const [stand, setStand] = useState<Stand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // ============================================================
  // ESTADOS DE AVALIAÇÃO
  // ============================================================
  
  /** Lista de avaliações do stand */
  const [reviews, setReviews] = useState<StandReview[]>([]);
  
  /** Campos do formulário de nova avaliação */
  const [newName, setNewName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * ENVIAR NOVA AVALIAÇÃO
   * 
   * BACKEND: POST /api/stands/:id/reviews
   * Body: { name, comment, rating }
   */
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Faça login para deixar uma avaliação');
      navigate('/login');
      return;
    }
    if (!newName.trim() || newRating === 0) return;
    
    setIsSubmitting(true);
    try {
      const created = await standService.createStandReview(standId, {
        name: newName.trim(),
        comment: newComment.trim() || undefined,
        rating: newRating
      });

      setReviews((prev) => [created, ...prev]);
      setNewName('');
      setNewComment('');
      setNewRating(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!standId) return;
    let active = true;

    setIsLoading(true);

    standService.getStandById(standId)
      .then((data) => {
        if (!active) return;
        setStand(data as Stand);
      })
      .catch(() => {
        if (active) setStand(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    standService.getStandReviews(standId)
      .then((data) => {
        if (active) setReviews(data as StandReview[]);
      })
      .catch(() => {
        if (active) setReviews([]);
      });

    standService.registerVisit(standId).catch(() => undefined);

    return () => {
      active = false;
    };
  }, [standId]);

  const description = useMemo(() => {
    if (!stand) return '';
    if (language === 'en') return stand.descriptionEN || stand.descriptionPT || '';
    if (language === 'es') return stand.descriptionES || stand.descriptionPT || '';
    return stand.descriptionPT || stand.descriptionEN || '';
  }, [stand, language]);

  // ============================================================
  // PÁGINA DE STAND NÃO ENCONTRADO
  // ============================================================
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PageHeader title="Carregando" />
        <main className="flex-1 px-4 py-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Carregando dados do stand...</p>
          </div>
        </main>
        <PageFooter variant="page" />
      </div>
    );
  }

  if (!stand) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PageHeader title="Stand não encontrado" />
        <main className="flex-1 px-4 py-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">O stand #{id} não foi encontrado.</p>
            <button
              onClick={() => navigate('/map')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold"
            >
              Voltar ao Mapa
            </button>
          </div>
        </main>
        <PageFooter variant="page" />
      </div>
    );
  }

  // Calcula média das avaliações
  const avgRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : (stand.rating ?? 0);

  // ============================================================
  // RENDERIZAÇÃO PRINCIPAL
  // ============================================================

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title={`Stand #${stand.id}`} />

      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          
          {/* BOTÃO VOLTAR */}
          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Voltar ao Mapa</span>
          </button>

          {/* ============================================================
              IMAGEM DO STAND COM OVERLAY
              - Foto principal
              - Nome, categoria e rating no overlay
              ============================================================ */}
          <div className="relative rounded-2xl overflow-hidden animate-fade-in">
            <img
              src={stand.image || fallbackStandImage}
              alt={stand.name}
              className="w-full h-56 object-cover"
              onError={(e) => {
                if (e.currentTarget.src.endsWith(fallbackStandImage)) return;
                e.currentTarget.src = fallbackStandImage;
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h1 className="text-xl font-bold text-white">{stand.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  {stand.category}
                </span>
                <div className="flex items-center gap-1 text-white">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================
              SEÇÃO: DESCRIÇÃO DO EXPOSITOR
              - Texto sobre o stand e sua história
              ============================================================ */}
          <div className="bg-card border-2 border-border rounded-xl p-4 animate-fade-in">
            <h2 className="text-lg font-bold text-foreground mb-2">Sobre o Expositor</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
            {stand.history && (
              <p className="text-muted-foreground text-sm leading-relaxed mt-3">
                {stand.history}
              </p>
            )}
          </div>

          {/* ============================================================
              SEÇÃO: LOCALIZAÇÃO NO MAPA
              - Mini-mapa com pin vermelho na posição do stand
              ============================================================ */}
          <div className="bg-card border-2 border-border rounded-xl p-4 animate-fade-in">
            <h2 className="text-lg font-bold text-foreground mb-2">Localização no Mapa</h2>
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border">
              <img 
                src={mapaFenearte} 
                alt="Mapa da FENEARTE" 
                className="w-full h-full object-contain"
              />
              {/* PIN DO STAND */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-full z-10"
                style={{ left: `${stand.mapX}%`, top: `${stand.mapY}%` }}
              >
                <MapPin className="w-8 h-8 text-red-500 drop-shadow-lg animate-bounce" fill="currentColor" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 
                                bg-foreground text-background px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                  #{stand.id}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================
              SEÇÃO: AVALIAÇÕES
              - Formulário para nova avaliação (não requer login)
              - Lista de avaliações existentes
              ============================================================ */}
          <div className="bg-card border-2 border-border rounded-xl p-4 animate-fade-in">
            <h2 className="text-lg font-bold text-foreground mb-4">Avaliações</h2>
            
            {/* FORMULÁRIO DE NOVA AVALIAÇÃO */}
            <form onSubmit={handleSubmitReview} className="space-y-3 mb-6 pb-4 border-b border-border">
              {/* Campo: Nome do visitante */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Seu nome"
                  maxLength={30}
                  className="flex-1 px-3 py-2 border-2 border-border rounded-lg text-sm
                             focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
              {/* Campo: Comentário (máx. 30 caracteres) */}
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value.slice(0, 30))}
                placeholder="Comentário (máx. 30)"
                maxLength={30}
                className="w-full px-3 py-2 border-2 border-border rounded-lg text-sm
                           focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
              {/* Seletor de estrelas + botão enviar */}
              <div className="flex items-center justify-between">
                <StarInput rating={newRating} onRate={setNewRating} />
                <button
                  type="submit"
                  disabled={isSubmitting || !newName.trim() || newRating === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium
                             disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Enviar
                </button>
              </div>
            </form>

            {/* LISTA DE AVALIAÇÕES EXISTENTES */}
            <div className="space-y-3">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="bg-secondary/50 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-foreground text-sm">{review.name}</span>
                      <StarRating rating={review.rating} />
                    </div>
                    {review.comment && (
                      <p className="text-muted-foreground text-sm">{review.comment}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground text-sm py-4">
                  Seja o primeiro a avaliar!
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
