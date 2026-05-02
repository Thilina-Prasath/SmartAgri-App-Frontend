import React, { useEffect, useRef, useState } from 'react';
import {
    Animated, Image, Platform, ScrollView,
    StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../../context/AppContext';

// ─── Sub-components ───────────────────────────────────────────────────────────

const ProfileStat = ({ value, label, icon, S }: { value: string; label: string; icon: any, S: any }) => (
    <View style={S.statItem}>
        <View style={S.statIconCircle}>
            <Ionicons name={icon} size={18} color="#2ecc71" />
        </View>
        <View>
            <Text style={S.statValue}>{value}</Text>
            <Text style={S.statLabel}>{label}</Text>
        </View>
    </View>
);

const ActionButton = ({ title, icon, onPress, S, color = '#2ecc71' }: { title: string; icon: any; onPress: () => void; color?: string; S: any }) => (
    <TouchableOpacity style={S.actionBtn} onPress={onPress} activeOpacity={0.7}>
        <View style={[S.actionIconBox, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={S.actionTitle}>{title}</Text>
        <Ionicons name="chevron-forward" size={16} color="rgba(150,150,150,0.2)" />
    </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
    const { t, colors, isDarkMode } = useApp();
    const router = useRouter();

    const S = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

    const [user, setUser] = useState({ name: "", email: "", id: "" });
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
        ]).start();
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const raw = await AsyncStorage.getItem('userData');
        if (raw) setUser(JSON.parse(raw));
    };

    return (
        <View style={S.root}>
            <LinearGradient colors={colors.background} style={StyleSheet.absoluteFillObject} />

            {/* Ambient background decorations */}
            <View style={S.orbTop} />
            <View style={S.orbBottom} />

            <Animated.View style={[S.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                {/* ── Header ── */}
                <View style={S.header}>
                    <TouchableOpacity style={S.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                    <Text style={S.headerTitle}>{t('profileTitle') || 'Profile'}</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                    {/* ── Profile Hero ── */}
                    <View style={S.heroSection}>
                        <View style={S.avatarWrapper}>
                            <LinearGradient colors={['#2ecc71', '#27ae60']} style={S.avatarGradient}>
                                <Text style={S.avatarText}>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</Text>
                            </LinearGradient>
                            <TouchableOpacity style={S.editAvatarBtn}>
                                <Ionicons name="camera" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={S.userName}>{user.name || "User Name"}</Text>
                        <Text style={S.userEmail}>{user.email || "user@email.com"}</Text>
                    </View>

                    {/* ── Account Actions ── */}
                    <View style={S.sectionLabelBox}>
                        <Text style={S.sectionLabel}>{t('accountSettingsLabel')}</Text>
                    </View>

                    <View style={S.actionsWrapper}>
                        <ActionButton
                            title={t('editProfileTitle')}
                            icon="person-outline"
                            S={S}
                            onPress={() =>
                                router.push({
                                    pathname: "/edit-profile"
                                })
                            }
                        />

                    </View>

                    {/* ── Support & Legal ── */}
                    <View style={S.sectionLabelBox}>
                        <Text style={S.sectionLabel}>{t('guidelineLabel')}</Text>
                    </View>

                    <View style={S.actionsWrapper}>
                        <ActionButton
                            title={t('guidelineLabel')}
                            icon="help-buoy-outline"
                            S={S}
                            onPress={() =>
                                router.push({
                                    pathname: "/guideline"
                                })
                            }
                        />
                    </View>

                </ScrollView>
            </Animated.View>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background[0] },
    inner: { flex: 1, paddingHorizontal: 22, paddingTop: 54 },

    // Background Orbs
    orbTop: { position: 'absolute', top: -100, left: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: colors.iconBg },
    orbBottom: { position: 'absolute', bottom: 50, right: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: colors.iconBg },

    header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 30 },
    backBtn: {
        width: 38, height: 38, borderRadius: 12, backgroundColor: colors.cardBg,
        borderWidth: 1, borderColor: colors.cardBorder, alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 22, fontWeight: '800', color: colors.textMain, letterSpacing: -0.5 },

    // Hero Section
    heroSection: { alignItems: 'center', marginBottom: 30 },
    avatarWrapper: { position: 'relative', marginBottom: 16 },
    avatarGradient: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.05)' },
    avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    editAvatarBtn: {
        position: 'absolute', bottom: 0, right: 0, width: 30, height: 30,
        borderRadius: 15, backgroundColor: '#2ecc71', alignItems: 'center',
        justifyContent: 'center', borderWidth: 3, borderColor: colors.background[0]
    },
    userName: { fontSize: 24, fontWeight: 'bold', color: colors.textMain, letterSpacing: -0.5 },
    userEmail: { fontSize: 13, color: colors.textMuted, marginTop: 4 },

    // Stats Card
    statsCard: {
        flexDirection: 'row', backgroundColor: colors.cardBg, borderRadius: 20,
        padding: 20, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 30
    },
    statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 10 },
    statIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.iconBg, alignItems: 'center', justifyContent: 'center' },
    statValue: { fontSize: 16, fontWeight: '800', color: colors.textMain },
    statLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase' },
    statDivider: { width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.08)' },

    // Actions
    sectionLabelBox: { paddingLeft: 4, marginBottom: 12 },
    sectionLabel: { fontSize: 10, fontWeight: '800', color: '#2ecc71', letterSpacing: 1.5 },
    actionsWrapper: { backgroundColor: colors.cardBg, borderRadius: 22, borderWidth: 1, borderColor: colors.cardBorder, padding: 8, marginBottom: 25 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 14 },
    actionIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    actionTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.textMain },
});