import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet, Text, View, Switch, TouchableOpacity,
    Alert, ScrollView, Animated, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';

// ─── Reusable row components ───────────────────────────────────────────────────

type IconBoxVariant = 'green' | 'red' | 'amber' | 'blue';

interface RowProps {
    icon: string;
    iconVariant?: IconBoxVariant;
    label: string;
    sublabel?: string;
    onPress?: () => void;
    right?: React.ReactNode;
}

const ICON_BG: Record<IconBoxVariant, string> = {
    green: 'rgba(46,204,113,0.12)',
    red: 'rgba(231,76,60,0.1)',
    amber: 'rgba(239,159,39,0.12)',
    blue: 'rgba(52,152,219,0.12)',
};

const ICON_COLOR: Record<IconBoxVariant, string> = {
    green: '#2ecc71',
    red: '#e74c3c',
    amber: '#ef9f27',
    blue: '#3498db',
};

const SettingsRow = ({
    icon, iconVariant = 'green', label, sublabel, onPress, right, S, colors
}: RowProps & { S: any, colors: any }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const press = () => {
        if (!onPress) return;
        Animated.sequence([
            Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start();
        onPress();
    };
    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
                style={S.row}
                onPress={press}
                activeOpacity={onPress ? 0.7 : 1}
                disabled={!onPress}
            >
                <View style={S.rowLeft}>
                    <View style={[S.iconBox, { backgroundColor: ICON_BG[iconVariant] }]}>
                        <Ionicons name={icon as any} size={18} color={ICON_COLOR[iconVariant]} />
                    </View>
                    <View style={{ flexShrink: 1 }}>
                        <Text style={[S.rowLabel, iconVariant === 'red' && { color: colors.danger || '#e74c3c' }]}>
                            {label}
                        </Text>
                        {sublabel ? <Text style={S.rowSub}>{sublabel}</Text> : null}
                    </View>
                </View>
                {right}
            </TouchableOpacity>
        </Animated.View>
    );
};

const SectionLabel = ({ title, S }: { title: string; S: any }) => (
    <Text style={S.secLabel}>{title.toUpperCase()}</Text>
);

const CardGroup = ({ children, S }: { children: React.ReactNode; S: any }) => (
    <View style={S.cardGroup}>{children}</View>
);

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function SettingsScreen() {
    const router = useRouter();
    const { t, colors, isDarkMode, toggleTheme, language, changeLanguage, isOfflineMode, toggleOfflineMode } = useApp();

    const S = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

    // Entrance animation
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 650, useNativeDriver: true }),
        ]).start();
    }, []);

    const toggleLanguage = async () => {
        const next = language === 'Sinhala' ? 'English' : 'Sinhala';
        await changeLanguage(next);
        Alert.alert(
            next === 'Sinhala' ? 'භාෂාව වෙනස් විය' : 'Language changed',
            next === 'Sinhala'
                ? 'දැන් ඇප් එක සිංහල භාෂාවෙන් ක්‍රියා කරයි.'
                : 'The app is now running in English.',
        );
    };

    const handleClearCache = () => {
        Alert.alert(t('clearCache'), t('clearCachePrompt'), [
            { text: t('cancel'), style: 'cancel' },
            {
                text: t('yes'),
                style: 'destructive',
                onPress: async () => {
                    try {
                        // Get the logged-in user's ID to clear their specific cache
                        const raw = await AsyncStorage.getItem('userData');
                        const keysToRemove: string[] = [];

                        if (raw) {
                            const { id } = JSON.parse(raw);
                            keysToRemove.push(`historyCache_${id}`);
                        }

                        // Also clear any other app cache keys (add more here as needed)
                        const allKeys = await AsyncStorage.getAllKeys();
                        const cacheKeys = allKeys.filter(k => k.startsWith('historyCache_'));
                        keysToRemove.push(...cacheKeys);

                        if (keysToRemove.length > 0) {
                            await AsyncStorage.multiRemove([...new Set(keysToRemove)]);
                        }

                        Alert.alert(t('success'), t('cacheCleared'));
                    } catch (e) {
                        Alert.alert(t('error'), 'Failed to clear cache. Please try again.');
                    }
                },
            },
        ]);
    };

    const handleLogout = () => {
        Alert.alert(t('logout'), t('logoutPrompt'), [
            { text: t('no'), style: 'cancel' },
            {
                text: t('yes'),
                style: 'destructive',
                onPress: async () => {
                    await AsyncStorage.clear();
                    router.replace('/login');
                },
            },
        ]);
    };

    return (
        <View style={S.root}>
            <LinearGradient
                colors={colors.background}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Ambient orbs */}
            <View style={S.orb1} />
            <View style={S.orb2} />

            <ScrollView
                contentContainerStyle={S.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Page header ── */}
                <Animated.View
                    style={[S.pageHeader, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
                >
                    <TouchableOpacity style={S.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
                        <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                    <Text style={S.pageTitle}>{t('settingsTitle')}</Text>
                </Animated.View>

                {/* ── Profile card ── */}

                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: '100%' }}>

                    {/* ── Appearance ── */}
                    <View style={S.section}>
                        <SectionLabel title={t('appearance')} S={S} />
                        <CardGroup S={S}>
                            <SettingsRow
                                icon="moon"
                                label={t('darkMode')}
                                S={S} colors={colors}
                                right={
                                    <Switch
                                        value={isDarkMode}
                                        onValueChange={toggleTheme}
                                        trackColor={{ false: 'rgba(150,150,150,0.12)', true: colors.accent }}
                                        thumbColor="#fff"
                                        ios_backgroundColor="rgba(150,150,150,0.12)"
                                    />
                                }
                            />
                        </CardGroup>
                    </View>

                    {/* ── Language ── */}
                    <View style={S.section}>
                        <SectionLabel title={t('languageSection')} S={S} />
                        <CardGroup S={S}>
                            <SettingsRow
                                icon="language"
                                label={t('primaryLanguage')}
                                onPress={toggleLanguage}
                                S={S} colors={colors}
                                right={
                                    <View style={S.rowRight}>
                                        <Text style={S.valueText}>{language}</Text>
                                        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                                    </View>
                                }
                            />
                        </CardGroup>
                    </View>

                    {/* ── Data & Storage ── */}
                    <View style={S.section}>
                        <SectionLabel title={t('dataStorage')} S={S} />
                        <CardGroup S={S}>
                            <SettingsRow
                                icon="cloud-offline"
                                iconVariant="amber"
                                label={t('offlineMode')}
                                sublabel={t('offlineDesc')}
                                S={S} colors={colors}
                                right={
                                    <Switch
                                        value={isOfflineMode}
                                        onValueChange={toggleOfflineMode}
                                        trackColor={{ false: 'rgba(150,150,150,0.12)', true: '#ef9f27' }}
                                        thumbColor="#fff"
                                    />
                                }
                            />
                            <SettingsRow
                                icon="trash"
                                iconVariant="red"
                                label={t('clearCache')}
                                onPress={handleClearCache}
                                S={S} colors={colors}
                                right={
                                    <Ionicons name="chevron-forward" size={16} color={colors.danger || '#e74c3c'} opacity={0.5} />
                                }
                            />
                        </CardGroup>
                    </View>

                    {/* ── About ── */}
                    <View style={S.section}>
                        <SectionLabel title={t('other')} S={S} />
                        <CardGroup S={S}>
                            <SettingsRow
                                icon="information-circle"
                                label={t('appVersion')}
                                S={S} colors={colors}
                                right={
                                    <View style={S.verPill}>
                                        <Text style={S.verPillText}>v 1.0.2</Text>
                                    </View>
                                }
                            />

                        </CardGroup>
                    </View>

                    {/* ── Logout ── */}
                    <TouchableOpacity style={S.logoutBtn} onPress={handleLogout} activeOpacity={0.75}>
                        <Text style={S.logoutText}>{t('logout')}</Text>
                    </TouchableOpacity>

                    <View style={{ height: 52 }} />
                </Animated.View>
            </ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const getStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background[0] },
    scroll: { alignItems: 'center', paddingTop: 54, paddingHorizontal: 20 },

    orb1: {
        position: 'absolute', top: -80, right: -70,
        width: 240, height: 240, borderRadius: 120,
        backgroundColor: colors.iconBg || 'rgba(46,204,113,0.07)',
    },
    orb2: {
        position: 'absolute', bottom: 320, left: -90,
        width: 200, height: 200, borderRadius: 100,
        backgroundColor: colors.iconBg || 'rgba(0,200,80,0.04)',
    },

    // Header
    pageHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        width: '100%', marginBottom: 22,
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: colors.cardBg,
        borderWidth: 1, borderColor: colors.cardBorder,
        alignItems: 'center', justifyContent: 'center',
    },
    pageTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        fontSize: 26, fontWeight: '900', color: colors.textMain, letterSpacing: -0.3,
    },

    // Sections
    section: { width: '100%', marginBottom: 22 },
    secLabel: {
        fontSize: 10, color: colors.accent, fontWeight: '700',
        letterSpacing: 1.4, marginBottom: 10, paddingLeft: 2,
    },
    cardGroup: {
        backgroundColor: colors.cardBg,
        borderRadius: 20, borderWidth: 1, borderColor: colors.cardBorder,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 14, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
    iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    rowLabel: { fontSize: 15, fontWeight: '500', color: colors.textMain },
    rowSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
    rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    valueText: { fontSize: 13, fontWeight: '700', color: colors.accent },

    // Version pill
    verPill: {
        backgroundColor: colors.iconBg,
        borderWidth: 1, borderColor: colors.cardBorder,
        borderRadius: 20, paddingHorizontal: 11, paddingVertical: 3,
    },
    verPillText: { fontSize: 11, fontWeight: '700', color: colors.accent },

    // Logout
    logoutBtn: {
        width: '100%', paddingVertical: 16, borderRadius: 18,
        backgroundColor: 'rgba(231,76,60,0.08)',
        borderWidth: 1, borderColor: 'rgba(231,76,60,0.2)',
        alignItems: 'center', marginTop: 6,
    },
    logoutText: { fontSize: 15, fontWeight: '800', color: colors.danger || '#e74c3c', letterSpacing: 0.3 },
});