import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../config/supabase';
import { useAppStore } from '../store/appStore';
import { brand } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

export default function SignUpScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const setUser = useAppStore((state) => state.setUser);

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Renseigne ton email et ton mot de passe.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }
    setError(null);
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    if (data.session) {
      setUser(data.user);
      navigation.goBack();
    } else {
      setConfirmationSent(true);
    }
  };

  if (confirmationSent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Vérifie ta boîte mail</Text>
        <Text style={styles.info}>
          Un email de confirmation a été envoyé à {email}. Clique sur le lien pour activer ton compte, puis reviens te connecter.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Login')}>
          <Text style={styles.buttonText}>Aller à la connexion</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Créer un compte</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe (6 caractères minimum)"
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Créer un compte</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' },
    title: { fontSize: 26, fontWeight: 'bold', color: brand.blue, marginBottom: 24, textAlign: 'center' },
    info: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    error: { color: brand.red, marginBottom: 12, textAlign: 'center' },
    input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 8, padding: 14, marginBottom: 12, fontSize: 15, color: colors.textPrimary },
    button: { backgroundColor: brand.blue, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    link: { color: brand.blue, textAlign: 'center', marginTop: 20, fontSize: 13 },
  });
}