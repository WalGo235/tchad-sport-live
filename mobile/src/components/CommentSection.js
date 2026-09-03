import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { apiService } from '../services/api';
import { supabase } from '../config/supabase';
import { useAppStore } from '../store/appStore';
import { brand } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

export default function CommentSection({ targetType, targetId }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const user = useAppStore((state) => state.user);
  const [comments, setComments] = useState([]);
  const [likesByComment, setLikesByComment] = useState({});
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    try {
      const commentsData = await apiService.getComments(targetType, targetId);
      setComments(commentsData);

      const ids = commentsData.map((c) => c.id);
      const likesData = await apiService.getLikesForTargets('comment', ids);
      const grouped = {};
      ids.forEach((id) => {
        grouped[id] = { count: 0, likedByMe: false };
      });
      likesData.forEach((like) => {
        if (!grouped[like.target_id]) grouped[like.target_id] = { count: 0, likedByMe: false };
        grouped[like.target_id].count += 1;
        if (user && like.user_id === user.id) grouped[like.target_id].likedByMe = true;
      });
      setLikesByComment(grouped);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }, [targetType, targetId, user]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel(`comments-${targetType}-${targetId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `target_id=eq.${targetId}` }, () => {
        load();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_likes' }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetType, targetId, load]);

  const handlePost = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      await apiService.postComment(targetType, targetId, newComment.trim());
      setNewComment('');
      await load();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = async (commentId) => {
    if (!user) return;
    try {
      await apiService.toggleLike('comment', commentId);
      await load();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💬 Commentaires ({comments.length})</Text>

      {loading ? (
        <ActivityIndicator color={brand.blue} style={{ marginVertical: 20 }} />
      ) : comments.length === 0 ? (
        <Text style={styles.emptyText}>Aucun commentaire pour l'instant. Sois le premier à réagir !</Text>
      ) : (
        comments.map((comment) => {
          const likeInfo = likesByComment[comment.id] || { count: 0, likedByMe: false };
          return (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Text style={styles.authorName}>{comment.author_name}</Text>
                <Text style={styles.date}>{new Date(comment.created_at).toLocaleDateString('fr-FR')}</Text>
              </View>
              <Text style={styles.content}>{comment.content}</Text>
              <TouchableOpacity
                style={styles.likeRow}
                onPress={() => handleToggleLike(comment.id)}
                disabled={!user}
              >
                <Text style={styles.likeIcon}>{likeInfo.likedByMe ? '❤️' : '🤍'}</Text>
                <Text style={styles.likeCount}>{likeInfo.count}</Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}

      {user ? (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor={colors.textMuted}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity style={styles.postButton} onPress={handlePost} disabled={posting || !newComment.trim()}>
            {posting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.postButtonText}>Publier</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.loginPrompt}>Connecte-toi (onglet Profil) pour commenter et aimer.</Text>
      )}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { backgroundColor: colors.card, margin: 15, marginTop: 0, borderRadius: 8, padding: 15 },
    title: { fontSize: 16, fontWeight: 'bold', color: brand.blue, marginBottom: 12 },
    emptyText: { fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingVertical: 15 },
    commentCard: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 10 },
    commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    authorName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
    date: { fontSize: 11, color: colors.textMuted },
    content: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 8 },
    likeRow: { flexDirection: 'row', alignItems: 'center' },
    likeIcon: { fontSize: 16, marginRight: 5 },
    likeCount: { fontSize: 12, color: colors.textSecondary },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 12 },
    input: { flex: 1, backgroundColor: colors.inputBg, borderRadius: 8, borderWidth: 1, borderColor: colors.inputBorder, padding: 10, fontSize: 13, color: colors.textPrimary, maxHeight: 80, marginRight: 8 },
    postButton: { backgroundColor: brand.blue, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
    postButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    loginPrompt: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 12, fontStyle: 'italic' },
  });
}