import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "../context/AppContext";

const { width } = Dimensions.get("window");

const Particle = ({ delay, x }: any) => {
  const anim = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim, {
            toValue: -120,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.6,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 3200,
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
        bottom: 20,
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

export default function LoginScreen() {
  const { t, colors } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;
  const scaleBtn = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pressAnim = () => {
    Animated.sequence([
      Animated.timing(scaleBtn, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleBtn, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogin = async () => {
    pressAnim();
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await res.json();

      // ✅ if/else is inside try, and uses 'res' (not 'response')
      if (res.ok) {
        await AsyncStorage.setItem("userToken", data.token);
        await AsyncStorage.setItem("userData", JSON.stringify(data.user));
        Alert.alert(t("success"), `Welcome ${data.user.name}!`);
        router.replace("/(tabs)");
      } else {
        Alert.alert(t("error"), data.error);
      }
    } catch (err) {
      console.log(err);
      Alert.alert(t("error"), t("networkError"));
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background[0] }]}>
      <StatusBar
        barStyle={
          colors.background[0] === "#0a1a0d" ? "light-content" : "dark-content"
        }
      />

      <LinearGradient
        colors={colors.background}
        style={StyleSheet.absoluteFillObject}
      />

      {[40, 100, 160, 220, 280, 320].map((x, i) => (
        <Particle key={i} x={x} delay={i * 500} />
      ))}

      <Animated.View
        style={[
          styles.container,
          { opacity: fade, transform: [{ translateY: slide }] },
        ]}
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
          {t("loginTitle")}
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
          ]}
        >
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

          <Animated.View style={{ transform: [{ scale: scaleBtn }] }}>
            <TouchableOpacity onPress={handleLogin}>
              <LinearGradient
                colors={colors.accentGradient}
                style={styles.button}
              >
                <Text style={styles.buttonText}>{t("loginBtn")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={[styles.link, { color: colors.accent }]}>
            {t("needAccount")}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1, justifyContent: "center", padding: 25 },
  logoBox: { alignItems: "center", marginBottom: 20 },
  logoGrad: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: { color: "#aaa", textAlign: "center", marginBottom: 30 },
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
    color: "#fff",
    marginBottom: 15,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  link: {
    textAlign: "center",
    marginTop: 20,
    color: "#2ecc71",
    fontWeight: "600",
  },
  logoBadge: {
    marginBottom: 15,
    alignItems: "center",
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
    alignItems: "center",
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
});
