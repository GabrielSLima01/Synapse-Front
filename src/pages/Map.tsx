/**
 * ============================================================
 * MAP.TSX - MAPA INTERATIVO + BUSCA DE STANDS
 * ============================================================
 * 
 * DESCRIÇÃO:
 * Página unificada de Mapa e Stands. Exibe o mapa da feira com
 * marcadores de instalações (banheiros, entradas, etc) e permite
 * buscar/filtrar stands que aparecem como pins vermelhos.
 * 
 * ============================================================
 * FUNCIONALIDADES E REQUISITOS DE BACKEND:
 * ============================================================
 * 
 * 1. MAPA INTERATIVO
 *    - Exibe imagem do mapa com pins de instalações fixas
 *    - Controles de zoom (+ e -)
 *    - Legenda colorida por tipo de local
 *    
 *    BACKEND NECESSÁRIO:
 *    - GET /api/markers → Lista todos os marcadores de instalações
 *    - Retorna: { id, name, x, y, color, type }
 * 
 * 2. BUSCA DE STANDS
 *    - Campo de busca por ID ou nome
 *    - Filtro por categoria (8 categorias)
 *    - Stands SÓ aparecem quando há busca ou filtro ativo
 *    
 *    BACKEND NECESSÁRIO:
 *    - GET /api/stands?search={query}&category={category}
 *    - Retorna: Array de stands com { id, name, category, mapX, mapY, image, rating }
 * 
 * 3. VISUALIZAÇÃO DE STANDS
 *    - Clique no pin mostra info do stand
 *    - Botão "Ver detalhes" navega para /stands/:id
 *    - Lista scrollável dos 20 primeiros resultados
 *    
 *    BACKEND: Usa mesmos dados da busca
 * 
 * ============================================================
 * ESTRUTURA DE DADOS:
 * ============================================================
 * 
 * Marker (instalação):
 * {
 *   id: string,
 *   name: string,
 *   x: number (0-100, porcentagem),
 *   y: number (0-100, porcentagem),
 *   color: 'orange' | 'blue' | 'green' | 'yellow' | 'red'
 * }
 * 
 * Stand:
 * {
 *   id: number,
 *   name: string,
 *   category: string,
 *   location: string,
 *   mapX: number (0-100),
 *   mapY: number (0-100),
 *   image: string (URL),
 *   rating: number (1-5)
 * }
 * 
 * CATEGORIAS DISPONÍVEIS:
 * - Artesanato, Cerâmica, Têxtil, Escultura
 * - Bijuterias, Bordados, Couro, Madeira
 * 
 * ============================================================
 * CORES DOS PINS:
 * ============================================================
 * - Laranja (orange): Entrada/Saída
 * - Azul (blue): Banheiros
 * - Verde (green): Eco Pontos (lixeiras/reciclagem)
 * - Amarelo (yellow): Áreas de Descanso
 * - Vermelho (red): Stands (aparecem com busca/filtro)
 * 
 * ============================================================
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageFooter } from '@/components/layout/PageFooter';
import { MapPin, ZoomIn, ZoomOut, Search, Filter, X, ChevronRight, Star, Gift } from 'lucide-react';
import mapaFenearte from '@/assets/mapa-fenearte.png';
import { mapService } from '@/services/map.service';
import { standService } from '@/services/stand.service';
import { categoryService } from '@/services/category.service';

// ============================================================
// TIPOS E INTERFACES
// ============================================================

/** Cores disponíveis para pins no mapa */
export type PinColor = 'orange' | 'blue' | 'green' | 'yellow' | 'red';

/** Interface de um pin/marcador no mapa */
export interface Pin {
  id: string;
  x: number;      // Posição X em porcentagem (0-100)
  y: number;      // Posição Y em porcentagem (0-100)
  name: string;   // Nome exibido no tooltip
  color?: PinColor;
}

/** Interface de um stand */
interface Stand {
  id: string;
  number?: number | null;
  name: string;
  category: string;
  location?: string | null;
  mapX: number;
  mapY: number;
  image?: string | null;
  rating?: number | null;
}

// ============================================================
// DADOS ESTÁTICOS
// ============================================================

/** Configuração das cores para a legenda */
export const pinColors: { value: PinColor; label: string; className: string }[] = [
  { value: 'orange', label: 'Entrada/Saída', className: 'text-primary' },
  { value: 'blue', label: 'Banheiros', className: 'text-blue-500' },
  { value: 'green', label: 'Eco Pontos', className: 'text-green-500' },
  { value: 'yellow', label: 'Descanso', className: 'text-yellow-500' },
  { value: 'red', label: 'Stands', className: 'text-red-500' },
];

const isPinColor = (value?: string): value is PinColor => (
  value === 'orange' || value === 'blue' || value === 'green' || value === 'yellow' || value === 'red'
);

/**
 * Retorna classe CSS baseada na cor do pin
 */
export const getPinColorClass = (color?: PinColor): string => {
  switch (color) {
    case 'blue': return 'text-blue-500';
    case 'green': return 'text-green-500';
    case 'yellow': return 'text-yellow-500';
    case 'red': return 'text-red-500';
    default: return 'text-primary';
  }
};

const markerTypeToColor = (type?: string): PinColor | undefined => {
  switch (type) {
    case 'ENTRANCE':
      return 'orange';
    case 'BATHROOM':
      return 'blue';
    case 'FOOD':
      return 'yellow';
    case 'INFO':
      return 'green';
    case 'EMERGENCY':
      return 'red';
    case 'STAGE':
      return 'yellow';
    default:
      return undefined;
  }
};

const getStandLabel = (stand: Stand) => (
  stand.number ? `#${stand.number}` : `#${stand.id.slice(0, 6)}`
);

const fallbackStandThumb = '/placeholder.svg';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function Map() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // ============================================================
  // ESTADOS DO COMPONENTE
  // ============================================================
  
  /** Nível de zoom do mapa (0.5 a 2) */
  const [zoom, setZoom] = useState(1);
  
  /** Pin atualmente selecionado (mostra detalhes) */
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  
  /** Texto da busca por ID ou nome */
  const [searchQuery, setSearchQuery] = useState('');
  
  /** Categoria selecionada para filtro */
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  /** Se painel de filtros está expandido */
  const [showFilters, setShowFilters] = useState(true);
  
  /** Pins de instalações vindos do backend */
  const [facilityPins, setFacilityPins] = useState<Pin[]>([]);

  /** Stands filtrados vindos do backend */
  const [filteredStands, setFilteredStands] = useState<Stand[]>([]);

  const [categories, setCategories] = useState<string[]>([]);

  /** Estado de carregamento dos stands */
  const [standsLoading, setStandsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const loadMarkers = async () => {
      try {
        const markers = await mapService.getMarkers();
        if (!active) return;
        const mapped: Pin[] = markers.map((marker) => ({
          id: marker.id,
          name: marker.name,
          x: marker.x,
          y: marker.y,
          color: isPinColor(marker.color) ? marker.color : markerTypeToColor(marker.type)
        }));
        setFacilityPins(mapped);
      } catch {
        if (active) setFacilityPins([]);
      }
    };
    loadMarkers();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        if (!active) return;
        setCategories(data.map((item) => item.name));
      } catch {
        if (!active) return;
        setCategories([]);
      }
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  // ============================================================
  // FILTRO DE STANDS
  // BACKEND: GET /api/stands?search={searchQuery}&category={selectedCategory}
  // ============================================================

  useEffect(() => {
    let active = true;

    if (!searchQuery && !selectedCategory) {
      setFilteredStands([]);
      return () => {
        active = false;
      };
    }

    const timeout = setTimeout(async () => {
      try {
        setStandsLoading(true);
        const stands = await standService.getStands({
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
          limit: 200
        });
        if (!active) return;
        setFilteredStands(stands);
      } catch {
        if (active) setFilteredStands([]);
      } finally {
        if (active) setStandsLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [searchQuery, selectedCategory]);

  /**
   * Converte stands filtrados para pins vermelhos no mapa
   * Limita a 50 pins para performance
   */
  const standPins: Pin[] = filteredStands.slice(0, 50).map(stand => ({
    id: `stand-${stand.id}`,
    x: stand.mapX,
    y: stand.mapY,
    name: `${getStandLabel(stand)} - ${stand.name}`,
    color: 'red' as PinColor,
  }));

  // Combina pins de instalações + pins de stands filtrados
  const allPins = [...facilityPins, ...standPins];

  // Indica se há filtro ativo
  const hasActiveFilter = searchQuery !== '' || selectedCategory !== null;

  // ============================================================
  // RENDERIZAÇÃO
  // ============================================================

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title={t('mapTitle')} />

      <main className="flex-1 px-4 py-4 flex flex-col gap-4">
        <div className="max-w-lg mx-auto w-full flex flex-col gap-4">
          
          {/* ============================================================
              BARRA DE BUSCA E FILTRO
              - Input de busca por ID ou nome do stand
              - Botão para expandir/colapsar filtros de categoria
              ============================================================ */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchStands')}
                className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-xl text-accessible-base
                           focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors bg-card"
              />
            </div>
            {/* BOTÃO DE FILTRO - Abre/fecha painel de categorias */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border-2 rounded-xl flex items-center gap-2 font-medium transition-colors
                         ${showFilters || selectedCategory 
                           ? 'border-primary bg-primary/10 text-primary' 
                           : 'border-border hover:border-primary/50 bg-card'}`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* ============================================================
              PAINEL DE FILTROS POR CATEGORIA
              - 8 botões de categoria (pills)
              - Clique seleciona/deseleciona categoria
              - Botão "Limpar" remove filtro
              ============================================================ */}
          {showFilters && (
            <div className="bg-card border-2 border-border rounded-xl p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-foreground text-sm">Categoria</span>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Limpar
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                               ${selectedCategory === category
                                 ? 'bg-primary text-primary-foreground'
                                 : 'bg-secondary text-secondary-foreground hover:bg-primary/10'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedCategory && (
            <button
              onClick={() => navigate(`/trilha?category=${encodeURIComponent(selectedCategory)}`)}
              className="w-full bg-card border-2 border-primary rounded-xl p-4 text-left hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Trilha sugerida</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Categoria: {selectedCategory}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-primary flex-shrink-0" />
              </div>
            </button>
          )}

          {/* ============================================================
              MAPA INTERATIVO
              - Imagem do mapa com zoom
              - Pins clicáveis para instalações e stands
              - Legenda no canto inferior esquerdo
              - Contador de stands no canto superior esquerdo
              ============================================================ */}
          <div className="relative flex-1 min-h-[350px] bg-card rounded-2xl border-4 border-primary overflow-hidden shadow-card">
            
            {/* CONTROLES DE ZOOM */}
            <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
              <button
                onClick={() => setZoom(Math.min(zoom + 0.25, 2))}
                className="w-10 h-10 bg-card rounded-lg shadow-md flex items-center justify-center text-foreground
                           hover:bg-secondary transition-colors border border-border"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => setZoom(Math.max(zoom - 0.25, 0.5))}
                className="w-10 h-10 bg-card rounded-lg shadow-md flex items-center justify-center text-foreground
                           hover:bg-secondary transition-colors border border-border"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>

            {/* ÁREA DO MAPA COM IMAGEM E PINS */}
            <div
              className="absolute inset-0 transition-transform duration-200 overflow-hidden"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
            >
              <img 
                src={mapaFenearte} 
                alt="Mapa da FENEARTE" 
                className="w-full h-full object-contain"
              />

              {/* RENDERIZAÇÃO DOS PINS */}
              {allPins.map((pin) => {
                const isHighlighted = selectedPin?.id === pin.id;
                return (
                  <button
                    key={pin.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-full
                               transition-all hover:scale-110 focus:scale-110 group z-10
                               ${isHighlighted ? 'scale-125 z-20' : ''}`}
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPin(isHighlighted ? null : pin);
                    }}
                    aria-label={pin.name}
                  >
                    <MapPin 
                      className={`w-6 h-6 drop-shadow-lg transition-colors ${
                        isHighlighted 
                          ? 'text-accent w-8 h-8' 
                          : getPinColorClass(pin.color)
                      }`} 
                      fill="currentColor" 
                    />
                    {/* TOOLTIP COM NOME */}
                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 
                                    bg-foreground text-background px-2 py-1 rounded text-xs font-medium
                                    whitespace-nowrap transition-opacity pointer-events-none
                                    ${isHighlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      {pin.name}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* LEGENDA DO MAPA */}
            <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs space-y-1 border border-border">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" fill="currentColor" />
                <span className="text-foreground">Entrada/Saída</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" fill="currentColor" />
                <span className="text-foreground">Banheiros</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-500" fill="currentColor" />
                <span className="text-foreground">Eco Pontos</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-yellow-500" fill="currentColor" />
                <span className="text-foreground">Descanso</span>
              </div>
              {hasActiveFilter && (
                <div className="flex items-center gap-2 border-t border-border pt-1">
                  <MapPin className="w-4 h-4 text-red-500" fill="currentColor" />
                  <span className="text-foreground">Stands</span>
                </div>
              )}
            </div>

            {/* CONTADOR DE STANDS ENCONTRADOS */}
            {hasActiveFilter && (
              <div className="absolute top-3 left-3 bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm font-medium">
                {filteredStands.length} stands
              </div>
            )}
          </div>

          {/* ============================================================
              CARD DO PIN SELECIONADO
              - Mostra nome do pin clicado
              - Se for stand, mostra botão "Ver detalhes"
              ============================================================ */}
          {selectedPin && (
            <div className="bg-card border-2 border-primary rounded-xl p-4 animate-slide-up">
              <div className="flex items-center gap-3">
                <MapPin className={`w-6 h-6 ${getPinColorClass(selectedPin.color)}`} fill="currentColor" />
                <span className="text-accessible-lg font-semibold">{selectedPin.name}</span>
              </div>
              {/* BOTÃO VER DETALHES - Só para stands */}
              {selectedPin.id.startsWith('stand-') && (
                <button
                  onClick={() => navigate(`/stands/${selectedPin.id.replace('stand-', '')}`)}
                  className="mt-3 w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium
                             flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  Ver detalhes
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* ============================================================
              LISTA DE STANDS FILTRADOS
              - Mostra primeiros 20 resultados
              - Cada item é clicável e navega para /stands/:id
              ============================================================ */}
          {hasActiveFilter && filteredStands.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {filteredStands.length > 20 ? 'Primeiros 20 stands:' : 'Stands encontrados:'}
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredStands.slice(0, 20).map((stand) => (
                  <button
                    key={stand.id}
                    onClick={() => navigate(`/stands/${stand.id}`)}
                    className="w-full bg-card border-2 border-border rounded-xl p-3 text-left
                               hover:border-primary/50 transition-all flex items-center gap-3"
                  >
                    <img
                      src={stand.image || fallbackStandThumb}
                      alt={stand.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => {
                        if (e.currentTarget.src.endsWith(fallbackStandThumb)) return;
                        e.currentTarget.src = fallbackStandThumb;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate text-sm">
                        {getStandLabel(stand)} - {stand.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{stand.category}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-3 h-3 text-accent fill-accent" />
                      <span className="text-foreground">
                        {stand.rating != null ? stand.rating.toFixed(1) : '—'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasActiveFilter && standsLoading && (
            <p className="text-center text-muted-foreground text-sm">Carregando stands...</p>
          )}

          {/* MENSAGEM QUANDO NÃO HÁ FILTRO ATIVO */}
          {!hasActiveFilter && (
            <p className="text-center text-muted-foreground text-sm">
              💡 Pesquise ou selecione uma categoria para ver os stands no mapa
            </p>
          )}
        </div>
      </main>

      <PageFooter variant="page" />
    </div>
  );
}
