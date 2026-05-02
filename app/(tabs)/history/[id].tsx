import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useApp } from "../../../context/AppContext";

const { width, height } = Dimensions.get("window");

const STATUS_CONFIG = {
  disease: {
    label: "Disease Detected",
    accent: "#e74c3c",
    icon: "alert-circle",
  },
  warning: { label: "Warning", accent: "#ef9f27", icon: "warning" },
  healthy: {
    label: "Healthy Plant",
    accent: "#2ecc71",
    icon: "checkmark-circle",
  },
} as const;

export default function HistoryDetailScreen() {
  const { t, colors, language, isDarkMode } = useApp();
  const { disease, date, img, result, resultEn, status } =
    useLocalSearchParams();
  const router = useRouter();
  const S = React.useMemo(
    () => getStyles(colors, isDarkMode),
    [colors, isDarkMode],
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderFormattedResult = () => {
    const isSinhala = language === "Sinhala";

    const hasSinhala = result && String(result).trim().length > 0;
    const hasEnglish = resultEn && String(resultEn).trim().length > 0;

    // Pick the best available text for the selected language
    const activeText = isSinhala
      ? hasSinhala
        ? result
        : resultEn
      : hasEnglish
        ? resultEn
        : result;

    if (!activeText) return null;

    const cleanStr = String(activeText)
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .trim();

    // ── Key fix: detect the CONTENT'S language, not the UI language ──────
    // Sinhala Unicode block: \u0D80-\u0DFF
    const contentIsSinhala = /[\u0D80-\u0DFF]/.test(cleanStr);

    const sinhalaRegex =
      /රෝගය හඳුනාගැනීම:|රෝගයේ ලක්ෂණ:|රෝගයට හේතුව:|ප්‍රතිකාර:/;
    const englishRegex = /Disease Name:|Symptoms:|Cause:|Treatments:/i;
    const regex = contentIsSinhala ? sinhalaRegex : englishRegex;

    const parts = cleanStr.split(regex);

    // Determine if there is a language mismatch to show notice
    const showSinhalaNotice = isSinhala && !hasSinhala && hasEnglish; // want Sinhala, only English exists
    const showEnglishNotice = !isSinhala && !hasEnglish && hasSinhala; // want English, only Sinhala exists

    return (
      <View style={{ gap: 15 }}>
        {/* Sinhala selected but only English exists */}
        {showSinhalaNotice && (
          <View style={S.noticeBanner}>
            <Ionicons name="information-circle" size={16} color="#ef9f27" />
            <Text style={S.noticeText}>
              සිංහල විශ්ලේෂණය නොමැත — ඉංග්‍රීසි දර්ශනය කෙරේ.
            </Text>
          </View>
        )}
        {/* English selected but only Sinhala exists */}
        {showEnglishNotice && (
          <View style={S.noticeBanner}>
            <Ionicons name="information-circle" size={16} color="#ef9f27" />
            <Text style={S.noticeText}>
              English analysis not available — showing Sinhala.
            </Text>
          </View>
        )}

        {parts.length > 1 ? (
          <>
            {parts[1] && (
              <ResultBlock
                title={t("diseaseLabel")}
                content={parts[1].trim()}
                icon="leaf"
                color="#2ecc71"
                S={S}
              />
            )}
            {parts[2] && (
              <ResultBlock
                title={t("symptomsLabel")}
                content={parts[2].trim()}
                icon="eye"
                color="#3498db"
                S={S}
              />
            )}
            {parts[3] && (
              <ResultBlock
                title={t("causeLabel")}
                content={parts[3].trim()}
                icon="help-circle"
                color="#e67e22"
                S={S}
              />
            )}
            {parts[4] && (
              <ResultBlock
                title={t("treatmentsLabel")}
                content={parts[4].trim()}
                icon="medical"
                color="#f1c40f"
                S={S}
              />
            )}
          </>
        ) : (
          <Text style={S.analysisText}>{cleanStr}</Text>
        )}
      </View>
    );
  };

  const ResultBlock = ({ title, content, icon, color, S }: any) => (
    <View style={S.resultSection}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
          gap: 8,
        }}
      >
        <Ionicons name={icon} size={18} color={color} />
        <Text style={[S.sectionLabel, { color: color }]}>
          {title.toUpperCase()}
        </Text>
      </View>
      <View style={S.analysisContentBox}>
        <Text style={S.analysisText}>{content}</Text>
      </View>
    </View>
  );

  const cfg =
    STATUS_CONFIG[(status as keyof typeof STATUS_CONFIG) ?? "healthy"];
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={colors.background}
        style={StyleSheet.absoluteFillObject}
      />
      <TouchableOpacity style={S.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={colors.textMain} />
      </TouchableOpacity>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[S.imageWrapper, { opacity: headerOpacity }]}>
          <Image source={{ uri: img as string }} style={S.mainImg} />
          <LinearGradient
            colors={["transparent", colors.background[0]] as any}
            style={S.imgOverlay}
          />
          <View style={[S.statusBadge, { backgroundColor: cfg.accent }]}>
            <Text style={S.statusText}>{cfg.label}</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            S.contentCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={S.diseaseLabel}>{t("identifiedDisease")}</Text>
          <Text style={S.diseaseTitle}>{disease}</Text>
          <View style={S.analysisWrapper}>{renderFormattedResult()}</View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background[0] },
    backBtn: {
      position: "absolute",
      top: 50,
      left: 20,
      zIndex: 10,
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    imageWrapper: { width: width, height: height * 0.4 },
    mainImg: { width: "100%", height: "100%" },
    imgOverlay: { position: "absolute", bottom: 0, width: "100%", height: 100 },
    statusBadge: {
      position: "absolute",
      bottom: 20,
      left: 20,
      padding: 8,
      borderRadius: 10,
    },
    statusText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
    contentCard: { padding: 20, marginTop: -20 },
    diseaseLabel: {
      color: colors.accent,
      fontWeight: "bold",
      fontSize: 12,
      letterSpacing: 1,
    },
    diseaseTitle: {
      color: colors.textMain,
      fontSize: 28,
      fontWeight: "900",
      marginBottom: 20,
    },
    analysisWrapper: { width: "100%" },
    resultSection: { marginBottom: 20 },
    sectionLabel: { fontSize: 12, fontWeight: "bold" },
    analysisContentBox: {
      backgroundColor: colors.cardBg,
      padding: 15,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    analysisText: { color: colors.textMain, fontSize: 15, lineHeight: 24 },
    noticeBanner: {
      backgroundColor: "rgba(239,159,39,0.12)",
      borderWidth: 1,
      borderColor: "rgba(239,159,39,0.3)",
      borderRadius: 12,
      padding: 12,
      flexDirection: "row" as const,
      gap: 8,
      alignItems: "center" as const,
    },
    noticeText: { color: "#ef9f27", fontSize: 12, flex: 1, lineHeight: 18 },
  });
