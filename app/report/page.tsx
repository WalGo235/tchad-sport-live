'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';

type Status = 'scheduled' | 'live' | 'finished' | 'postponed';
type Team = { id: string; name: string; abbreviation: string | null };
type Match = {
  id: string;
  home_score: number;
  away_score: number;
  status: Status;
  minute: string | null;
  home_team: Team;
  away_team: Team;
};

export default function ReportPage() {
  const [token, setToken] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  async function unlock() {
    setLoading(true);
    setErrorMsg('');
    const res = await fetch('/api/report', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setErrorMsg('Code incorrect.');
      setLoading(false);
      return;
    }
    const data = await res.json();
    setMatches(data.matches ?? []);
    setUnlocked(true);
    setLoading(false);
  }

  async function send(matchId: string, patch: Record<string, unknown>, action: string) {
    setSavingId(matchId);
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, ...patch } : m)));
    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ match_id: matchId, patch, action }),
    });
    setSavingId(null);
  }

  function adjustScore(match: Match, side: 'home_score' | 'away_score', delta: number) {
    const newValue = Math.max(0, match[side] + delta);
    send(match.id, { [side]: newValue }, delta > 0 ? 'but' : 'correction_score');
  }

  if (!unlocked) {
    return (
      <div style={{ padding: 24, maxWidth: 360, margin: '60px auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: ACCENT }}>
          Reporter TchadSportLive
        </h1>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Code d'accès"
          style={inputStyle}
        />
        <button
          onClick={unlock}
          disabled={loading || !token}
          style={{ ...actionBtnStyle(ACCENT), marginTop: 12, width: '100%' }}
        >
          {loading ? 'Vérification…' : 'Entrer'}
        </button>
        {errorMsg && <p style={{ color: '#8B2E2E', marginTop: 10, fontSize: 14 }}>{errorMsg}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: 12, maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: ACCENT }}>
        Reporter en direct
      </h1>
      {matches.length === 0 && <p>Aucun match à venir ou en cours.</p>}
      {matches.map((match) => (
        <div key={match.id} style={cardStyle}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
            {match.status === 'live' ? `🔴 EN DIRECT ${match.minute ?? ''}` : 'À venir'}
            {savingId === match.id && ' · Enregistrement…'}
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
              <button
                onClick={() => send(match.id, { status: 'live', minute: "1'" }, 'debut_match')}
                style={actionBtnStyle(ACCENT)}
              >
                Démarrer
              </button>
            )}
            {match.status === 'live' && (
              <>
                <button
                  onClick={() => send(match.id, { minute: 'MT' }, 'mi_temps')}
                  style={actionBtnStyle(GOLD)}
                >
                  Mi-temps
                </button>
                <button
                  onClick={() => send(match.id, { status: 'finished', minute: 'FIN' }, 'fin_match')}
                  style={actionBtnStyle('#8B2E2E')}
                >
                  Terminer
                </button>
              </>
            )}
          </div>
        </div>
      ))}
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

const cardStyle: CSSProperties = { border: '1px solid #ddd', borderRadius: 10, padding: 12, marginBottom: 12 };
const inputStyle: CSSProperties = {
  width: '100%',
  padding: 12,
  fontSize: 16,
  borderRadius: 8,
  border: '1px solid #ccc',
  boxSizing: 'border-box',
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
