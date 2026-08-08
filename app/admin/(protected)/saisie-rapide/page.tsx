'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { createClient } from '@/lib/supabase/client';

type Status = 'scheduled' | 'live' | 'finished' | 'postponed';

type Team = {
  id: string;
  name: string;
  abbreviation: string | null;
  logo_url: string | null;
};

type Match = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  status: Status;
  minute: string | null;
  match_date: string;
  home_team: Team;
  away_team: Team;
};

export default function SaisieRapidePage() {
  const supabase = createClient(); // ← client navigateur

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('matches')
        .select(
          `*,
          home_team:teams!matches_home_team_id_fkey(id,name,abbreviation,logo_url),
          away_team:teams!matches_away_team_id_fkey(id,name,abbreviation,logo_url)`
        )
        .in('status', ['scheduled', 'live'])
        .order('match_date', { ascending: true });

      if (fetchError) {
        console.error('Erreur chargement matchs:', fetchError);
        setError('Impossible de charger les matchs. Réessaie.');
        setMatches([]);
      } else if (data) {
        setMatches(data as unknown as Match[]);
      }
    } catch (err) {
      console.error('Erreur inattendue (loadMatches):', err);
      setError('Erreur réseau. Vérifie ta connexion.');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  async function logAction(matchId: string, action: string, details: Record<string, unknown>) {
    try {
      const { data } = await supabase.auth.getUser();
      const { error: logError } = await supabase.from('activity_logs').insert({
        user_email: data.user?.email ?? 'admin',
        action,
        entity_type: 'match',
        entity_id: matchId,
        details,
      });

      if (logError) {
        console.error('Erreur log activité:', logError);
      }
    } catch (err) {
      console.error('Erreur inattendue (logAction):', err);
    }
  }

  async function updateMatch(matchId: string, patch: Record<string, unknown>, action: string) {
    setSavingId(matchId);
    setError(null);

    // Mise à jour optimiste
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, ...patch } : m)));

    try {
      const { error: updateError } = await supabase
        .from('matches')
        .update(patch)
        .eq('id', matchId);

      if (updateError) {
        console.error('Erreur mise à jour match:', updateError);
        setError('Erreur lors de la mise à jour. Rechargement…');
        await loadMatches(); // annule l’optimiste
      } else {
        await logAction(matchId, action, patch);
      }
    } catch (err) {
      console.error('Erreur inattendue (updateMatch):', err);
      setError('Erreur réseau. Rechargement…');
      await loadMatches();
    } finally {
      setSavingId(null);
    }
  }

  function adjustScore(match: Match, side: 'home_score' | 'away_score', delta: number) {
    const newValue = Math.max(0, match[side] + delta);
    updateMatch(match.id, { [side]: newValue }, delta > 0 ? 'but' : 'correction_score');
  }

  function startMatch(match: Match) {
    updateMatch(match.id, { status: 'live', minute: "1'" }, 'debut_match');
  }

  function setHalfTime(match: Match) {
    updateMatch(match.id, { minute: 'MT' }, 'mi_temps');
  }

  function finishMatch(match: Match) {
    updateMatch(match.id, { status: 'finished', minute: 'FIN' }, 'fin_match');
  }

  if (loading) return <p style={{ padding: 16 }}>Chargement des matchs…</p>;

  return (
    <div style={{ padding: 12, maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: ACCENT }}>
        Saisie rapide
      </h1>

      {error && (
        <div style={errorStyle}>
          {error}
          <button onClick={() => setError(null)} style={errorCloseStyle}>
            ×
          </button>
        </div>
      )}

      {matches.length === 0 && !error ? (
        <p style={{ padding: 16 }}>Aucun match à venir ou en cours pour l'instant.</p>
      ) : (
        matches.map((match) => (
          <div key={match.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 8 }}>
              <span>
                {match.status === 'live'
                  ? `🔴 EN DIRECT ${match.minute ?? ''}`
                  : 'À venir'}
              </span>
              {savingId === match.id && <span>Enregistrement…</span>}
            </div>

            <ScoreRow
              team={match.home_team}
              score={match.home_score}
              onPlus={() => adjustScore(match, 'home_score', 1)}
              onMinus={() => adjustScore(match, 'home_score', -1)}
            />
            <ScoreRow
              team={match.away_team}
              score={match.away_score}
              onPlus={() => adjustScore(match, 'away_score', 1)}
              onMinus={() => adjustScore(match, 'away_score', -1)}
            />

            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {match.status === 'scheduled' && (
                <button onClick={() => startMatch(match)} style={actionBtnStyle(ACCENT)}>
                  Démarrer
                </button>
              )}
              {match.status === 'live' && (
                <>
                  <button onClick={() => setHalfTime(match)} style={actionBtnStyle(GOLD)}>
                    Mi-temps
                  </button>
                  <button onClick={() => finishMatch(match)} style={actionBtnStyle('#8B2E2E')}>
                    Terminer
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ScoreRow({
  team,
  score,
  onPlus,
  onMinus,
}: {
  team: Team;
  score: number;
  onPlus: () => void;
  onMinus: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
      <span style={{ fontSize: 16, fontWeight: 500 }}>{team?.name ?? '—'}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onMinus} aria-label={`Retirer un but à ${team?.name}`} style={roundBtnStyle}>
          −
        </button>
        <span style={{ fontSize: 22, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{score}</span>
        <button onClick={onPlus} aria-label={`Ajouter un but à ${team?.name}`} style={roundBtnStyle}>
          +
        </button>
      </div>
    </div>
  );
}

const ACCENT = '#1B4B3A';
const GOLD = '#B8860B';

const cardStyle: CSSProperties = {
  border: '1px solid #ddd',
  borderRadius: 10,
  padding: 12,
  marginBottom: 12,
};

const roundBtnStyle: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 22,
  border: 'none',
  background: ACCENT,
  color: 'white',
  fontSize: 22,
  fontWeight: 700,
};

const errorStyle: CSSProperties = {
  background: '#FEE2E2',
  color: '#991B1B',
  padding: '10px 12px',
  borderRadius: 8,
  marginBottom: 12,
  fontSize: 14,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const errorCloseStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#991B1B',
  fontSize: 20,
  cursor: 'pointer',
  padding: 0,
  lineHeight: 1,
};

function actionBtnStyle(bg: string): CSSProperties {
  return {
    flex: 1,
    padding: '10px 0',
    borderRadius: 8,
    border: 'none',
    background: bg,
    color: 'white',
    fontWeight: 600,
    fontSize: 14,
  };
}
