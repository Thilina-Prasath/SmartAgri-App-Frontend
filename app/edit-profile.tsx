import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useApp } from "../context/AppContext";

export default function EditProfileScreen() {
  const { t, colors, isDarkMode } = useApp();
  const router = useRouter();

  const styles = React.useMemo(
    () => getStyles(colors, isDarkMode),
    [colors, isDarkMode],
  );
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const raw = await AsyncStorage.getItem("userData");
      if (raw) setName(JSON.parse(raw).name);
    };
    loadUser();
  }, []);

  const handleUpdate = async () => {
    if (!name) return Alert.alert("Error", "Name cannot be empty");
    setLoading(true);

    try {
      const rawUser = await AsyncStorage.getItem("userData");
      const user = JSON.parse(rawUser!);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, name, password }),
        },
      );

      const data = await response.json();
      if (response.ok) {
        // Update Local Storage
        const updatedUser = { ...user, name: data.user.name };
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
        Alert.alert("Success", "Profile updated successfully!");
        router.back();
      } else {
        Alert.alert("Error", data.error);
      }
    } catch (error) {
      Alert.alert("Error", "Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={colors.background}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textMain} />
        </TouchableOpacity>

        <Text style={styles.title}>{t("editProfileTitle")}</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("fullNameLabel")}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={t("fullNameLabel")}
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>{t("newPassLabel")}</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={t("newPassLabel")}
            secureTextEntry
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleUpdate}
          disabled={loading}
        >
          <LinearGradient
            colors={["#2ecc71", "#27ae60"]}
            style={styles.btnInner}
          >
            <Text style={styles.saveBtnText}>
              {loading ? t("updatingBtn") : t("saveChangesBtn")}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    root: { flex: 1 },
    container: { padding: 25, paddingTop: 60 },
    backBtn: { marginBottom: 20 },
    title: {
      fontSize: 28,
      fontWeight: "900",
      color: colors.textMain,
      marginBottom: 30,
    },
    inputGroup: { marginBottom: 30 },
    label: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: "700",
      marginBottom: 8,
      textTransform: "uppercase",
    },
    input: {
      backgroundColor: colors.cardBg,
      borderRadius: 12,
      padding: 15,
      color: colors.textMain,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    saveBtn: { borderRadius: 15, overflow: "hidden", marginTop: 10 },
    btnInner: { padding: 18, alignItems: "center" },
    saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  });
