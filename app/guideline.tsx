import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';

const Step = ({ number, title, desc, icon }: any) => (
    <View style={styles.stepCard}>
        <View style={styles.stepHeader}>
            <View style={styles.numberCircle}><Text style={styles.numberText}>{number}</Text></View>
            <Ionicons name={icon} size={24} color="#2ecc71" />
        </View>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDesc}>{desc}</Text>
    </View>
);

export default function GuidelineScreen() {
    const { t } = useApp();
    const router = useRouter();

    return (
        <View style={styles.root}>
            <LinearGradient colors={['#080f0a', '#0a1a0d']} style={StyleSheet.absoluteFillObject} />
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.mainTitle}>{t('guideTitle')}</Text>
                <Text style={styles.mainSub}>{t('guideSubtitle')}</Text>

                {/* step 01 */}
                <Step
                    number="01"
                    title={t('step1Title')}
                    desc={t('step1Desc')}
                    icon="camera"
                />

                {/* step 02 */}
                <Step
                    number="02"
                    title={t('step2Title')}
                    desc={t('step2Desc')}
                    icon="search"
                />

                {/* step 03 */}
                <Step
                    number="03"
                    title={t('step3Title')}
                    desc={t('step3Desc')}
                    icon="document-text"
                />

                {/* step 04 */}
                <Step
                    number="04"
                    title={t('step4Title')}
                    desc={t('step4Desc')}
                    icon="time"
                />

                <View style={styles.tipBox}>
                    <Ionicons name="bulb" size={20} color="#f1c40f" />
                    <Text style={styles.tipText}>{t('tipText')}</Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    container: { padding: 25, paddingTop: 60 },
    backBtn: { marginBottom: 20 },
    mainTitle: { fontSize: 32, fontWeight: '900', color: '#fff', textAlign: 'center' },
    mainSub: { color: '#2ecc71', textAlign: 'center', marginBottom: 40, fontSize: 14 },
    stepCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(46,204,113,0.1)' },
    stepHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    numberCircle: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#2ecc71', justifyContent: 'center', alignItems: 'center' },
    numberText: { color: '#fff', fontWeight: 'bold' },
    stepTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    stepDesc: { color: 'rgba(255,255,255,0.6)', lineHeight: 22 },
    tipBox: { flexDirection: 'row', gap: 10, padding: 20, backgroundColor: 'rgba(241,196,15,0.1)', borderRadius: 15, marginTop: 10 },
    tipText: { flex: 1, color: '#f1c40f', fontSize: 13 }
});