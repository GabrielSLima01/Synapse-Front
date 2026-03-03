import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Trophy, MapPinned, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageFooter } from '@/components/layout/PageFooter';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { trailService, type CompletedTrail } from '@/services/trail.service';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
  const [completedTrails, setCompletedTrails] = useState<CompletedTrail[]>([]);
  const [loadingTrails, setLoadingTrails] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
      return;
    }

    if (!user) return;

    let active = true;

    trailService.getCompleted()
      .then((data) => {
        if (active) {
          setCompletedTrails(data);
        }
      })
      .catch(() => {
        if (active) {
          setCompletedTrails([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoadingTrails(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user, isLoading, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title={t('myProfile')} />

      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto space-y-4">
          <section className="bg-card border-2 border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{user.nome || user.whatsapp}</p>
                <p className="text-sm text-muted-foreground">{user.whatsapp}</p>
              </div>
            </div>
          </section>

          <section className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Trophy className="w-5 h-5" />
              <h2 className="font-bold">{t('completedTrails')}</h2>
            </div>

            {loadingTrails ? (
              <p className="text-sm text-muted-foreground">{t('loadingTrails')}</p>
            ) : completedTrails.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('noCompletedTrails')}
              </p>
            ) : (
              <div className="space-y-3">
                {completedTrails.map((item) => (
                  <article key={item.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-foreground">{item.trail.name}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {item.trail.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('completedOn')} {new Date(item.completedAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      {item.trail.stands.length} {t('standsCompleted')}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <button
            onClick={() => navigate('/map')}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold flex items-center justify-center gap-2"
          >
            <MapPinned className="w-5 h-5" />
            {t('exploreNewTrails')}
          </button>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
