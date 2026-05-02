import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "../../context/AppContext";

const { width } = Dimensions.get("window");

// ─── Floating particles ───────────────────────────────────────────────────────
const Particle = ({ delay, x }: { delay: number; x: number }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim, {
            toValue: -130,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.55,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 3100,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };
    loop();
  }, []);
  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 24,
        left: x,
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: "#2ecc71",
        transform: [{ translateY: anim }],
        opacity,
      }}
    />
  );
};

// ─── Pulsing loading dots ─────────────────────────────────────────────────────
const LoadingDot = ({ delay, S }: { delay: number; S: any }) => {
  const anim = useRef(new Animated.Value(0.25)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.25,
          duration: 380,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);
  return <Animated.View style={[S.dot, { opacity: anim }]} />;
};

// ─── Analysis Section Component ───────────────────────────────────────────────
const ResultBlock = ({ title, content, icon, color, S }: any) => (
  <View style={S.resultSection}>
    <View style={S.sectionHeader}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[S.sectionLabel, { color: color }]}>{title}</Text>
    </View>
    <View style={S.analysisContentBox}>
      <Text style={S.analysisText}>{content}</Text>
    </View>
  </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { t, colors, language, isDarkMode } = useApp();
  const S = React.useMemo(
    () => getStyles(colors, isDarkMode),
    [colors, isDarkMode],
  );

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultSin, setResultSin] = useState("");
  const [resultEn, setResultEn] = useState("");

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(36)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;
  const resultFade = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);

  // Pick the active result for the current language, fall back to the other if empty
  const activeResult =
    language === "Sinhala" ? resultSin || resultEn : resultEn || resultSin;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 780,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      scanAnim.setValue(0);
    }
  }, [loading]);

  useEffect(() => {
    if (activeResult) {
      resultFade.setValue(0); // reset so fade-in always plays
      Animated.timing(resultFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [activeResult]);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!res.canceled) {
      setImage(res.assets[0].uri);
      setResultSin("");
      setResultEn("");
    }
  };

  const takePhoto = async () => {
    // Check current permission status first
    const { status: existingStatus } =
      await ImagePicker.getCameraPermissionsAsync();

    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert(
        t("error"),
        "Camera permission is required. Please enable it in your device Settings → Apps → SmartAgri → Permissions.",
        [{ text: "OK" }],
      );
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!res.canceled) {
      setImage(res.assets[0].uri);
      setResultSin("");
      setResultEn("");
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setResultSin("");
    setResultEn("");
    resultFade.setValue(0); // reset fade so result card animates in fresh

    const formData = new FormData();
    formData.append("image", {
      uri: image,
      name: "photo.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const raw = await AsyncStorage.getItem("userData");
      if (raw) formData.append("userId", JSON.parse(raw).id);
      formData.append("language", language);

      const response = await fetch(
        "${process.env.EXPO_PUBLIC_API_URL}/analyze",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();
      if (response.ok) {
        // Guard against null/undefined from backend
        setResultSin(data.analysis || "");
        setResultEn(data.analysisEn || "");
        // Scroll to bottom after a short delay so result card renders first
        setTimeout(
          () => scrollRef.current?.scrollToEnd({ animated: true }),
          300,
        );
      } else {
        Alert.alert(t("error"), data.error || "Analysis failed.");
      }
    } catch {
      Alert.alert(t("error"), t("networkError"));
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedResult = () => {
    if (!activeResult) return null;

    const cleanStr = activeResult
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .trim();

    const isSinhala = language === "Sinhala";
    const regex = isSinhala
      ? /රෝගය හඳුනාගැනීම:|රෝගයේ ලක්ෂණ:|රෝගයට හේතුව:|පිළියම්:|ප්‍රතිකාර:/
      : /Disease Name:|Symptoms:|Cause:|Treatments:/i;

    const parts = cleanStr.split(regex);

    if (parts.length > 1) {
      return (
        <View style={{ gap: 15 }}>
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
        </View>
      );
    } else {
      return <Text style={S.analysisText}>{cleanStr}</Text>;
    }
  };

  const scanY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 240],
  });

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={colors.background}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={S.orb1} />
      <View style={S.orb2} />
      {[32, 100, 190, 270, 330].map((x, i) => (
        <Particle key={i} x={x} delay={i * 700} />
      ))}

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={S.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            S.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={S.logoBadge}>
            <LinearGradient colors={colors.accentGradient} style={S.logoInner}>
              <Image
                source={require("../../assets/images/icon.png")}
                style={S.logoImage}
              />
            </LinearGradient>
          </View>
          <Text style={S.titleContainer}>
            <Text style={S.title}>Smart </Text>
            <Text style={[S.title, S.titleGreen]}>Agri</Text>
          </Text>
          <Text style={S.subtitle}>{t("homeSubtitle")}</Text>
        </Animated.View>

        <Animated.View style={[S.imgZone, { opacity: fadeAnim }]}>
          {image ? (
            <>
              <Image source={{ uri: image }} style={S.img} />
              <View style={[S.corner, S.cTL]} />
              <View style={[S.corner, S.cTR]} />
              <View style={[S.corner, S.cBL]} />
              <View style={[S.corner, S.cBR]} />
              {loading && (
                <Animated.View
                  style={[S.scanLine, { transform: [{ translateY: scanY }] }]}
                />
              )}
            </>
          ) : (
            <TouchableOpacity style={S.placeholder} onPress={pickImage}>
              <View style={S.uploadCircle}>
                <Text
                  style={{
                    fontSize: 26,
                    marginBottom: 10,
                    color: colors.accent,
                  }}
                >
                  📷
                </Text>
              </View>
              <Text style={S.placeholderText}>{t("uploadHint")}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <Animated.View style={[S.btnGroup, { opacity: fadeAnim }]}>
          <TouchableOpacity
            onPress={() =>
              Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
              }).start(() => takePhoto())
            }
            style={{ width: "100%" }}
            disabled={loading}
          >
            <LinearGradient
              colors={["#1a7a3c", "#27ae60", "#2ecc71"]}
              style={S.btnPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={S.btnPrimaryText}>📸 {t("takePhoto")}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={S.btnGhost}
            onPress={pickImage}
            disabled={loading}
          >
            <Text style={S.btnGhostText}>{t("pickGallery")}</Text>
          </TouchableOpacity>

          {image && !loading && (
            <TouchableOpacity onPress={analyzeImage} style={S.btnAnalyze}>
              <Text style={S.btnAnalyzeText}>🔬 {t("analyzeBtn")}</Text>
            </TouchableOpacity>
          )}

          {loading && (
            <View style={S.loadingRow}>
              <LoadingDot delay={0} S={S} />
              <LoadingDot delay={160} S={S} />
              <LoadingDot delay={320} S={S} />
            </View>
          )}
        </Animated.View>

        {activeResult ? (
          <Animated.View style={[S.resultCard, { opacity: resultFade }]}>
            <View style={S.resultHeader}>
              <View style={S.aiBadge}>
                <Text style={S.aiBadgeText}>{t("aiResultBadge")}</Text>
              </View>
              <View style={S.checkCircle}>
                <Ionicons name="checkmark" size={16} color={colors.accent} />
              </View>
            </View>

            <Text style={S.reportTitle}>{t("analysisReport")}</Text>
            <View style={S.reportBody}>{renderFormattedResult()}</View>

            <View style={S.disclaimer}>
              <Text style={S.warnIcon}>⚠</Text>
              <Text style={S.disclaimerText}>{t("disclaimer")}</Text>
            </View>
          </Animated.View>
        ) : null}
        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background[0] },
    scroll: { alignItems: "center", paddingTop: 54, paddingHorizontal: 20 },
    orb1: {
      position: "absolute",
      top: -100,
      right: -80,
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: colors.iconBg,
    },
    orb2: {
      position: "absolute",
      bottom: 240,
      left: -110,
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: colors.iconBg,
    },
    header: { alignItems: "center", marginBottom: 22 },
    logoBadge: {
      marginBottom: 15,
    },

    logoInner: {
      width: 80,
      height: 80,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    logoImage: {
      width: 80,
      height: 80,
      borderRadius: 10,
      resizeMode: "contain",
    },
    titleContainer: { flexDirection: "row" },
    title: {
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
      fontSize: 38,
      fontWeight: "900",
      color: colors.textMain,
    },
    titleGreen: { color: colors.accent },
    subtitle: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 8,
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    imgZone: {
      width: "100%",
      height: 270,
      borderRadius: 24,
      overflow: "hidden",
      backgroundColor: colors.cardBg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      marginBottom: 18,
    },
    img: { width: "100%", height: "100%" },
    placeholder: { flex: 1, alignItems: "center", justifyContent: "center" },
    uploadCircle: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: colors.iconBg,
      borderWidth: 1.5,
      borderColor: colors.accent,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
    },
    placeholderText: { fontSize: 13, color: colors.textMuted, marginTop: 10 },
    scanLine: {
      position: "absolute",
      left: 0,
      width: "100%",
      height: 2,
      backgroundColor: colors.accent,
      zIndex: 5,
      shadowColor: colors.accent,
      shadowRadius: 8,
      shadowOpacity: 0.8,
    },
    corner: {
      position: "absolute",
      width: 18,
      height: 18,
      borderColor: colors.accent,
    },
    cTL: { top: 14, left: 14, borderTopWidth: 2, borderLeftWidth: 2 },
    cTR: { top: 14, right: 14, borderTopWidth: 2, borderRightWidth: 2 },
    cBL: { bottom: 14, left: 14, borderBottomWidth: 2, borderLeftWidth: 2 },
    cBR: { bottom: 14, right: 14, borderBottomWidth: 2, borderRightWidth: 2 },
    btnGroup: { width: "100%", alignItems: "center", gap: 10 },
    btnPrimary: {
      width: "100%",
      paddingVertical: 18,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    btnPrimaryText: { color: "#fff", fontSize: 17, fontWeight: "800" },
    btnGhost: {
      width: "100%",
      paddingVertical: 13,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      alignItems: "center",
    },
    btnGhostText: { color: colors.textMuted, fontWeight: "600" },
    btnAnalyze: {
      width: "100%",
      paddingVertical: 17,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: colors.accent,
      backgroundColor: colors.iconBg,
      alignItems: "center",
      marginTop: 5,
    },
    btnAnalyzeText: { color: colors.accent, fontSize: 16, fontWeight: "800" },
    loadingRow: { flexDirection: "row", gap: 8, marginTop: 10 },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.accent,
    },
    resultCard: {
      width: "100%",
      borderRadius: 24,
      backgroundColor: colors.cardBg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      marginTop: 22,
      overflow: "hidden",
    },
    resultHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
      alignItems: "center",
    },
    aiBadge: {
      backgroundColor: colors.iconBg,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
    },
    aiBadgeText: {
      color: colors.accent,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1,
    },
    checkCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.iconBg,
      alignItems: "center",
      justifyContent: "center",
    },
    reportTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.textMain,
      padding: 16,
      paddingBottom: 0,
    },
    reportBody: { padding: 16 },
    resultSection: { marginBottom: 18 },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    analysisContentBox: {
      backgroundColor: isDarkMode
        ? "rgba(255,255,255,0.03)"
        : "rgba(0,0,0,0.02)",
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    analysisText: { fontSize: 15, lineHeight: 24, color: colors.textMain },
    disclaimer: {
      flexDirection: "row",
      padding: 14,
      borderTopWidth: 1,
      borderTopColor: colors.cardBorder,
      gap: 8,
    },
    warnIcon: { color: "#f1c40f", fontWeight: "bold" },
    disclaimerText: {
      flex: 1,
      fontSize: 11,
      color: colors.textMuted,
      lineHeight: 16,
    },
  });
