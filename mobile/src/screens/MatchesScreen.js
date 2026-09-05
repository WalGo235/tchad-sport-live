import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/appStore';
import { apiService } from '../services/api';
import { supabase } from '../config/supabase';
import { spacing } from '../theme';
import { useLanguage } from '../contexts/LanguageContext';

const web = {
  background: '#0A0E17',
  card: '#141B2E',
  cardBorder: '#1F2A42',
  navy: '#0F1E36',
  gold: '#FCD34D',
  red: '#DC2626',
  green: '#10B981',
  gray: '#2A3548',
  textPrimary: '#FFFFFF',
  textMuted: '#8891A5',
};

const FILTERS = ['all', 'upcoming', 'live', 'finished'];

export default function MatchesScreen({ navigation }) {
  const { t } = useLanguage();
  const { matches, setMatches } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const loadMatches = useCallback(async () => {
    try {
      const data = await apiService.getMatches();
      setMatches(data);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadMatches().finally(() => setLoading(false));
  }, [loadMatches]);

  useEffect(() => {
    const channel = supabase
      .channel('matches-list-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
        loadMatches();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMatches]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  const filteredMatches = useMemo(() => {
    if (activeFilter === 'all') return matches;
    if (activeFilter === 'upcoming') return matches.filter(m => m.status === 'scheduled');
    if (activeFilter === 'live') return matches.filter(m => m.status === 'live');
    if (activeFilter === 'finished') return matches.filter(m => m.status === 'finished');
    return matches;
  }, [matches, activeFilter]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={web.gold} />
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return web.gold;
      case 'live': return web.red;
      case 'finished': return web.gray;
      case 'postponed': return web.gray;
      default: return web.gray;
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'scheduled') return t('statusScheduled');
    if (status === 'live') return t('statusLive');
    if (status === 'postponed') return t('statusPostponed');
    return t('statusFinished');
  };

  const getFilterLabel = (key) => {
    if (key === 'all') return t('filterAll');
    if (key === 'upcoming') return t('filterUpcoming');
    if (key === 'live') return t('filterLive');
    return t('filterFinished');
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('matchesTitle')}</Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterPill, activeFilter === key && styles.filterPillActive]}
            onPress={() => setActiveFilter(key)}
          >
            <Text style={[styles.filterText, activeFilter === key && styles.filterTextActive]}>
              {getFilterLabel(key)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={web.gold} colors={[web.gold]} />}
      >
        {filteredMatches.map(match => (
          <TouchableOpacity
            key={match.id}
            style={styles.matchCard}
            onPress={() => navigation.navigate('MatchDetail', { matchId: match.id })}
          >
            <View style={styles.cardTopRow}>
              <Text style={styles.competitionText} numberOfLines={1}>
                {match.competition?.name ? match.competition.name.trim() : ''}
              </Text>
              <View style={[styles.statusPill, { backgroundColor: getStatusColor(match.status) }]}>
                <Text style={styles.statusPillText}>{getStatusLabel(match.status)}</Text>
              </View>
            </View>

            <View style={styles.teamsRow}>
              <View style={styles.teamBlock}>
                {renderTeamBadge(match.home_team)}
                <Text style={styles.teamName} numberOfLines={1}>{match.home_team?.name}</Text>
              </View>

              <View style={styles.centerBlock}>
                {match.status === 'finished' || match.status === 'live' ? (
                  <Text style={styles.scoreText}>{match.home_score ?? 0} - {match.away_score ?? 0}</Text>
                ) : (
                  <Text style={styles.timeText}>
                    {new Date(match.match_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                )}
              </View>

              <View style={styles.teamBlock}>
                {renderTeamBadge(match.away_team)}
                <Text style={styles.teamName} numberOfLines={1}>{match.away_team?.name}</Text>
              </View>
            </View>

            <View style={styles.cardBottomRow}>
              <Text style={styles.metaText}>
                📅 {new Date(match.match_date).toLocaleDateString('fr-FR')}
                {match.venue ? `  ·  ${match.venue}` : ''}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: web.navy },
  container: { flex: 1, backgroundColor: web.background },
  loadingContainer: { flex: 1, backgroundColor: web.background, alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: web.navy, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle: { fontSize: 22, fontWeight: '700', color: web.textPrimary },
  filterRow: { flexDirection: 'row', backgroundColor: web.navy, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  filterPill: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: 20, backgroundColor: web.gray },
  filterPillActive: { backgroundColor: web.gold },
  filterText: { fontSize: 12, fontWeight: '600', color: web.textMuted },
  filterTextActive: { color: web.navy },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  matchCard: {
    backgroundColor: web.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: web.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  competitionText: { fontSize: 11, fontWeight: '600', color: web.gold, textTransform: 'uppercase', flex: 1, marginRight: spacing.sm },
  statusPill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: 10 },
  statusPillText: { fontSize: 10, fontWeight: '700', color: web.textPrimary },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamBlock: { flex: 1, alignItems: 'center' },
  teamLogo: { width: 44, height: 44, borderRadius: 22, marginBottom: spacing.xs },
  teamLogoPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: web.gray, marginBottom: spacing.xs, alignItems: 'center', justifyContent: 'center' },
  teamLogoInitial: { color: web.textPrimary, fontWeight: '700', fontSize: 16 },
  teamName: { fontSize: 12, fontWeight: '600', color: web.textPrimary, textAlign: 'center' },
  centerBlock: { paddingHorizontal: spacing.sm, alignItems: 'center' },
  scoreText: { fontSize: 22, fontWeight: '700', color: web.textPrimary },
  timeText: { fontSize: 14, fontWeight: '600', color: web.textMuted },
  cardBottomRow: { marginTop: spacing.md, borderTopWidth: 1, borderTopColor: web.cardBorder, paddingTop: spacing.sm },
  metaText: { fontSize: 11, color: web.textMuted },
});