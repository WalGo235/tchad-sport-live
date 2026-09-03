import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { apiService } from '../services/api';
import { brand } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

export default function NewTopicScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Renseigne un titre et un message.');
      return;
    }
    setError(null);
    setPosting(true);
    try {
      const topic = await apiService.postForumTopic(title.trim(), content.trim());
      navigation.replace('TopicDetail', { topicId: topic.id });
    } catch (e) {
      setError(e.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.label}>Titre</Text>
      <TextInput
        style={styles.input}
        placeholder="De quoi veux-tu parler ?"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Message</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Écris ton message..."
        placeholderTextColor={colors.textMuted}
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={posting}>
        {posting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Publier le sujet</Text>}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 20 },
    label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6, marginTop: 12 },
    input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 8, padding: 14, fontSize: 15, color: colors.textPrimary },
    textArea: { minHeight: 140 },
    error: { color: brand.red, marginTop: 12, textAlign: 'center' },
    button: { backgroundColor: brand.blue, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 24 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  });
}