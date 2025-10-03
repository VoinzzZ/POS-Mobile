import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

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

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: hasError ? "#ef4444" : colors.border,
        borderRadius: 8,
        paddingHorizontal: 10,
      }}
    >
      <TextInput
        style={{ flex: 1, paddingVertical: 10, color: colors.text }}
        placeholder={placeholder || "Password"}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={!showPassword}
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
        {showPassword ? (
          <EyeOff color={colors.textSecondary} size={20} />
        ) : (
          <Eye color={colors.textSecondary} size={20} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PasswordInput;
