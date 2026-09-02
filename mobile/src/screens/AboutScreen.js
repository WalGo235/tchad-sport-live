import React from 'react';
import { View, ScrollView, StyleSheet, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.logoWrap}>
          <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
        </View>

        <Text style={styles.appName}>TchadSportLive</Text>
        <Text style={styles.tagline}>Par les Tchadiens. Pour le Tchad.</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notre mission</Text>
          <Text style={styles.paragraph}>
            TchadSportLive réinvente la couverture sportive au Tchad. Notre mission : connecter les
            communautés sportives, valoriser les talents locaux et amplifier la voix du sport
            tchadien — pour toutes les disciplines, pas seulement le football.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Développeur</Text>
            <Text style={styles.infoValue}>TchadSportLive</Text>
          </View>
        </View>

        <Text style={styles.footerText}>© 2026 TchadSportLive. Tous droits réservés.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0052CC' },
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20, alignItems: 'center' },
  logoWrap: { marginTop: 10, marginBottom: 15 },
  logo: { width: 80, height: 80, borderRadius: 16 },
  appName: { fontSize: 22, fontWeight: 'bold', color: '#0052CC' },
  tagline: { fontSize: 13, color: '#999', marginTop: 4, marginBottom: 24 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 18, width: '100%', marginBottom: 15 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#0052CC', marginBottom: 10 },
  paragraph: { fontSize: 14, color: '#444', lineHeight: 21 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  infoLabel: { fontSize: 14, color: '#666' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  footerText: { fontSize: 12, color: '#999', marginTop: 10 },
});