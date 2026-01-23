import React from "react";
import { View, StyleSheet, ImageBackground } from "react-native";
import ForgotPasswordResetForm from "../../../src/components/auth/ForgotPasswordResetForm";
import { useTheme } from "../../../src/context/ThemeContext";
import ThemeToggle from "../../../src/components/shared/ThemeToggle";
import { useOrientation } from "../../../src/hooks/useOrientation";

const ForgotPasswordResetWrapper = () => {
    const { theme } = useTheme();
    const { isLandscape: isLand, isTablet: isTab, width, height } = useOrientation();

    const backgroundAsset = theme === "light"
        ? require("../../../assets/images/backgroundAuthLight.png")
        : require("../../../assets/images/backgroundAuth.png");

    return (
        <View style={styles.container}>
            <ImageBackground
                source={backgroundAsset}
                resizeMode={isLand && isTab ? "cover" : "cover"}
                style={[styles.background, isLand && isTab ? { width: width, height: height } : {}]}
            >
                <ThemeToggle />
                <View style={[styles.overlay, isLand && isTab ? styles.landscapeOverlay : {}]}>
                    <ForgotPasswordResetForm />
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    landscapeOverlay: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
});

export default ForgotPasswordResetWrapper;
