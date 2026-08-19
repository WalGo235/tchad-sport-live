import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/appStore';
import { apiService } from '../services/api';

export default function MatchesScreen({ navigation }) {
  const { matches, setMatches } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMatches();
      setMatches(data);
    } catch (error) {
      console.error('Error loading matches:', error);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#FCD34D';
      case 'live': return '#DC2626';
      case 'finished': return '#10B981';
      default: return '#999';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📅 Calendrier des Matchs</Text>
      </View>

      {matches.map(match => (
        <TouchableOpacity
          key={match.id}
          style={styles.matchCard}
          onPress={() => navigation.navigate('MatchDetail', { matchId: match.id })}
        >
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(match.status) }]}>
            <Text style={styles.statusText}>
              {match.status === 'scheduled' ? 'Programmé' : match.status === 'live' ? 'EN DIRECT' : 'Terminé'}
            </Text>
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
            
            <Text style={styles.stadium}>📍 {match.venue || 'Stade'}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#0052CC', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  matchCard: { backgroundColor: '#fff', margin: 10, borderRadius: 8, overflow: 'hidden', borderLeftWidth: 4, borderLeftColor: '#DC2626' },
  statusBadge: { padding: 8, alignItems: 'center' },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  matchContent: { padding: 15 },
  date: { fontSize: 12, color: '#999', marginBottom: 10 },
  teamsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  team: { flex: 1 },
  teamName: { fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center' },
  vs: { flex: 0.3, alignItems: 'center' },
  score: { fontSize: 18, fontWeight: 'bold', color: '#0052CC' },
  time: { fontSize: 12, color: '#666' },
  stadium: { fontSize: 12, color: '#666' },
});