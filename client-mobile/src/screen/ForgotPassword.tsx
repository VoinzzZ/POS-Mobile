import { 
    View,
    Text,
    ImageBackground,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from "react-native";
import BgImg from "../../assets/imgs/Background.png";
import { useState } from "react";
import { Link, router } from 'expo-router';

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    
    return (
        <ImageBackground
        source={BgImg}
        resizeMode="cover"
        style={styles.background}
        >
            <View style={styles.content}>

                <Text style={styles.title}>
                    Masukan{"\n"}Email Anda{"\n"}Untuk Verifikasi
                </Text>

                <Text style={styles.label}>Email</Text>
                <View style={styles.row}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Example@email.com"
                        value={email}
                        onChangeText={setEmail}
                        placeholderTextColor={"#999"}
                    />
                    <TouchableOpacity
                        style={styles.codeBtn}
                    >
                        <Text style={styles.codeText}>Send</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Verification Code</Text>
                <TextInput
                    style={styles.codeInput}
                    placeholder="Verification Code"
                    value={code}
                    onChangeText={setCode}
                    placeholderTextColor={"#999"}
                />

                <TouchableOpacity
                style={styles.btn}
                onPress={() => router.push("/(auth)/changePasswordScreen")}
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
        fontWeight: "700",
        lineHeight: 34,
        marginBottom: 28
    },
    label: {
        color: "#fff",
        fontWeight: "600",
        marginBottom: 6,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBlock: 16,
    },
    textInput: {
        backgroundColor: "#fff",
        borderRadius: 4,
        height: 40,
        paddingHorizontal: 12,
        width: 295,
        marginRight: 12,
        textAlignVertical: "center", 
    },
    codeBtn: {
        backgroundColor: "#fff",
        borderRadius: 4,
        height: 40,
        width: 87,
        paddingHorizontal: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    codeText: {
        color: "#A45EE5",
        fontWeight: "600",
        fontSize: 16,
        includeFontPadding: false,
        lineHeight: 20,
        textAlign: "center",
        textAlignVertical: "center",
    },
    codeInput: {
        backgroundColor: "#fff",
        borderRadius: 4,
        height: 40,
        paddingHorizontal: 12,
        marginBottom: 16,
        textAlignVertical: "center",
        width: 395,
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