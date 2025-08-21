import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

type Props = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default function PasswordInput({ label = "Password", value, onChangeText, placeholder = "Password" }: Props) {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.container}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.wrap}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          secureTextEntry={!show}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={"#999"}
        />
        <TouchableOpacity onPress={() => setShow(s => !s)} hitSlop={10}>
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  label: { color: "#fff", fontWeight: "600", marginBottom: 6 },
  wrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 5, paddingHorizontal: 12 },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, color: "#333" }
});
