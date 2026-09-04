import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/appStore';
import { apiService } from '../services/api';
import { brand } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function NewsScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = createStyles(colors);
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
        <ActivityIndicator size="large" color={brand.blue} />
      </View>
    );
  }

  const renderNewsCard = ({ item }) => (
    <TouchableOpacity style={styles.newsCard} onPress={() => navigation.navigate('ArticleDetail', { articleId: item.id })}>
      <View style={styles.newsHeader}>
        <Text style={styles.newsTitle}>{item.title}</Text>
      </View>
      
      <Text style={styles.newsContent} numberOfLines={3}>{item.content}</Text>
      
      <View style={styles.newsFooter}>
        <Text style={styles.newsDate}>{new Date(item.published_at).toLocaleDateString('fr-FR')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📰 {t('news')}</Text>
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

function createStyles(colors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: brand.blue },
    container: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: brand.blue, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    listContent: { padding: 10 },
    newsCard: { backgroundColor: colors.card, marginBottom: 10, borderRadius: 8, padding: 15, borderLeftWidth: 4, borderLeftColor: brand.gold },
    newsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    newsTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, flex: 1 },
    newsContent: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 10 },
    newsFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
    newsDate: { fontSize: 12, color: colors.textMuted },
  });
}