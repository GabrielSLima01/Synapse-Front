import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Gift, CheckCircle2, Circle, MapPin, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageFooter } from '@/components/layout/PageFooter';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { trailService, type Trail, type TrailMission } from '@/services/trail.service';

export default function TrailMissionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();

  const category = searchParams.get('category') || '';

  const [trail, setTrail] = useState<Trail | null>(null);
  const [mission, setMission] = useState<TrailMission | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMission = async () => {
    if (!category) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const suggested = await trailService.getSuggested(category);
      setTrail(suggested);

      const missionData = await trailService.getMission(suggested.id);
      setMission(missionData);

      if (missionData.completed) {
        toast.success(t('missionCompletedToast'));
      }
    } catch {
      setTrail(null);
      setMission(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
      return;
    }

    if (!user) return;

    loadMission();
  }, [user, isLoading, category, navigate]);

  const visitedSet = useMemo(() => new Set(mission?.visitedStandIds || []), [mission]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title={t('trailTitle')} />

      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto space-y-4">
          <section className="bg-card border-2 border-primary rounded-xl p-4">
            <div className="flex items-center gap-3 text-primary">
              <Gift className="w-6 h-6" />
              <div>
                <h1 className="font-bold text-foreground">{t('yourMission')}</h1>
                <p className="text-sm text-muted-foreground">{t('missionDescription')}</p>
              </div>
            </div>
          </section>

          {loading ? (
            <p className="text-sm text-muted-foreground">{t('loadingTrail')}</p>
          ) : !category ? (
            <p className="text-sm text-muted-foreground">{t('selectCategoryOnMap')}</p>
          ) : !trail || !mission ? (
            <div className="bg-card border-2 border-border rounded-xl p-4">
              <p className="text-sm text-muted-foreground">{t('noActiveTrail')} {category}.</p>
            </div>
          ) : (
            <>
              <section className="bg-card border-2 border-border rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold text-foreground">{trail.name}</h2>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{trail.category}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('progress')}: {mission.visitedStandIds.length}/{mission.stands.length} stands
                </p>
                {mission.completed && (
                  <p className="text-sm font-semibold text-green-600">{t('missionCompleted')}</p>
                )}
              </section>

              <section className="space-y-2">
                {mission.stands.map((item) => {
                  const visited = visitedSet.has(item.stand.id);
                  return (
                    <button
                      key={item.stand.id}
                      onClick={() => navigate(`/stands/${item.stand.id}`)}
                      className="w-full bg-card border-2 border-border rounded-xl p-3 text-left hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {item.order}. {item.stand.number ? `#${item.stand.number} - ` : ''}{item.stand.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.stand.category}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {visited ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </section>

              <button
                onClick={loadMission}
                className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                {t('updateProgress')}
              </button>
            </>
          )}

          <button
            onClick={() => navigate('/map')}
            className="w-full border-2 border-border rounded-xl py-3 font-semibold text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            {t('backToMap')}
          </button>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
