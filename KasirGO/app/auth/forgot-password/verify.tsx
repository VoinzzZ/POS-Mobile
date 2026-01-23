import React from "react";
import { View, StyleSheet, ImageBackground } from "react-native";
import ForgotPasswordVerifyForm from "../../../src/components/auth/ForgotPasswordVerifyForm";
import { useTheme } from "../../../src/context/ThemeContext";
import ThemeToggle from "../../../src/components/shared/ThemeToggle";
import { useOrientation } from "../../../src/hooks/useOrientation";

const ForgotPasswordVerifyWrapper = () => {
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
                    <ForgotPasswordVerifyForm />
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

export default ForgotPasswordVerifyWrapper;
