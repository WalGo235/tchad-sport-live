import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { Image } from 'expo-image';
import { apiService } from '../services/api';
import { supabase } from '../config/supabase';
import { useAppStore } from '../store/appStore';
import CommentSection from '../components/CommentSection';
import { useLanguage } from '../contexts/LanguageContext';

const web = {
  background: '#0A0E17',
  card: '#141B2E',
  cardBorder: '#1F2A42',
  navy: '#0F1E36',
  gold: '#FCD34D',
  red: '#DC2626',
  gray: '#2A3548',
  textPrimary: '#FFFFFF',
  textMuted: '#8891A5',
};

const EVENT_ICONS = {
  but: '⚽',
  carton_jaune: '🟨',
  carton_rouge: '🟥',
  remplacement: '🔄',
};

export default function MatchDetailScreen({ route }) {
  const { t } = useLanguage();
  const { matchId } = route.params;
  const user = useAppStore((state) => state.user);
  const [match, setMatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [lineups, setLineups] = useState([]);
  const [headToHead, setHeadToHead] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiService.getMatchById(matchId);
      setMatch(data);

      const [eventsData, statsData, lineupsData, h2hData, likesData] = await Promise.all([
        apiService.getMatchEvents(matchId),
        apiService.getMatchStats(matchId),
        apiService.getMatchLineups(matchId),
        data.home_team_id && data.away_team_id
          ? apiService.getHeadToHead(data.home_team_id, data.away_team_id, matchId)
          : Promise.resolve([]),
        apiService.getLikesForTargets('match', [matchId]),
      ]);
      setEvents(eventsData);
      setStats(statsData);
      setLineups(lineupsData);
      setHeadToHead(h2hData);
      setLikeCount(likesData.length);
      setLikedByMe(user ? likesData.some((l) => l.user_id === user.id) : false);
    } catch (error) {
      console.error('Error loading match detail:', error);
    }
  }, [matchId, user]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel(`match-detail-${matchId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_events', filter: `match_id=eq.${matchId}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_stats', filter: `match_id=eq.${matchId}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_likes' }, () => load())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, load]);

  const handleToggleLike = async () => {
    if (!user) return;
    try {
      const newState = await apiService.toggleLike('match', matchId);
      setLikedByMe(newState);
      setLikeCount((c) => (newState ? c + 1 : Math.max(0, c - 1)));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShareWhatsApp = () => {
    if (!match) return;
    const scoreLine =
      match.status === 'finished' || match.status === 'live'
        ? `${match.home_score ?? 0} - ${match.away_score ?? 0}`
        : new Date(match.match_date).toLocaleString('fr-FR');
    const text = `⚽ ${match.home_team?.name} ${scoreLine} ${match.away_team?.name}\n${match.competition?.name?.trim() || ''}\n\nTchadSportLive`;
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const getStatusLabel = (status) => {
    if (status === 'scheduled') return t('statusScheduled');
    if (status === 'live') return t('statusLive');
    if (status === 'postponed') return t('statusPostponed');
    return t('statusFinished');
  };

  const renderTeamBadge = (team) => {
    if (team?.logo_url) {
      return <Image source={{ uri: team.logo_url }} style={styles.teamLogo} contentFit="contain" />;
    }
    const initial = team?.name ? team.name.trim().charAt(0).toUpperCase() : '?';
    return (
      <View style={styles.teamLogoPlaceholder}>
        <Text style={styles.teamLogoInitial}>{initial}</Text>
      </View>
    );
  };

  const renderStatBar = (homeVal, awayVal, label) => {
    const h = homeVal ?? 0;
    const a = awayVal ?? 0;
    const total = h + a || 1;
    const homePercent = (h / total) * 100;
    return (
      <View style={styles.statRow} key={label}>
        <View style={styles.statNumbersRow}>
          <Text style={styles.statNumber}>{h}</Text>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={styles.statNumber}>{a}</Text>
        </View>
        <View style={styles.statBarTrack}>
          <View style={[styles.statBarHome, { width: `${homePercent}%` }]} />
          <View style={[styles.statBarAway, { width: `${100 - homePercent}%` }]} />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={web.gold} />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>{t('matchNotFound')}</Text>
      </View>
    );
  }

  const homeLineup = lineups.filter((l) => l.team_id === match.home_team_id);
  const awayLineup = lineups.filter((l) => l.team_id === match.away_team_id);

  return (
    <ScrollView style={styles.container}>
      {match.competition?.name ? (
        <Text style={styles.competitionLabel}>{match.competition.name.trim()}</Text>
      ) : null}

      <View style={styles.scoreCard}>
        <Text style={styles.statusText}>{getStatusLabel(match.status)}</Text>
        <View style={styles.teamsRow}>
          <View style={styles.teamCol}>
            {renderTeamBadge(match.home_team)}
            <Text style={styles.teamNameLarge} numberOfLines={2}>{match.home_team?.name}</Text>
          </View>

          {match.status === 'finished' || match.status === 'live' ? (
            <Text style={styles.scoreLarge}>{match.home_score ?? 0} - {match.away_score ?? 0}</Text>
          ) : (
            <Text style={styles.timeLarge}>
              {new Date(match.match_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}

          <View style={styles.teamCol}>
            {renderTeamBadge(match.away_team)}
            <Text style={styles.teamNameLarge} numberOfLines={2}>{match.away_team?.name}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.dateText}>
        {new Date(match.match_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </Text>
      {match.venue ? <Text style={styles.venueText}>{match.venue}</Text> : null}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.likeButton} onPress={handleToggleLike} disabled={!user}>
          <Text style={styles.likeIcon}>{likedByMe ? '❤️' : '🤍'}</Text>
          <Text style={styles.likeCountText}>{likeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShareWhatsApp}>
          <Text style={styles.shareButtonText}>📱 {t('shareWhatsApp')}</Text>
        </TouchableOpacity>
      </View>

      {events.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('eventsTitle')}</Text>
          {events.map((event) => (
            <View key={event.id} style={styles.eventRow}>
              <Text style={styles.eventMinute}>{event.minute}'</Text>
              <Text style={styles.eventIcon}>{EVENT_ICONS[event.event_type] || '⚽'}</Text>
              <Text style={styles.eventPlayerName} numberOfLines={1}>
                {event.player?.name || t('unknownPlayer')}
              </Text>
              <Text style={styles.eventTeam} numberOfLines={1}>
                {event.team_id === match.home_team_id ? match.home_team?.name : match.away_team?.name}
              </Text>
            </View>
          ))}
        </View>
      )}

      {stats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('statsTitle')}</Text>
          {renderStatBar(stats.possession_home, stats.possession_away, t('possessionLabel'))}
          {renderStatBar(stats.shots_home, stats.shots_away, t('shotsLabel'))}
          {renderStatBar(stats.shots_on_target_home, stats.shots_on_target_away, t('shotsOnTargetLabel'))}
          {renderStatBar(stats.corners_home, stats.corners_away, t('cornersLabel'))}
          {renderStatBar(stats.fouls_home, stats.fouls_away, t('foulsLabel'))}
          {renderStatBar(stats.offsides_home, stats.offsides_away, t('offsidesLabel'))}
        </View>
      )}

      {lineups.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('lineupsTitle')}</Text>
          <View style={styles.lineupsRow}>
            <View style={styles.lineupCol}>
              <Text style={styles.lineupTeamName} numberOfLines={1}>{match.home_team?.name}</Text>
              <Text style={styles.lineupSubheader}>{t('startersLabel')}</Text>
              {homeLineup.map((l) => (
                <Text key={l.id} style={styles.lineupPlayer}>
                  {l.player?.name || t('unknownPlayer')}{l.position ? ` (${l.position})` : ''}
                </Text>
              ))}
            </View>
            <View style={styles.lineupCol}>
              <Text style={styles.lineupTeamName} numberOfLines={1}>{match.away_team?.name}</Text>
              <Text style={styles.lineupSubheader}>{t('startersLabel')}</Text>
              {awayLineup.map((l) => (
                <Text key={l.id} style={styles.lineupPlayer}>
                  {l.player?.name || t('unknownPlayer')}{l.position ? ` (${l.position})` : ''}
                </Text>
              ))}
            </View>
          </View>
        </View>
      )}

      {headToHead.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('headToHeadTitle')}</Text>
          {headToHead.map((h2h) => (
            <View key={h2h.id} style={styles.h2hRow}>
              <Text style={styles.h2hText} numberOfLines={1}>
                {h2h.home_team?.name} {h2h.home_score} - {h2h.away_score} {h2h.away_team?.name}
              </Text>
              <Text style={styles.h2hDate}>{new Date(h2h.match_date).toLocaleDateString('fr-FR')}</Text>
            </View>
          ))}
        </View>
      )}

      <CommentSection targetType="match" targetId={match.id} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: web.background },
  loadingContainer: { flex: 1, backgroundColor: web.background, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: web.textMuted },
  competitionLabel: { fontSize: 11, fontWeight: '700', color: web.textMuted, textTransform: 'uppercase', textAlign: 'center', marginTop: 16, marginBottom: 8, letterSpacing: 0.5 },
  scoreCard: { backgroundColor: web.card, borderRadius: 14, borderWidth: 1, borderColor: web.cardBorder, marginHorizontal: 15, padding: 20, alignItems: 'center' },
  statusText: { fontSize: 12, fontWeight: '600', color: web.textMuted, marginBottom: 16 },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  teamCol: { flex: 1, alignItems: 'center' },
  teamLogo: { width: 56, height: 56, borderRadius: 28, marginBottom: 8 },
  teamLogoPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: web.gray, marginBottom: 8, alignItems: 'center', justifyContent: 'center' },
  teamLogoInitial: { color: web.textPrimary, fontWeight: '700', fontSize: 20 },
  teamNameLarge: { fontSize: 13, fontWeight: '600', color: web.textPrimary, textAlign: 'center' },
  scoreLarge: { fontSize: 32, fontWeight: '700', color: web.textPrimary, marginHorizontal: 10 },
  timeLarge: { fontSize: 20, fontWeight: '700', color: web.textPrimary, marginHorizontal: 10 },
  dateText: { fontSize: 13, color: web.textMuted, textAlign: 'center', marginTop: 16, textTransform: 'capitalize' },
  venueText: { fontSize: 13, color: web.textMuted, textAlign: 'center', marginTop: 2 },
  actionsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 16, marginBottom: 8 },
  likeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: web.card, borderWidth: 1, borderColor: web.cardBorder, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  likeIcon: { fontSize: 15, marginRight: 6 },
  likeCountText: { color: web.textPrimary, fontSize: 13, fontWeight: '600' },
  shareButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: web.card, borderWidth: 1, borderColor: web.cardBorder, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  shareButtonText: { color: web.textPrimary, fontSize: 13, fontWeight: '600' },
  section: { backgroundColor: web.card, borderRadius: 14, borderWidth: 1, borderColor: web.cardBorder, marginHorizontal: 15, marginTop: 15, padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: web.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  eventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: web.cardBorder },
  eventMinute: { width: 32, fontSize: 12, color: web.textMuted, fontWeight: '600' },
  eventIcon: { fontSize: 15, marginRight: 8 },
  eventPlayerName: { flex: 1, fontSize: 13, color: web.textPrimary, fontWeight: '600' },
  eventTeam: { fontSize: 11, color: web.textMuted, maxWidth: 90, textAlign: 'right' },
  statRow: { marginBottom: 14 },
  statNumbersRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  statNumber: { fontSize: 13, fontWeight: '700', color: web.textPrimary, width: 30 },
  statLabel: { fontSize: 12, color: web.textMuted, flex: 1, textAlign: 'center' },
  statBarTrack: { flexDirection: 'row', height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: web.gray },
  statBarHome: { backgroundColor: web.gold },
  statBarAway: { backgroundColor: web.red },
  lineupsRow: { flexDirection: 'row', gap: 12 },
  lineupCol: { flex: 1 },
  lineupTeamName: { fontSize: 13, fontWeight: '700', color: web.textPrimary, marginBottom: 4 },
  lineupSubheader: { fontSize: 11, color: web.textMuted, marginBottom: 8 },
  lineupPlayer: { fontSize: 12, color: web.textPrimary, marginBottom: 6 },
  h2hRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: web.cardBorder },
  h2hText: { flex: 1, fontSize: 12, color: web.textPrimary, marginRight: 8 },
  h2hDate: { fontSize: 11, color: web.textMuted },
});