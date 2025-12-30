import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from "react-native";
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from "react-native-reanimated";

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  icon: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  activeOpacity?: number;
  gradientColors?: [string, string];
}

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  icon,
  style,
  titleStyle,
  activeOpacity = 0.8,
  gradientColors = ["#8b5cf6", "#6d28d9"], // Default purple gradient
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(activeOpacity, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { duration: 100 });
  };

  // Extract background color from style prop or use default
  const backgroundColor = (style as ViewStyle)?.backgroundColor || gradientColors[0];

  return (
    <Animated.View style={[animatedStyle, { borderRadius: 16, overflow: 'hidden' }]}>
      <TouchableOpacity
        style={[styles.button, style, { backgroundColor }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.contentContainer}>
          {icon}
          <Text style={[styles.buttonText, titleStyle]}>{title}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});

export default GradientButton;