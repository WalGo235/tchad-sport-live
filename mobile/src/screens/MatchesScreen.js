import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/appStore';
import { apiService } from '../services/api';
import { supabase } from '../config/supabase';
import { brand } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function MatchesScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = createStyles(colors);
  const { matches, setMatches } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={brand.blue} />
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return brand.gold;
      case 'live': return brand.red;
      case 'finished': return brand.green;
      default: return colors.textMuted;
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'scheduled') return t('statusScheduled');
    if (status === 'live') return t('statusLive');
    return t('statusFinished');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brand.blue} colors={[brand.blue]} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('matchesTitle')}</Text>
        </View>

        {matches.map(match => (
          <TouchableOpacity
            key={match.id}
            style={styles.matchCard}
            onPress={() => navigation.navigate('MatchDetail', { matchId: match.id })}
          >
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(match.status) }]}>
              <Text style={styles.statusText}>{getStatusLabel(match.status)}</Text>
            </View>
            
            <View style={styles.matchContent}>
              <Text style={styles.date}>{new Date(match.match_date).toLocaleDateString('fr-FR')}</Text>
              
              <View style={styles.teamsContainer}>
                <View style={styles.team}>
                  <Text style={styles.teamName}>{match.home_team?.name}</Text>
                </View>
                
                <View style={styles.vs}>
                  {match.status === 'finished' ? (
                    <Text style={styles.score}>{match.home_score} - {match.away_score}</Text>
                  ) : (
                    <Text style={styles.time}>{new Date(match.match_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
                  )}
                </View>
                
                <View style={styles.team}>
                  <Text style={styles.teamName}>{match.away_team?.name}</Text>
                </View>
              </View>
              
              <Text style={styles.stadium}>📍 {match.venue || t('stadium')}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: brand.blue },
    container: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: brand.blue, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    matchCard: { backgroundColor: colors.card, margin: 10, borderRadius: 8, overflow: 'hidden', borderLeftWidth: 4, borderLeftColor: brand.red },
    statusBadge: { padding: 8, alignItems: 'center' },
    statusText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    matchContent: { padding: 15 },
    date: { fontSize: 12, color: colors.textMuted, marginBottom: 10 },
    teamsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    team: { flex: 1 },
    teamName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' },
    vs: { flex: 0.3, alignItems: 'center' },
    score: { fontSize: 18, fontWeight: 'bold', color: brand.blue },
    time: { fontSize: 12, color: colors.textSecondary },
    stadium: { fontSize: 12, color: colors.textSecondary },
  });
}