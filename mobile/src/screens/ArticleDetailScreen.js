import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { apiService } from '../services/api';
import CommentSection from '../components/CommentSection';

export default function ArticleDetailScreen({ route }) {
  const { articleId } = route.params;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadArticle = useCallback(async () => {
    try {
      const data = await apiService.getArticleById(articleId);
      setArticle(data);
    } catch (error) {
      console.error('Error loading article:', error);
    }
  }, [articleId]);

  useEffect(() => {
    setLoading(true);
    loadArticle().finally(() => setLoading(false));
  }, [loadArticle]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0052CC" />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Article introuvable</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {article.cover_image_url ? (
        <Image source={{ uri: article.cover_image_url }} style={styles.coverImage} contentFit="cover" />
      ) : null}

      <View style={styles.contentCard}>
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.date}>{new Date(article.published_at).toLocaleDateString('fr-FR')} {article.author ? `· ${article.author}` : ''}</Text>
        <Text style={styles.body}>{article.content}</Text>
      </View>

      <CommentSection targetType="article" targetId={article.id} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  coverImage: { width: '100%', height: 200, backgroundColor: '#eee' },
  contentCard: { backgroundColor: '#fff', margin: 15, marginBottom: 10, borderRadius: 8, padding: 18 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  date: { fontSize: 12, color: '#999', marginBottom: 16 },
  body: { fontSize: 15, color: '#444', lineHeight: 23 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' },
});