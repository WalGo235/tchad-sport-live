import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/appStore';
import { apiService } from '../services/api';

export default function HomeScreen({ navigation }) {
  const { matches, news, setMatches, setNews } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matchesData, newsData] = await Promise.all([
        apiService.getMatches(),
        apiService.getNews(),
      ]);
      setMatches(matchesData);
      setNews(newsData);
    } catch (error) {
      console.error('Error loading data:', error);
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

  const todayMatches = matches.filter(m => {
    const matchDate = new Date(m.match_date).toDateString();
    const today = new Date().toDateString();
    return matchDate === today;
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 TchadSportLive</Text>
        <Text style={styles.subtitle}>Division 1 de Football Tchadien</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Matchs d'aujourd'hui</Text>
        {todayMatches.length === 0 ? (
          <Text style={styles.emptyText}>Aucun match aujourd'hui</Text>
        ) : (
          todayMatches.map(match => (
            <TouchableOpacity
              key={match.id}
              style={styles.matchCard}
              onPress={() => navigation.navigate('MatchDetail', { matchId: match.id })}
            >
              <Text style={styles.matchTeam}>{match.home_team?.name} vs {match.away_team?.name}</Text>
              <Text style={styles.matchTime}>{new Date(match.match_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📰 Actualités</Text>
        {news.slice(0, 3).map(article => (
          <View key={article.id} style={styles.newsCard}>
            <Text style={styles.newsTitle}>{article.title}</Text>
            <Text style={styles.newsDate}>{new Date(article.published_at).toLocaleDateString('fr-FR')}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#0052CC', padding: 20, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#FCD34D', marginTop: 5 },
  section: { padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0052CC', marginBottom: 10 },
  matchCard: { backgroundColor: '#fff', padding: 12, marginBottom: 10, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#DC2626' },
  matchTeam: { fontSize: 16, fontWeight: '600', color: '#333' },
  matchTime: { fontSize: 12, color: '#666', marginTop: 5 },
  newsCard: { backgroundColor: '#fff', padding: 12, marginBottom: 10, borderRadius: 8 },
  newsTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  newsDate: { fontSize: 12, color: '#999', marginTop: 5 },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center', paddingVertical: 20 },
});