import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useOrientation } from "../../hooks/useOrientation";

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  hasError?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChangeText,
  placeholder,
  hasError = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { colors } = useTheme();
  const { isLandscape: isLand, isTablet: isTab } = useOrientation();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: hasError ? "#ef4444" : colors.border,
        borderRadius: isLand && isTab ? 12 : 8,
        paddingHorizontal: 10,
      }}
    >
      <TextInput
        style={{
          flex: 1,
          paddingVertical: isLand && isTab ? 14 : 10,
          color: colors.text,
          fontSize: isLand && isTab ? 16 : 14,
        }}
        placeholder={placeholder || "Password"}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={!showPassword}
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
        {showPassword ? (
          <EyeOff color={colors.textSecondary} size={isLand && isTab ? 24 : 20} />
        ) : (
          <Eye color={colors.textSecondary} size={isLand && isTab ? 24 : 20} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PasswordInput;
