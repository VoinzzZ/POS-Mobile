import { 
    View,
    Text,
    ImageBackground,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import BgImg from "../../assets/imgs/Background.png"
import { useState } from "react";
import { Link } from "expo-router";
import PasswordInput from "../components/PasswordInput";

export default function ChangePassword() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    
    return (
        <ImageBackground
        source={BgImg}
        resizeMode="cover"
        style={styles.background}
        >
            <View style={styles.content}>

                <Text style={styles.title}>
                    Buat{"\n"}Kata Sandi Baru{"\n"}Untuk Akun Anda
                </Text>

                <View style={styles.password}>
                    <PasswordInput 
                    value={password} 
                    onChangeText={setPassword}
                    placeholder="New Password"
                    label="New Password"
                    />
                </View>
                <View style={styles.confirm}>
                    <PasswordInput 
                    value={confirm} 
                    onChangeText={setConfirm} 
                    placeholder="Confirm Password" 
                    label="Confirm Password" 
                    />
                </View>
                <TouchableOpacity style={styles.btn}>
                    <Text style={styles.btnText}>Daftar</Text>
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
        justifyContent: "center"
    },
    title: {
        color: "#fff",
        fontSize: 30,
        fontWeight: "700",
        lineHeight: 34,
        marginBottom: 28
    },
    password: {
        marginBottom: 5
    },
    confirm: {
        marginBottom: 10
    },
    btn: {
        backgroundColor: "#fff",
        borderRadius: 999,
        paddingVertical: 13,
        marginTop: 20,
    },
    btnText: {
        color: "#A45EE5",
        textAlign: "center",
        fontWeight: "900",
        letterSpacing: 0.5
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