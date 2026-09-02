import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/appStore';
import { apiService } from '../services/api';
import { supabase } from '../config/supabase';
import { colors, radius, shadow, spacing } from '../theme';

export default function HomeScreen({ navigation }) {
  const { matches, news, setMatches, setNews } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [matchesData, newsData] = await Promise.all([
        apiService.getMatches(),
        apiService.getNews(),
      ]);
      setMatches(matchesData);
      setNews(newsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  useEffect(() => {
    const channel = supabase
      .channel('home-matches-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      </SafeAreaView>
    );
  }

  const now = new Date();
  const nextMatch = matches
    .filter(m => m.status === 'scheduled' && new Date(m.match_date) >= now)
    .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.navy} colors={[colors.navy]} />}
      >
        <Text style={styles.appTitle}>TchadSportLive</Text>
        <Text style={styles.appSubtitle}>Division 1 de Football Tchadien</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prochain match</Text>
          {nextMatch ? (
            <TouchableOpacity
              style={styles.nextMatchCard}
              onPress={() => navigation.navigate('MatchDetail', { matchId: nextMatch.id })}
            >
              <View style={styles.nextMatchTeam}>
                {nextMatch.home_team?.logo_url ? (
                  <Image source={{ uri: nextMatch.home_team.logo_url }} style={styles.teamLogo} contentFit="contain" />
                ) : (
                  <View style={styles.teamLogoPlaceholder} />
                )}
                <Text style={styles.nextMatchTeamName} numberOfLines={1}>{nextMatch.home_team?.name}</Text>
              </View>

              <View style={styles.nextMatchCenter}>
                <Text style={styles.vsLabel}>VS</Text>
                <Text style={styles.nextMatchDate}>
                  {new Date(nextMatch.match_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </Text>
                <Text style={styles.nextMatchTime}>
                  {new Date(nextMatch.match_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              <View style={styles.nextMatchTeam}>
                {nextMatch.away_team?.logo_url ? (
                  <Image source={{ uri: nextMatch.away_team.logo_url }} style={styles.teamLogo} contentFit="contain" />
                ) : (
                  <View style={styles.teamLogoPlaceholder} />
                )}
                <Text style={styles.nextMatchTeamName} numberOfLines={1}>{nextMatch.away_team?.name}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucun match à venir programmé</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Actualités</Text>
            <TouchableOpacity onPress={() => navigation.navigate('News')}>
              <Text style={styles.seeAllLink}>Voir tout →</Text>
            </TouchableOpacity>
          </View>
          {news.slice(0, 5).map(article => (
            <TouchableOpacity key={article.id} style={styles.newsRow}>
              {article.cover_image_url ? (
                <Image source={{ uri: article.cover_image_url }} style={styles.newsThumb} contentFit="cover" />
              ) : (
                <View style={[styles.newsThumb, styles.newsThumbPlaceholder]}>
                  <Text style={styles.newsThumbIcon}>📰</Text>
                </View>
              )}
              <View style={styles.newsTextBlock}>
                <Text style={styles.newsTitle} numberOfLines={2}>{article.title}</Text>
                <Text style={styles.newsDate}>{new Date(article.published_at).toLocaleDateString('fr-FR')}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  appTitle: { fontSize: 26, fontWeight: '700', color: colors.navy },
  appSubtitle: { fontSize: 13, fontWeight: '500', color: colors.textSecondary, marginTop: 2, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.navy, textTransform: 'uppercase', letterSpacing: 0.5 },
  seeAllLink: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  nextMatchCard: {
    backgroundColor: colors.navy,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow,
  },
  nextMatchTeam: { flex: 1, alignItems: 'center' },
  teamLogo: { width: 48, height: 48, marginBottom: spacing.sm },
  teamLogoPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: spacing.sm },
  nextMatchTeamName: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  nextMatchCenter: { alignItems: 'center', paddingHorizontal: spacing.sm },
  vsLabel: { color: colors.gold, fontSize: 12, fontWeight: '700', marginBottom: spacing.xs },
  nextMatchDate: { color: '#fff', fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  nextMatchTime: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadow,
  },
  emptyText: { color: colors.textMuted, fontSize: 13 },
  newsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
    ...shadow,
  },
  newsThumb: { width: 56, height: 56, borderRadius: radius.sm, backgroundColor: colors.border },
  newsThumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  newsThumbIcon: { fontSize: 20 },
  newsTextBlock: { flex: 1, marginLeft: spacing.md },
  newsTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, lineHeight: 19 },
  newsDate: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
});