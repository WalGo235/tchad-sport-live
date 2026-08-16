import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/appStore';
import { apiService } from '../services/api';

export default function TeamsScreen() {
  const { teams, setTeams, favorites, addFavorite, removeFavorite } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTeams();
      setTeams(data);
    } catch (error) {
      console.error('Error loading teams:', error);
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

  const renderTeamCard = ({ item }) => {
    const isFavorite = favorites.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={styles.teamCard}
        onPress={() => isFavorite ? removeFavorite(item.id) : addFavorite(item.id)}
      >
        <View style={styles.teamHeader}>
          <View>
            <Text style={styles.teamName}>{item.name}</Text>
            <Text style={styles.teamCity}>{item.city}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => isFavorite ? removeFavorite(item.id) : addFavorite(item.id)}
            style={styles.favoriteButton}
          >
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.teamInfo}>
          <Text style={styles.infoLabel}>Entraîneur: <Text style={styles.infoValue}>{item.head_coach || 'N/A'}</Text></Text>
          <Text style={styles.infoLabel}>Stade: <Text style={styles.infoValue}>{item.stadium_name || 'N/A'}</Text></Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚽ Équipes</Text>
        <Text style={styles.subtitle}>Division 1 Tchadienne</Text>
      </View>

      <FlatList
        data={teams}
        renderItem={renderTeamCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#0052CC', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#FCD34D', marginTop: 5 },
  listContent: { padding: 10 },
  teamCard: { backgroundColor: '#fff', marginBottom: 10, borderRadius: 8, padding: 15, borderLeftWidth: 4, borderLeftColor: '#DC2626' },
  teamHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  teamName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  teamCity: { fontSize: 12, color: '#999', marginTop: 3 },
  favoriteButton: { padding: 5 },
  favoriteIcon: { fontSize: 24 },
  teamInfo: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  infoLabel: { fontSize: 12, color: '#666', marginBottom: 5 },
  infoValue: { fontWeight: '600', color: '#333' },
});