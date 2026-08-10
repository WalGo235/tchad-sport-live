import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function tokenValide(request: Request): boolean {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '');
  return Boolean(process.env.REPORT_TOKEN) && token === process.env.REPORT_TOKEN;
}

async function envoyerTelegram(texte: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return; // pas configuré → on ignore silencieusement

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: texte, parse_mode: 'HTML' }),
    });
  } catch {
    // une notif Telegram ratée ne doit jamais faire échouer la mise à jour du score
  }
}

function messagePourAction(
  action: string,
  home: string,
  away: string,
  homeScore: number,
  awayScore: number
): string | null {
  switch (action) {
    case 'but':
      return `⚽ BUT ! <b>${home} ${homeScore} - ${awayScore} ${away}</b>`;
    case 'debut_match':
      return `🟢 Ça commence : <b>${home}</b> vs <b>${away}</b> !`;
    case 'mi_temps':
      return `⏸️ Mi-temps : <b>${home} ${homeScore} - ${awayScore} ${away}</b>`;
    case 'fin_match':
      return `🏁 Fin du match : <b>${home} ${homeScore} - ${awayScore} ${away}</b>`;
    default:
      return null; // ex: correction_score → pas de notif, pour éviter le bruit
  }
}

// Liste des matchs à venir / en cours
export async function GET(request: Request) {
  if (!tokenValide(request)) {
    return NextResponse.json({ error: 'Code invalide' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('matches')
    .select(
      `*,
      home_team:teams!matches_home_team_id_fkey(id,name,abbreviation),
      away_team:teams!matches_away_team_id_fkey(id,name,abbreviation)`
    )
    .in('status', ['scheduled', 'live'])
    .order('match_date', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ matches: data });
}

// Mise à jour d'un match (score, statut, minute) + notification Telegram
export async function POST(request: Request) {
  if (!tokenValide(request)) {
    return NextResponse.json({ error: 'Code invalide' }, { status: 401 });
  }

  const body = await request.json();
  const { match_id, patch, action } = body;

  if (!match_id || !patch || typeof patch !== 'object') {
    return NextResponse.json({ error: 'Requête incomplète' }, { status: 400 });
  }

  const champsAutorises = ['home_score', 'away_score', 'status', 'minute'];
  const patchNettoye = Object.fromEntries(
    Object.entries(patch).filter(([key]) => champsAutorises.includes(key))
  );

  const { data: match, error } = await supabaseAdmin
    .from('matches')
    .update(patchNettoye)
    .eq('id', match_id)
    .select(
      `*,
      home_team:teams!matches_home_team_id_fkey(name),
      away_team:teams!matches_away_team_id_fkey(name)`
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from('activity_logs').insert({
    user_email: 'reporter-token',
    action: action ?? 'report_update',
    entity_type: 'match',
    entity_id: match_id,
    details: patchNettoye,
  });

  if (match && action) {
    const texte = messagePourAction(
      action,
      match.home_team?.name ?? '?',
      match.away_team?.name ?? '?',
      match.home_score,
      match.away_score
    );
    if (texte) await envoyerTelegram(texte);
  }

  return NextResponse.json({ ok: true });
}
