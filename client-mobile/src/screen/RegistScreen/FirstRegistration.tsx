import {
    View,
    Text,
    ImageBackground,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from "react-native";
import BgImage from "../../../assets/imgs/Background.png";
import React, { useState } from "react";
import { Link, router } from "expo-router";

export default function FirstRegistration() {
    const [name, setName] = useState("");
    const [pin, setPin] =  useState("");

    return (
        <ImageBackground
        source={BgImage}
        resizeMode="cover"
        style={styles.Background}
        >
            <View style={styles.content}>

                <Text style={styles.title}>
                    Belum{"\n"}Punya Akun?{"\n"}Daftar Sekarang!
                </Text>

                <Text style={styles.label}>Name</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="User Name"
                    autoCapitalize="none"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor={"#999"}
                />

                <Text style={styles.label}>Pin</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Regitration Pin"
                    value={pin}
                    onChangeText={setPin}
                    placeholderTextColor={"#999"}
                />

                <TouchableOpacity
                    style={styles.btn}
                    onPress={() => {
                        router.push("/(auth)/(registration)/VerifEmailScreen")
                    }}
                >
                    <Text style={styles.btnText}>LANJUT</Text>
                </TouchableOpacity>
            </View>

            <View style={{ alignItems: "center", marginTop: 24 }}>
                <Text style={styles.footer}>
                    Sudah Punya Akun?{" "}
                    <Link href={"/(auth)/login"} style={styles.link}>
                        Masuk Sekarang!
                    </Link>
                </Text>
            </View>
        
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    Background: {
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
        fontWeight: "700",
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
        borderRadius: 4,
        marginBottom: 16,
        paddingVertical: 12,
        paddingHorizontal: 12,
        height: 44,
    },
    btn: {
        backgroundColor: "#fff",
        borderRadius: 999,
        paddingVertical: 13,
        marginTop: 20
    },
    btnText: {
        color: "#A45EE5",
        textAlign: "center",
        fontWeight: 900,
        letterSpacing: 0.5,
    },
    footer: {
        color: "#111",
        fontWeight: "700",
        marginBottom: 15,
    },
    link: {
        color: "#A45EE5",
        textDecorationLine: "underline",
    }
})