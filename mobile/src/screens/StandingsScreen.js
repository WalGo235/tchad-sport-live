import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/appStore';
import { apiService } from '../services/api';
import { supabase } from '../config/supabase';
import { brand } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

export default function StandingsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { standings, setStandings } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStandings = useCallback(async () => {
    try {
      const data = await apiService.getStandings();
      setStandings(data);
    } catch (error) {
      console.error('Error loading standings:', error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadStandings().finally(() => setLoading(false));
  }, [loadStandings]);

  useEffect(() => {
    const channel = supabase
      .channel('standings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'standings' }, () => {
        loadStandings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadStandings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStandings();
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

  const renderStandingRow = ({ item, index }) => (
    <View style={[styles.row, index % 2 === 0 && styles.rowEven]}>
      <Text style={styles.position}>{index + 1}</Text>
      <Text style={styles.teamName}>{item.teams?.name}</Text>
      <View style={styles.stats}>
        <Text style={styles.stat}>{item.played}</Text>
        <Text style={styles.stat}>{item.wins}</Text>
        <Text style={styles.stat}>{item.draws}</Text>
        <Text style={styles.stat}>{item.losses}</Text>
        <Text style={styles.points}>{item.points}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🏆 Classement</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Teams')}>
            <Text style={styles.teamsLink}>⚽ Équipes →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.headerPos}>#</Text>
          <Text style={styles.headerTeam}>Équipe</Text>
          <View style={styles.headerStats}>
            <Text style={styles.headerStat}>J</Text>
            <Text style={styles.headerStat}>G</Text>
            <Text style={styles.headerStat}>N</Text>
            <Text style={styles.headerStat}>P</Text>
            <Text style={styles.headerPoints}>Pts</Text>
          </View>
        </View>

        <FlatList
          data={standings}
          renderItem={renderStandingRow}
          keyExtractor={(item) => item.id.toString()}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: brand.blue },
    container: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: brand.blue, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    teamsLink: { fontSize: 13, fontWeight: '600', color: brand.gold },
    tableHeader: { flexDirection: 'row', backgroundColor: brand.navy, padding: 10, alignItems: 'center' },
    headerPos: { width: 30, color: '#fff', fontWeight: 'bold', fontSize: 12 },
    headerTeam: { flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 12 },
    headerStats: { flexDirection: 'row', width: 130 },
    headerStat: { width: 25, color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center' },
    headerPoints: { width: 30, color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center' },
    row: { flexDirection: 'row', padding: 10, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' },
    rowEven: { backgroundColor: colors.background },
    position: { width: 30, fontWeight: 'bold', color: brand.blue, fontSize: 12 },
    teamName: { flex: 1, fontSize: 13, fontWeight: '500', color: colors.textPrimary },
    stats: { flexDirection: 'row', width: 130 },
    stat: { width: 25, textAlign: 'center', fontSize: 12, color: colors.textSecondary },
    points: { width: 30, textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: brand.blue },
  });
}