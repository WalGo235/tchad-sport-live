import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/appStore';
import { apiService } from '../services/api';
import { brand } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { teams, favorites, removeFavorite, setTeams } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTeams = useCallback(async () => {
    try {
      const data = await apiService.getTeams();
      setTeams(data);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadTeams().finally(() => setLoading(false));
  }, [loadTeams]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTeams();
    setRefreshing(false);
  };

  const favoriteTeams = teams.filter(team => favorites.includes(team.id));

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={brand.blue} />
      </View>
    );
  }

  const renderFavoriteTeam = ({ item }) => (
    <View style={styles.favoriteCard}>
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.name}</Text>
        <Text style={styles.teamCity}>{item.city}</Text>
      </View>
      
      <TouchableOpacity 
        onPress={() => removeFavorite(item.id)}
        style={styles.removeButton}
      >
        <Text style={styles.removeIcon}>❌</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>❤️ Mes Favoris</Text>
      </View>

      {favoriteTeams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Aucune équipe favorite</Text>
          <Text style={styles.emptySubtext}>Ajoutez vos équipes préférées pour les suivre</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteTeams}
          renderItem={renderFavoriteTeam}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: brand.red, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    listContent: { padding: 10 },
    favoriteCard: { backgroundColor: colors.card, marginBottom: 10, borderRadius: 8, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: brand.red },
    teamInfo: { flex: 1 },
    teamName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    teamCity: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
    removeButton: { padding: 8 },
    removeIcon: { fontSize: 20 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyIcon: { fontSize: 60, marginBottom: 20 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
    emptySubtext: { fontSize: 14, color: colors.textMuted, marginTop: 10, textAlign: 'center' },
  });
}