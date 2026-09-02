import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/appStore';
import { apiService } from '../services/api';

export default function NewsScreen() {
  const { news, setNews } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNews = useCallback(async () => {
    try {
      const data = await apiService.getNews();
      setNews(data);
    } catch (error) {
      console.error('Error loading news:', error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadNews().finally(() => setLoading(false));
  }, [loadNews]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0052CC" />
      </View>
    );
  }

  const renderNewsCard = ({ item }) => (
    <View style={styles.newsCard}>
      <View style={styles.newsHeader}>
        <Text style={styles.newsTitle}>{item.title}</Text>
      </View>
      
      <Text style={styles.newsContent} numberOfLines={3}>{item.content}</Text>
      
      <View style={styles.newsFooter}>
        <Text style={styles.newsDate}>{new Date(item.published_at).toLocaleDateString('fr-FR')}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📰 Actualités</Text>
        </View>

        <FlatList
          data={news}
          renderItem={renderNewsCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0052CC' },
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#0052CC', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  listContent: { padding: 10 },
  newsCard: { backgroundColor: '#fff', marginBottom: 10, borderRadius: 8, padding: 15, borderLeftWidth: 4, borderLeftColor: '#FCD34D' },
  newsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  newsTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
  newsContent: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 10 },
  newsFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  newsDate: { fontSize: 12, color: '#999' },
});