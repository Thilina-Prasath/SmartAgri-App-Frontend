import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useApp } from "../../context/AppContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type HistoryItem = {
  id: string;
  date: string;
  disease: string;
  img: string;
  result?: string;
  resultEn?: string;
  confidence?: number;
  status?: "disease" | "warning" | "healthy";
};

const STATUS_CONFIG = {
  disease: {
    label: "Disease",
    tag: "#e74c3c",
    tagBg: "rgba(231,76,60,0.12)",
    tagBorder: "rgba(231,76,60,0.22)",
    accent: "#e74c3c",
    bar: ["#7a1a1a", "#e74c3c"],
  },
  warning: {
    label: "Warning",
    tag: "#ef9f27",
    tagBg: "rgba(239,159,39,0.12)",
    tagBorder: "rgba(239,159,39,0.22)",
    accent: "#ef9f27",
    bar: ["#854F0B", "#ef9f27"],
  },
  healthy: {
    label: "Healthy",
    tag: "#2ecc71",
    tagBg: "rgba(46,204,113,0.1)",
    tagBorder: "rgba(46,204,113,0.2)",
    accent: "#2ecc71",
    bar: ["#1a7a3c", "#2ecc71"],
  },
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({
  value,
  label,
  color = "#2ecc71",
  S,
}: {
  value: string;
  label: string;
  color?: string;
  S: any;
}) => (
  <View style={S.statCard}>
    <Text style={[S.statVal, { color }]}>{value}</Text>
    <Text style={S.statLabel}>{label}</Text>
  </View>
);

const HistoryCard = ({
  item,
  onPress,
  onDelete,
  S,
}: {
  item: HistoryItem;
  onPress: () => void;
  onDelete: () => void;
  S: any;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const cfg = STATUS_CONFIG[item.status ?? "healthy"];
  const conf = item.confidence ?? 90;

  const press = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity style={S.card} onPress={press} activeOpacity={0.85}>
        <View style={[S.cardAccent, { backgroundColor: cfg.accent }]} />

        {item.img ? (
          <Image source={{ uri: item.img }} style={S.cardImg} />
        ) : (
          <View style={S.cardImgPlaceholder}>
            <Text style={{ fontSize: 24 }}>🌿</Text>
          </View>
        )}

        <View style={S.cardBody}>
          <Text style={S.cardTitle} numberOfLines={1}>
            {item.disease}
          </Text>
          <Text style={S.cardDate}>{item.date}</Text>

          <View
            style={[
              S.tag,
              { backgroundColor: cfg.tagBg, borderColor: cfg.tagBorder },
            ]}
          >
            <Text style={[S.tagText, { color: cfg.tag }]}>{cfg.label}</Text>
          </View>

          <View style={S.confBar}>
            <LinearGradient
              colors={cfg.bar as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[S.confFill, { width: `${conf}%` as any }]}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={onDelete}
          style={S.deleteBtn}
          activeOpacity={0.6}
        >
          <Ionicons name="trash-outline" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const EmptyState = ({
  message,
  hint,
  S,
}: {
  message: string;
  hint: string;
  S: any;
}) => (
  <View style={S.emptyState}>
    <View style={S.emptyIcon}>
      <Text style={{ fontSize: 28 }}>🌱</Text>
    </View>
    <Text style={S.emptyText}>{message}</Text>
    <Text style={S.emptyHint}>{hint}</Text>
  </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const { t, colors, isDarkMode, isOfflineMode } = useApp();
  const router = useRouter();

  const S = React.useMemo(
    () => getStyles(colors, isDarkMode),
    [colors, isDarkMode],
  );

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, []),
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchHistory = async () => {
    try {
      const raw = await AsyncStorage.getItem("userData");
      if (raw) {
        const { id } = JSON.parse(raw);

        const cached = await AsyncStorage.getItem(`historyCache_${id}`);
        if (cached) {
          setHistory(JSON.parse(cached));
          setLoading(false);
        }

        if (!isOfflineMode) {
          try {
            const res = await fetch(
              `${process.env.EXPO_PUBLIC_API_URL}/analyze/history?userId=${id}`,
            );
            const data = await res.json();
            if (res.ok) {
              const formatted = data.map((item: any) => ({
                id: item._id,
                date: new Date(item.createdAt).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }),
                disease: item.disease ?? t("pastReport"),
                img: item.imageUrl,
                result: item.result,
                resultEn: item.resultEn,
                confidence: item.confidence ?? 85,
                status: item.status ?? "healthy",
              }));
              setHistory(formatted);
              await AsyncStorage.setItem(
                `historyCache_${id}`,
                JSON.stringify(formatted),
              );
            }
          } catch (netError) {
            // Handle network error silently
          }
        }
      }
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this scan history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const raw = await AsyncStorage.getItem("userData");
              if (raw) {
                const { id: userId } = JSON.parse(raw);

                const newHistory = history.filter((item) => item.id !== itemId);
                setHistory(newHistory);
                await AsyncStorage.setItem(
                  `historyCache_${userId}`,
                  JSON.stringify(newHistory),
                );

                const response = await fetch(
                  `https://smartagri-app-9sn4.onrender.com/api/analyze/history/${itemId}?userId=${userId}`,
                  {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json",
                      Accept: "application/json",
                    },
                    body: JSON.stringify({ userId: userId }),
                  },
                );

                if (!response.ok) {
                  let errorData;
                  const contentType = response.headers.get("content-type");
                  if (contentType && contentType.includes("application/json")) {
                    errorData = await response.json();
                  } else {
                    errorData = await response.text();
                  }
                  console.log(
                    "Server rejected delete:",
                    typeof errorData === "string"
                      ? errorData.substring(0, 100)
                      : errorData,
                  ); // Error එක Terminal එකේ බලාගන්න
                  throw new Error("Failed to delete from database");
                }
              }
            } catch (error) {
              console.error("Delete process failed:", error);
              Alert.alert("Error", "Failed to delete record.");
              fetchHistory();
            }
          },
        },
      ],
    );
  };

  const diseaseCount = history.filter(
    (h) => h.status === "disease" || h.status === "warning",
  ).length;
  const confItems = history.filter((h) => h.confidence != null);
  const avgConf = confItems.length
    ? Math.round(
        confItems.reduce((a, h) => a + (h.confidence ?? 0), 0) /
          confItems.length,
      )
    : 0;

  return (
    <View style={S.root}>
      <LinearGradient
        colors={colors.background}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View
        style={[
          S.inner,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={S.pageHeaderGroup}>
          <TouchableOpacity
            style={S.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <Text style={S.pageHeaderTitle}>{t("historyTitle")}</Text>
        </View>

        <View style={S.statsRow}>
          <StatCard
            S={S}
            value={String(history.length)}
            label={t("totalScansLabel")}
          />
          <StatCard
            S={S}
            value={String(diseaseCount)}
            label={t("diseasesFound")}
            color={colors.danger || "#e74c3c"}
          />
          <StatCard S={S} value={`${avgConf}%`} label={t("avgConfidence")} />
        </View>

        {loading ? (
          <View style={S.loadingWrap}>
            <View style={S.loadingPulse} />
            <View style={[S.loadingPulse, { opacity: 0.5, marginTop: 10 }]} />
            <View style={[S.loadingPulse, { opacity: 0.3, marginTop: 10 }]} />
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <HistoryCard
                item={item}
                S={S}
                onDelete={() => handleDelete(item.id)} // ✅ Delete function pass
                onPress={() =>
                  router.push({
                    pathname: "/history/[id]",
                    params: {
                      id: item.id,
                      disease: item.disease,
                      date: item.date,
                      img: item.img,
                      result: item.result,
                      resultEn: item.resultEn,
                      status: item.status,
                    },
                  })
                }
              />
            )}
            ListHeaderComponent={
              history.length > 0 ? (
                <Text style={S.sectionLabel}>{t("recentLabel")}</Text>
              ) : null
            }
            ListEmptyComponent={
              <EmptyState
                S={S}
                message={t("noHistory")}
                hint={t("emptyHistoryHint")}
              />
            }
            contentContainerStyle={S.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const getStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background[0] },
    inner: {
      flex: 1,
      paddingHorizontal: 22,
      paddingTop: Platform.OS === "ios" ? 60 : 50,
    },

    pageHeaderGroup: { width: "100%", marginBottom: 25 },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.cardBg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    pageHeaderTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.textMain,
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    },

    statsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
    statCard: {
      flex: 1,
      backgroundColor: colors.cardBg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: 18,
      padding: 14,
    },
    statVal: {
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
      fontSize: 22,
      fontWeight: "800",
      color: colors.accent,
    },
    statLabel: {
      fontSize: 10,
      color: colors.textMuted,
      marginTop: 3,
      letterSpacing: 0.3,
    },

    sectionLabel: {
      fontSize: 10,
      color: colors.accent,
      fontWeight: "700",
      letterSpacing: 1.4,
      marginBottom: 10,
    },
    listContent: { paddingBottom: 40 },

    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: colors.cardBg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: 18,
      padding: 14,
      marginBottom: 10,
      overflow: "hidden",
    },
    cardAccent: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      borderRadius: 3,
    },
    cardImg: { width: 62, height: 62, borderRadius: 13 },
    cardImgPlaceholder: {
      width: 62,
      height: 62,
      borderRadius: 13,
      backgroundColor: colors.iconBg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    cardBody: { flex: 1, minWidth: 0 },
    cardTitle: { fontSize: 14, fontWeight: "700", color: colors.textMain },
    cardDate: { fontSize: 11, color: colors.textMuted, marginTop: 3 },

    tag: {
      alignSelf: "flex-start",
      marginTop: 7,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 20,
      borderWidth: 1,
    },
    tagText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },

    confBar: {
      height: 3,
      backgroundColor: "rgba(150,150,150,0.15)",
      borderRadius: 3,
      marginTop: 8,
      overflow: "hidden",
    },
    confFill: { height: "100%", borderRadius: 3 },

    // ✅ Delete Button Style
    deleteBtn: { padding: 8, justifyContent: "center", alignItems: "center" },

    loadingWrap: { paddingTop: 10 },
    loadingPulse: {
      width: "100%",
      height: 88,
      borderRadius: 18,
      backgroundColor: colors.cardBg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },

    emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.iconBg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: { fontSize: 14, color: colors.textMuted, fontWeight: "500" },
    emptyHint: { fontSize: 12, color: "rgba(150,150,150,0.3)" },
  });
