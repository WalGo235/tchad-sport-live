import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { apiService } from '../services/api';

export default function NewTopicScreen({ navigation }) {
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
        placeholderTextColor="#999"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Message</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Écris ton message..."
        placeholderTextColor="#999"
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, fontSize: 15, color: '#333' },
  textArea: { minHeight: 140 },
  error: { color: '#DC2626', marginTop: 12, textAlign: 'center' },
  button: { backgroundColor: '#0052CC', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});