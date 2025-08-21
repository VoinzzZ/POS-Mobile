import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Pressable,
} from "react-native";
import BgImage from "../../assets/imgs/Background.png";
import PasswordInput from "../components/PasswordInput";
import { Link } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ImageBackground
      source={BgImage}
      style={styles.background}
      resizeMode="cover" 
    >
      <View style={styles.content}>

        <Text style={styles.title}>
          Sudah{"\n"}Punya Akun?{"\n"}Masuk Sekarang!
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <PasswordInput value={password} onChangeText={setPassword}/>
        
        <Pressable
          onPress={() => {}}
          style={{ alignSelf: "flex-end"}}
        >
          <Text style={styles.forgot}>Forgot Passord?</Text>
        </Pressable>

        <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnText}>MASUK</Text>
        </TouchableOpacity>

      </View>

      <View style={{ alignItems: "center", marginTop: 24 }}>
        <Text style={styles.footer}>
          Belum Punya Akun?{" "}
          <Link href={"/(auth)/(registration)/FirstRegistScreen"}>
            <Text style={styles.link}>Daftar Sekarang</Text>
          </Link>
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
    marginBottom: 28,
  },
  label: {
    color: "#fff",
    fontWeight: "600",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  forgot: {
    color: "#eae6ff",
    textDecorationLine: "underline"
  },
  btn: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 13,
    marginTop: 22
  },
  btnText: {
    color: "#A45EE5",
    textAlign: "center",
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  footer: {
    color: "#111",
    fontWeight: "700",
    marginBottom: 15,
  },
  link: {
    color: "#A45EE5",
    textDecorationLine: "underline"
  }
});
