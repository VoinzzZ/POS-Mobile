import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChangeText,
  placeholder,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
      }}
    >
      <TextInput
        style={{ flex: 1, paddingVertical: 10, color: "#fff" }}
        placeholder={placeholder || "Enter password"}
        placeholderTextColor="#aaa"
        secureTextEntry={!showPassword}
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
        {showPassword ? <EyeOff color="white" size={20} /> : <Eye color="white" size={20} />}
      </TouchableOpacity>
    </View>
  );
};

export default PasswordInput;
