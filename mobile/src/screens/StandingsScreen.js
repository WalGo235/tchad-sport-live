import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/appStore';
import { apiService } from '../services/api';

export default function StandingsScreen({ navigation }) {
  const { standings, setStandings } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStandings();
  }, []);

  const loadStandings = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStandings();
      setStandings(data);
    } catch (error) {
      console.error('Error loading standings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0052CC" />
      </View>
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
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#0052CC', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  teamsLink: { fontSize: 13, fontWeight: '600', color: '#FCD34D' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#333', padding: 10, alignItems: 'center' },
  headerPos: { width: 30, color: '#fff', fontWeight: 'bold', fontSize: 12 },
  headerTeam: { flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 12 },
  headerStats: { flexDirection: 'row', width: 130 },
  headerStat: { width: 25, color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center' },
  headerPoints: { width: 30, color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center' },
  row: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  rowEven: { backgroundColor: '#f9f9f9' },
  position: { width: 30, fontWeight: 'bold', color: '#0052CC', fontSize: 12 },
  teamName: { flex: 1, fontSize: 13, fontWeight: '500', color: '#333' },
  stats: { flexDirection: 'row', width: 130 },
  stat: { width: 25, textAlign: 'center', fontSize: 12, color: '#666' },
  points: { width: 30, textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: '#0052CC' },
});