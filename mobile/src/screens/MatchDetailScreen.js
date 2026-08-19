import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { apiService } from '../services/api';

export default function MatchDetailScreen({ route }) {
  const { matchId } = route.params;
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  const loadMatch = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMatchById(matchId);
      setMatch(data);
    } catch (error) {
      console.error('Error loading match:', error);
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

  if (!match) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Match introuvable</Text>
      </View>
    );
  }

  const getStatusLabel = (status) => {
    if (status === 'scheduled') return 'Programmé';
    if (status === 'live') return 'EN DIRECT';
    return 'Terminé';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.scoreCard}>
        <Text style={styles.date}>{new Date(match.match_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>

        <View style={styles.teamsRow}>
          <Text style={styles.teamName}>{match.home_team?.name}</Text>
          {match.status === 'finished' ? (
            <Text style={styles.score}>{match.home_score} - {match.away_score}</Text>
          ) : (
            <Text style={styles.time}>{new Date(match.match_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
          )}
          <Text style={styles.teamName}>{match.away_team?.name}</Text>
        </View>

        <Text style={styles.status}>{getStatusLabel(match.status)}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Stade</Text>
          <Text style={styles.infoValue}>{match.venue || 'Non renseigné'}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scoreCard: { backgroundColor: '#0052CC', padding: 25, alignItems: 'center' },
  date: { fontSize: 13, color: '#FCD34D', marginBottom: 20, textTransform: 'capitalize' },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  teamName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#fff', textAlign: 'center' },
  score: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginHorizontal: 10 },
  time: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginHorizontal: 10 },
  status: { marginTop: 15, fontSize: 12, fontWeight: 'bold', color: '#FCD34D' },
  infoCard: { backgroundColor: '#fff', margin: 15, borderRadius: 8, padding: 15 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { fontSize: 14, color: '#666' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' },
});