import React from 'react';
import { View, ScrollView, StyleSheet, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { brand } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function AboutScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.logoWrap}>
          <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
        </View>

        <Text style={styles.appName}>{t('appTitle')}</Text>
        <Text style={styles.tagline}>{t('aboutTagline')}</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('missionTitle')}</Text>
          <Text style={styles.paragraph}>{t('missionText')}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('versionLabel')}</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('developerLabel')}</Text>
            <Text style={styles.infoValue}>TchadSportLive</Text>
          </View>
        </View>

        <Text style={styles.footerText}>{t('footer')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: brand.blue },
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, alignItems: 'center' },
    logoWrap: { marginTop: 10, marginBottom: 15 },
    logo: { width: 80, height: 80, borderRadius: 16 },
    appName: { fontSize: 22, fontWeight: 'bold', color: brand.blue },
    tagline: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 24 },
    card: { backgroundColor: colors.card, borderRadius: 10, padding: 18, width: '100%', marginBottom: 15 },
    sectionTitle: { fontSize: 15, fontWeight: 'bold', color: brand.blue, marginBottom: 10 },
    paragraph: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
    infoLabel: { fontSize: 14, color: colors.textSecondary },
    infoValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    footerText: { fontSize: 12, color: colors.textMuted, marginTop: 10 },
  });
}