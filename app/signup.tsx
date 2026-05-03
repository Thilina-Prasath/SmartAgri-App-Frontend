import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "../context/AppContext";

export default function SignupScreen() {
  const router = useRouter();
  const { t, colors } = useApp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert(t("error"), t("error"));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t("error"), t("error"));
      return;
    }

    animateButton();

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            confirmPassword: password,
          }),
        },
      );
      const text = await response.text();
      console.log("RAW RESPONSE:", text);

      const data = JSON.parse(text);

      if (response.ok) {
        Alert.alert(t("success"), t("success"));
        router.push("/login");
      } else {
        Alert.alert(t("error"), data.error);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      Alert.alert(t("error"), t("networkError"));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.root, { backgroundColor: colors.background[0] }]}>
        <StatusBar
          barStyle={
            colors.background[0] === "#0a1a0d"
              ? "light-content"
              : "dark-content"
          }
        />
        {/* Background Gradient */}
        <LinearGradient
          colors={colors.background}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Decorative circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <ScrollView contentContainerStyle={styles.container}>
          {/* Header */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              alignItems: "center",
            }}
          >
            <View style={styles.logoBadge}>
              <LinearGradient
                colors={colors.accentGradient}
                style={styles.logoInner}
              >
                <Image
                  source={require("../assets/images/icon.png")}
                  style={styles.logoImage}
                />
              </LinearGradient>
            </View>

            <Text>
              <Text style={styles.title}>Smart </Text>
              <Text style={[styles.title, styles.titleGreen]}>Agri</Text>
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {t("signupTitle")}
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <TextInput
              placeholder={t("namePlaceholder")}
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                { backgroundColor: colors.inputBg, color: colors.textMain },
              ]}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder={t("emailPlaceholder")}
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                { backgroundColor: colors.inputBg, color: colors.textMain },
              ]}
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              placeholder={t("passwordPlaceholder")}
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={[
                styles.input,
                { backgroundColor: colors.inputBg, color: colors.textMain },
              ]}
              value={password}
              onChangeText={setPassword}
            />

            <TextInput
              placeholder={t("confirmPasswordPlaceholder")}
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={[
                styles.input,
                { backgroundColor: colors.inputBg, color: colors.textMain },
              ]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {/* Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity onPress={handleSignup} activeOpacity={0.9}>
                <LinearGradient
                  colors={colors.accentGradient}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>{t("signupBtn")}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Link */}
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={[styles.link, { color: colors.accent }]}>
                {t("haveAccount")}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0a1a0d",
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
  },

  circle1: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(46,204,113,0.08)",
  },

  circle2: {
    position: "absolute",
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(46,204,113,0.05)",
  },

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

  title: {
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 38,
    fontWeight: "900",
    color: "#2ecc71",
  },
  titleGreen: { textAlign: "center", color: "#fff" },

  subtitle: {
    color: "#aaa",
    marginTop: 5,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.07)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    color: "#fff",
  },

  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  link: {
    marginTop: 18,
    textAlign: "center",
    color: "#2ecc71",
    fontWeight: "600",
  },
});
