import { 
    View,
    Text,
    ImageBackground,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from "react-native";
import BgImg from "../../../assets/imgs/Background.png"
import { useState } from "react";

export default function VerifiedEmail() {
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
                    Masukan{"\n"}Email Anda{"\n"}untuk Verifikasi
                </Text>

                <Text style={styles.label}>Email</Text>
                <View style={styles.row}>
                    <TextInput
                    style={styles.emailInput}
                    placeholder="Example@email.com"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor={"#999"}
                    />

                    <TouchableOpacity style={styles.codeBtn}>
                        <Text style={styles.codeText}>Send</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Verification Code</Text>
                <TextInput
                style={styles.codeInput}
                placeholder="Verification Code"
                placeholderTextColor={"#999"}
                value={code}
                onChangeText={setCode}
                />
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
        justifyContent: "center",
        padding: 20
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
        marginBottom: 6
    },
    emailInput: {
        backgroundColor: "#fff",
        borderRadius: 5,
        paddingHorizontal: 12,
        height: 40,
        textAlignVertical: "center",
        width: 295,
        marginRight: 12,
    },
    codeBtn: {
        backgroundColor: "#fff",
        borderRadius: 5,
        height: 40,
        paddingHorizontal: 12,
        justifyContent: "center",
        width: 87
    },
    codeText: {
        color: "#A45EE5",
        fontWeight: "600",
        fontSize: 16,
        lineHeight: 20,
        textAlign: "center",
        includeFontPadding: false,
        textAlignVertical: "center",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16
    },
    codeInput: {
        backgroundColor: "#fff",
        borderRadius: 5,
        height: 40,
        paddingHorizontal: 12,
        textAlignVertical: "center",
        
    }
})