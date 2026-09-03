import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/appStore';
import { apiService } from '../services/api';
import { brand } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

export default function TeamsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { teams, setTeams, favorites, addFavorite, removeFavorite } = useAppStore();
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={brand.blue} />
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
    header: { backgroundColor: brand.blue, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    subtitle: { fontSize: 14, color: brand.gold, marginTop: 5 },
    listContent: { padding: 10 },
    teamCard: { backgroundColor: colors.card, marginBottom: 10, borderRadius: 8, padding: 15, borderLeftWidth: 4, borderLeftColor: brand.red },
    teamHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    teamName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    teamCity: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
    favoriteButton: { padding: 5 },
    favoriteIcon: { fontSize: 24 },
    teamInfo: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
    infoLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 5 },
    infoValue: { fontWeight: '600', color: colors.textPrimary },
  });
}