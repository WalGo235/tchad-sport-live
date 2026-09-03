import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { apiService } from '../services/api';
import { supabase } from '../config/supabase';
import { useAppStore } from '../store/appStore';
import { brand } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

export default function TopicDetailScreen({ route }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { topicId } = route.params;
  const user = useAppStore((state) => state.user);
  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [likesByItem, setLikesByItem] = useState({});
  const [loading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState('');
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [topicData, repliesData] = await Promise.all([
        apiService.getForumTopicById(topicId),
        apiService.getForumReplies(topicId),
      ]);
      setTopic(topicData);
      setReplies(repliesData);

      const [topicLikes, replyLikes] = await Promise.all([
        apiService.getLikesForTargets('topic', [topicId]),
        apiService.getLikesForTargets('reply', repliesData.map((r) => r.id)),
      ]);
      const grouped = { [topicId]: { count: 0, likedByMe: false } };
      repliesData.forEach((r) => { grouped[r.id] = { count: 0, likedByMe: false }; });
      [...topicLikes, ...replyLikes].forEach((like) => {
        if (!grouped[like.target_id]) grouped[like.target_id] = { count: 0, likedByMe: false };
        grouped[like.target_id].count += 1;
        if (user && like.user_id === user.id) grouped[like.target_id].likedByMe = true;
      });
      setLikesByItem(grouped);
    } catch (error) {
      console.error('Error loading topic:', error);
    }
  }, [topicId, user]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel(`topic-${topicId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_replies', filter: `topic_id=eq.${topicId}` }, () => {
        load();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_likes' }, () => {
        load();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [topicId, load]);

  const handleReply = async () => {
    if (!newReply.trim()) return;
    setPosting(true);
    try {
      await apiService.postForumReply(topicId, newReply.trim());
      setNewReply('');
      await load();
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = async (targetType, targetId) => {
    if (!user) return;
    try {
      await apiService.toggleLike(targetType, targetId);
      await load();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={brand.blue} />
      </View>
    );
  }

  if (!topic) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Sujet introuvable</Text>
      </View>
    );
  }

  const topicLikes = likesByItem[topic.id] || { count: 0, likedByMe: false };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topicCard}>
        <Text style={styles.topicTitle}>{topic.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.authorName}>{topic.author_name}</Text>
          <Text style={styles.date}>{new Date(topic.created_at).toLocaleDateString('fr-FR')}</Text>
        </View>
        <Text style={styles.topicContent}>{topic.content}</Text>
        <TouchableOpacity style={styles.likeRow} onPress={() => handleToggleLike('topic', topic.id)} disabled={!user}>
          <Text style={styles.likeIcon}>{topicLikes.likedByMe ? '❤️' : '🤍'}</Text>
          <Text style={styles.likeCount}>{topicLikes.count}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.repliesSection}>
        <Text style={styles.repliesTitle}>{replies.length} réponse{replies.length > 1 ? 's' : ''}</Text>

        {replies.map((reply) => {
          const replyLikes = likesByItem[reply.id] || { count: 0, likedByMe: false };
          return (
            <View key={reply.id} style={styles.replyCard}>
              <View style={styles.metaRow}>
                <Text style={styles.authorName}>{reply.author_name}</Text>
                <Text style={styles.date}>{new Date(reply.created_at).toLocaleDateString('fr-FR')}</Text>
              </View>
              <Text style={styles.replyContent}>{reply.content}</Text>
              <TouchableOpacity style={styles.likeRow} onPress={() => handleToggleLike('reply', reply.id)} disabled={!user}>
                <Text style={styles.likeIcon}>{replyLikes.likedByMe ? '❤️' : '🤍'}</Text>
                <Text style={styles.likeCount}>{replyLikes.count}</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {user ? (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Répondre..."
              placeholderTextColor={colors.textMuted}
              value={newReply}
              onChangeText={setNewReply}
              multiline
            />
            <TouchableOpacity style={styles.postButton} onPress={handleReply} disabled={posting || !newReply.trim()}>
              {posting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.postButtonText}>Envoyer</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.loginPrompt}>Connecte-toi (onglet Profil) pour répondre.</Text>
        )}
      </View>
    </ScrollView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    topicCard: { backgroundColor: colors.card, margin: 15, borderRadius: 8, padding: 18 },
    topicTitle: { fontSize: 19, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 10 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    authorName: { fontSize: 13, fontWeight: '600', color: brand.blue },
    date: { fontSize: 12, color: colors.textMuted },
    topicContent: { fontSize: 15, color: colors.textSecondary, lineHeight: 22, marginBottom: 12 },
    likeRow: { flexDirection: 'row', alignItems: 'center' },
    likeIcon: { fontSize: 18, marginRight: 6 },
    likeCount: { fontSize: 13, color: colors.textSecondary },
    repliesSection: { backgroundColor: colors.card, margin: 15, marginTop: 0, borderRadius: 8, padding: 15 },
    repliesTitle: { fontSize: 14, fontWeight: 'bold', color: brand.blue, marginBottom: 12 },
    replyCard: { borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 12 },
    replyContent: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 8 },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
    input: { flex: 1, backgroundColor: colors.inputBg, borderRadius: 8, borderWidth: 1, borderColor: colors.inputBorder, padding: 10, fontSize: 13, color: colors.textPrimary, maxHeight: 80, marginRight: 8 },
    postButton: { backgroundColor: brand.blue, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
    postButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    loginPrompt: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 12, fontStyle: 'italic' },
    emptyText: { textAlign: 'center', marginTop: 40, color: colors.textMuted },
  });
}