import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationBar } from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { brand } from './src/theme';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';
import { supabase } from './src/config/supabase';
import { useAppStore } from './src/store/appStore';

import HomeScreen from './src/screens/HomeScreen';
import MatchesScreen from './src/screens/MatchesScreen';
import StandingsScreen from './src/screens/StandingsScreen';
import TeamsScreen from './src/screens/TeamsScreen';
import NewsScreen from './src/screens/NewsScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MatchDetailScreen from './src/screens/MatchDetailScreen';
import ArticleDetailScreen from './src/screens/ArticleDetailScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import AboutScreen from './src/screens/AboutScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import NewTopicScreen from './src/screens/NewTopicScreen';
import TopicDetailScreen from './src/screens/TopicDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const stackHeaderOptions = {
  headerShown: true,
  headerStyle: { backgroundColor: brand.navy },
  headerTintColor: '#fff',
};

function BottomTabNavigator() {
  const { t } = useLanguage();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: brand.gold,
        tabBarInactiveTintColor: '#8891A5',
        tabBarStyle: {
          backgroundColor: brand.navy,
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('tabHome'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={{
          tabBarLabel: t('tabMatches'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📅</Text>,
        }}
      />
      <Tab.Screen
        name="Standings"
        component={StandingsScreen}
        options={{
          tabBarLabel: t('tabStandings'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏆</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('tabProfile'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainApp" component={BottomTabNavigator} />
          <Stack.Screen
            name="MatchDetail"
            component={MatchDetailScreen}
            options={{ ...stackHeaderOptions, title: 'Détails du Match' }}
          />
          <Stack.Screen
            name="ArticleDetail"
            component={ArticleDetailScreen}
            options={{ ...stackHeaderOptions, title: 'Actualité' }}
          />
          <Stack.Screen
            name="Teams"
            component={TeamsScreen}
            options={{ ...stackHeaderOptions, title: 'Équipes' }}
          />
          <Stack.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{ ...stackHeaderOptions, title: 'Mes Favoris' }}
          />
          <Stack.Screen
            name="News"
            component={NewsScreen}
            options={{ ...stackHeaderOptions, title: 'Actualités' }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ ...stackHeaderOptions, title: 'Connexion' }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{ ...stackHeaderOptions, title: 'Créer un compte' }}
          />
          <Stack.Screen
            name="About"
            component={AboutScreen}
            options={{ ...stackHeaderOptions, title: 'À propos' }}
          />
          <Stack.Screen
            name="Community"
            component={CommunityScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="NewTopic"
            component={NewTopicScreen}
            options={{ ...stackHeaderOptions, title: 'Nouveau sujet' }}
          />
          <Stack.Screen
            name="TopicDetail"
            component={TopicDetailScreen}
            options={{ ...stackHeaderOptions, title: 'Discussion' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  const setUser = useAppStore((state) => state.setUser);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setUser]);

  return (
    <SafeAreaProvider>
      <NavigationBar hidden={true} />
      <LanguageProvider>
        <ThemeProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppContent />
          </GestureHandlerRootView>
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}