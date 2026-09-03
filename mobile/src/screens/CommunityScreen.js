import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../services/api';
import { supabase } from '../config/supabase';
import { useAppStore } from '../store/appStore';
import { brand } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

export default function CommunityScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const user = useAppStore((state) => state.user);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTopics = useCallback(async () => {
    try {
      const data = await apiService.getForumTopics();
      setTopics(data);
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadTopics().finally(() => setLoading(false));
  }, [loadTopics]);

  useEffect(() => {
    const channel = supabase
      .channel('forum-topics-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_topics' }, () => {
        loadTopics();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTopics]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTopics();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={brand.blue} />
      </View>
    );
  }

  const renderTopic = ({ item }) => (
    <TouchableOpacity style={styles.topicCard} onPress={() => navigation.navigate('TopicDetail', { topicId: item.id })}>
      <Text style={styles.topicTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.topicPreview} numberOfLines={2}>{item.content}</Text>
      <View style={styles.topicFooter}>
        <Text style={styles.topicAuthor}>{item.author_name}</Text>
        <Text style={styles.topicDate}>{new Date(item.created_at).toLocaleDateString('fr-FR')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>💬 Communauté</Text>
          {user ? (
            <TouchableOpacity style={styles.newButton} onPress={() => navigation.navigate('NewTopic')}>
              <Text style={styles.newButtonText}>+ Nouveau sujet</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {topics.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>Aucun sujet pour l'instant</Text>
            <Text style={styles.emptySubtext}>
              {user ? "Lance la discussion !" : "Connecte-toi pour lancer le premier sujet."}
            </Text>
          </View>
        ) : (
          <FlatList
            data={topics}
            renderItem={renderTopic}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: brand.blue },
    container: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: brand.blue, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
    newButton: { backgroundColor: brand.gold, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    newButtonText: { color: brand.blue, fontWeight: 'bold', fontSize: 14 },
    listContent: { padding: 10 },
    topicCard: { backgroundColor: colors.card, marginBottom: 10, borderRadius: 8, padding: 15, borderLeftWidth: 4, borderLeftColor: brand.blue },
    topicTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 6 },
    topicPreview: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 10 },
    topicFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 },
    topicAuthor: { fontSize: 12, color: brand.blue, fontWeight: '600' },
    topicDate: { fontSize: 12, color: colors.textMuted },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyIcon: { fontSize: 50, marginBottom: 15 },
    emptyText: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    emptySubtext: { fontSize: 13, color: colors.textMuted, marginTop: 8, textAlign: 'center' },
  });
}