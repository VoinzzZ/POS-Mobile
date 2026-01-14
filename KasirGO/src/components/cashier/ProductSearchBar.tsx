import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Search } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

interface ProductSearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export default function ProductSearchBar({ value, onChangeText, placeholder = "Search products..." }: ProductSearchBarProps) {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={placeholder}
                placeholderTextColor={colors.textSecondary}
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 20,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    input: {
        flex: 1,
        fontSize: 14,
    },
});
