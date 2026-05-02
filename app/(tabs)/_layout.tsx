import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../context/AppContext';

export default function TabLayout() {
  const router = useRouter();
  const { t, isDarkMode, colors } = useApp();

  // Create styles dynamically inside the component instead of globally
  const styles = StyleSheet.create({
    headerBtnLeft: { marginLeft: 20 },
    headerBtnRight: { marginRight: 20 },
    iconCircle: {
      width: 38, height: 38, borderRadius: 12,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: colors.cardBorder,
    },
    historyBtnInner: {
      width: 40, height: 40, alignItems: 'center', justifyContent: 'center', position: 'relative',
    },
    dot: {
      position: 'absolute', top: 10, right: 8, width: 7, height: 7,
      borderRadius: 4, backgroundColor: colors.accent,
      borderWidth: 1.5, borderColor: colors.background[0],
    },
    activeIconBg: {
      backgroundColor: colors.iconBg,
      paddingHorizontal: 15, paddingVertical: 4,
      borderRadius: 15, marginBottom: 2,
    }
  });

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 5,
        },
        tabBarStyle: {
          backgroundColor: colors.background[0],
          borderTopWidth: 1,
          borderTopColor: colors.cardBorder,
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          elevation: 0,
        },
        headerStyle: {
          backgroundColor: colors.background[0],
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.cardBorder,
        },
        headerTitleStyle: {
          fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
          fontSize: 20,
          fontWeight: '900',
          color: colors.textMain,
        },
      }}
    >
      {/* ── HOME TAB ──────────────────────────────────────────────── */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('homeTitle') || 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : null}>
              <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
            </View>
          ),

        }}
      />

      {/* ── HISTORY TAB ───────────────────────────────────────────── */}
      <Tabs.Screen
        name="history"
        options={{
          title: t('historyTitle') ? t('historyTitle') : 'History',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : null}>
              <Ionicons name={focused ? "time" : "time-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* ── HISTORY DETAIL ────────────────────────────────────────── */}
      <Tabs.Screen
        name="history/[id]"
        options={{
          href: null,
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
      />

      {/* ── PROFILE TAB ───────────────────────────────────────────── */}
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profileTitle') ? t('profileTitle') : 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : null}>
              <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* ── SETTINGS TAB ──────────────────────────────────────────── */}
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settingsTitle'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : null}>
              <Ionicons name={focused ? "settings" : "settings-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}