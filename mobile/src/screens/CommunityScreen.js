import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../services/api';
import { supabase } from '../config/supabase';
import { useAppStore } from '../store/appStore';

export default function CommunityScreen({ navigation }) {
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
        <ActivityIndicator size="large" color="#0052CC" />
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0052CC' },
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#0052CC', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  newButton: { backgroundColor: '#FCD34D', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  newButtonText: { color: '#0052CC', fontWeight: 'bold', fontSize: 14 },
  listContent: { padding: 10 },
  topicCard: { backgroundColor: '#fff', marginBottom: 10, borderRadius: 8, padding: 15, borderLeftWidth: 4, borderLeftColor: '#0052CC' },
  topicTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  topicPreview: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 10 },
  topicFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
  topicAuthor: { fontSize: 12, color: '#0052CC', fontWeight: '600' },
  topicDate: { fontSize: 12, color: '#999' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 50, marginBottom: 15 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  emptySubtext: { fontSize: 13, color: '#999', marginTop: 8, textAlign: 'center' },
});