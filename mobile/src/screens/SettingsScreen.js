import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/appStore';
import { supabase } from '../config/supabase';
import { brand } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsScreen({ navigation }) {
  const { colors, isDark, setDarkMode } = useTheme();
  const styles = createStyles(colors);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('fr');
  const user = useAppStore((state) => state.user);

  const handleSignOut = async () => {
    Alert.alert('Se déconnecter', 'Tu veux vraiment te déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>👤 Profil</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mon activité</Text>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Favorites')}>
            <Text style={styles.linkLabel}>❤️ Mes équipes favorites</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Notifications en temps réel</Text>
              <Text style={styles.settingDescription}>Recevez les mises à jour des matchs</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: brand.blue }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apparence</Text>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Mode sombre</Text>
              <Text style={styles.settingDescription}>Thème sombre pour les yeux</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.border, true: brand.blue }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Langue</Text>
          <View style={styles.languageOptions}>
            <TouchableOpacity
              style={[styles.languageButton, language === 'fr' && styles.languageButtonActive]}
              onPress={() => setLanguage('fr')}
            >
              <Text style={[styles.languageText, language === 'fr' && styles.languageTextActive]}>Français</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.languageButton, language === 'en' && styles.languageButtonActive]}
              onPress={() => setLanguage('en')}
            >
              <Text style={[styles.languageText, language === 'en' && styles.languageTextActive]}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.languageButton, language === 'ar' && styles.languageButtonActive]}
              onPress={() => setLanguage('ar')}
            >
              <Text style={[styles.languageText, language === 'ar' && styles.languageTextActive]}>العربية</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          {user ? (
            <>
              <Text style={styles.accountEmail}>{user.email}</Text>
              <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={handleSignOut}>
                <Text style={styles.buttonText}>Se déconnecter</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.buttonText}>Se connecter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => navigation.navigate('SignUp')}
              >
                <Text style={styles.buttonTextSecondary}>Créer un compte</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('About')}>
            <Text style={styles.sectionTitleInline}>À propos</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 TchadSportLive. Tous droits réservés.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: brand.blue },
    container: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: brand.blue, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    section: { backgroundColor: colors.card, marginTop: 10, padding: 15, borderTopWidth: 1, borderTopColor: colors.border },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: brand.blue, marginBottom: 15 },
    sectionTitleInline: { fontSize: 16, fontWeight: 'bold', color: brand.blue },
    linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
    linkLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    linkArrow: { fontSize: 16, color: brand.blue, fontWeight: 'bold' },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
    settingLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    settingDescription: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
    languageOptions: { flexDirection: 'row', justifyContent: 'space-between' },
    languageButton: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: colors.inputBorder, marginHorizontal: 5, alignItems: 'center' },
    languageButtonActive: { backgroundColor: brand.blue, borderColor: brand.blue },
    languageText: { fontSize: 12, color: colors.textSecondary },
    languageTextActive: { color: '#fff', fontWeight: 'bold' },
    accountEmail: { fontSize: 14, color: colors.textPrimary, marginBottom: 12, fontWeight: '600' },
    button: { backgroundColor: brand.blue, paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginVertical: 8 },
    buttonDanger: { backgroundColor: brand.red },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    buttonSecondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: brand.blue },
    buttonTextSecondary: { color: brand.blue, fontWeight: 'bold', fontSize: 14 },
    footer: { padding: 20, alignItems: 'center' },
    footerText: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  });
}