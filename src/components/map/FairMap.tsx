import { useState, useRef } from 'react';
import { MapMarker } from '@/types';
import mapaFenearte from '@/assets/mapa-fenearte.png';
import { MapPin, Coffee, Info, AlertTriangle, Music, HelpCircle, ArrowRight, ZoomIn, ZoomOut, X, RotateCcw, ChevronDown, ChevronUp, Navigation, Maximize2, Minimize2 } from 'lucide-react';

// Marker icons and colors
const MARKER_CONFIG: Record<string, { icon: typeof MapPin; color: string; label: string }> = {
  FOOD: { icon: Coffee, color: '#f97316', label: 'Alimentação' },
  INFO: { icon: Info, color: '#3b82f6', label: 'Informação' },
  EMERGENCY: { icon: AlertTriangle, color: '#dc2626', label: 'Emergência' },
  STAGE: { icon: Music, color: '#9333ea', label: 'Palco' },
  ENTRANCE: { icon: ArrowRight, color: '#16a34a', label: 'Entrada' },
  BATHROOM: { icon: Navigation, color: '#0891b2', label: 'Banheiro' },
  STAND: { icon: MapPin, color: '#8b5cf6', label: 'Stand' },
  OTHER: { icon: HelpCircle, color: '#6b7280', label: 'Outro' },
};

interface FairMapProps {
  markers: MapMarker[];
  highlightStandLocation?: { x: number; y: number; label: string };
  readonly?: boolean;
  onMarkerMove?: (id: string, x: number, y: number) => void;
  onMapClick?: (x: number, y: number) => void;
  className?: string;
  zoomEnabled?: boolean;
}

const IMAGE_ASPECT_RATIO = 1.5;

export function FairMap({ 
  markers, 
  highlightStandLocation, 
  readonly = true, 
  onMarkerMove, 
  onMapClick,
  className = "",
  zoomEnabled = true
}: FairMapProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    if (onMapClick) onMapClick(x, y);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!zoomEnabled) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!zoomEnabled || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
  };

  const handleTouchEnd = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const getMarkerConfig = (type: string) => MARKER_CONFIG[type] || MARKER_CONFIG.OTHER;

  // Fullscreen wrapper classes
  const wrapperClasses = isFullscreen 
    ? "fixed inset-0 z-[9999] bg-black" 
    : `relative ${className}`;

  const containerClasses = isFullscreen
    ? "w-full h-full"
    : "relative rounded-xl overflow-hidden border-2 border-gray-200 bg-white shadow-lg";

  return (
    <div className={wrapperClasses}>
      <div className={containerClasses}>
        
        {/* Controls - Top Right */}
        <div className="absolute top-2 right-2 z-40 flex gap-1">
          {/* Fullscreen Toggle */}
          <button 
            onClick={toggleFullscreen}
            className="w-9 h-9 bg-white/90 backdrop-blur rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-white border border-gray-200"
            title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          {zoomEnabled && (
            <>
              <button onClick={handleZoomIn} className="w-9 h-9 bg-white/90 backdrop-blur rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-white border border-gray-200">
                <ZoomIn className="w-4 h-4" />
              </button>
              <button onClick={handleZoomOut} className="w-9 h-9 bg-white/90 backdrop-blur rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-white border border-gray-200">
                <ZoomOut className="w-4 h-4" />
              </button>
              <button onClick={handleReset} className="w-9 h-9 bg-white/90 backdrop-blur rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-white border border-gray-200">
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Close button for fullscreen mode */}
        {isFullscreen && (
          <button 
            onClick={toggleFullscreen}
            className="absolute top-2 left-2 z-40 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Collapsible Legend Toggle - Bottom Left */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="absolute bottom-2 left-2 z-40 bg-white/95 backdrop-blur rounded-lg shadow-md px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:bg-white border border-gray-200"
        >
          Legenda
          {showLegend ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>

        {/* Expanded Legend Panel */}
        {showLegend && (
          <div className="absolute bottom-12 left-2 z-40 bg-white/95 backdrop-blur rounded-xl shadow-xl p-3 border border-gray-200 animate-fade-in">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {Object.entries(MARKER_CONFIG).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <div key={type} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: config.color }}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">{config.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Zoom Level - Bottom Right */}
        <div className="absolute bottom-2 right-2 z-40 bg-white/90 backdrop-blur rounded-lg px-2 py-1 text-xs font-bold text-gray-500 border border-gray-200 shadow-sm">
          {Math.round(zoom * 100)}%
        </div>

        {/* Fixed Aspect Ratio Map (or full in fullscreen) */}
        <div 
          className="w-full relative" 
          style={{ paddingBottom: isFullscreen ? '0' : `${(1 / IMAGE_ASPECT_RATIO) * 100}%`, height: isFullscreen ? '100%' : undefined }}
        >
          <div
            className="absolute inset-0 cursor-grab active:cursor-grabbing bg-gray-50"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transformOrigin: 'center',
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
            onClick={handleMapClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Map Image */}
            <img 
              src={mapaFenearte} 
              alt="Mapa da FENEARTE" 
              className={`absolute inset-0 w-full h-full pointer-events-none select-none ${isFullscreen ? 'object-contain' : 'object-cover'}`}
              draggable={false}
            />

            {/* Markers */}
            {markers.map((marker) => {
              const config = getMarkerConfig(marker.type);
              const Icon = config.icon;
              const isSelected = selectedMarker?.id === marker.id;
              
              return (
                <button
                  key={marker.id}
                  className="absolute transform -translate-x-1/2 -translate-y-full group"
                  style={{ left: `${marker.x}%`, top: `${marker.y}%`, zIndex: isSelected ? 25 : 10 }}
                  onClick={(e) => { e.stopPropagation(); setSelectedMarker(isSelected ? null : marker); }}
                >
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-transform ${isSelected ? 'scale-125' : 'hover:scale-110'}`}
                    style={{ backgroundColor: config.color }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                      {marker.name}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Highlight Stand */}
            {highlightStandLocation && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-full z-30"
                style={{ left: `${highlightStandLocation.x}%`, top: `${highlightStandLocation.y}%` }}
              >
                <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center shadow-xl border-3 border-white animate-bounce">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-violet-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap shadow-lg">
                  {highlightStandLocation.label}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Marker Info */}
      {selectedMarker && (
        <div className={`absolute ${isFullscreen ? 'bottom-4' : 'bottom-0'} left-0 right-0 z-50 p-3`}>
          <div className="bg-white rounded-xl shadow-xl p-4 border border-gray-200 max-w-sm mx-auto relative">
            <button onClick={() => setSelectedMarker(null)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: getMarkerConfig(selectedMarker.type).color }}>
                {(() => { const Icon = getMarkerConfig(selectedMarker.type).icon; return <Icon className="w-5 h-5 text-white" />; })()}
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{selectedMarker.name}</h4>
                <p className="text-xs text-gray-500">{getMarkerConfig(selectedMarker.type).label}</p>
              </div>
            </div>
            {selectedMarker.description && <p className="text-sm text-gray-600 mt-2">{selectedMarker.description}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
