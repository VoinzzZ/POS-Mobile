import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from "react-native";
import { HelpCircle, MessageCircle, Mail, FileText, Shield, Info, ChevronDown, ChevronUp, ExternalLink } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

type FAQItem = {
    question: string;
    answer: string;
};

export default function HelpSupportCard() {
    const { colors } = useTheme();
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    const faqs: FAQItem[] = [
        {
            question: "Bagaimana cara menambahkan produk baru?",
            answer: "Navigasi ke menu Produk, lalu klik tombol '+' di pojok kanan atas. Isi informasi produk seperti nama, harga, stok, dan kategori, kemudian simpan."
        },
        {
            question: "Bagaimana cara melihat laporan penjualan?",
            answer: "Buka halaman Dashboard atau Analytics. Anda dapat memilih rentang waktu (hari ini, minggu ini, bulan ini, tahun ini) untuk melihat laporan penjualan yang berbeda."
        },
        {
            question: "Bagaimana cara mengelola karyawan?",
            answer: "Navigasi ke menu Store, lalu pilih tab Users. Di sana Anda dapat melihat daftar karyawan, menyetujui pendaftaran baru, atau menghapus akses karyawan."
        },
        {
            question: "Apa yang harus dilakukan jika lupa password?",
            answer: "Di halaman login, klik 'Lupa Password'. Masukkan email Anda dan ikuti instruksi yang dikirim ke email untuk mereset password."
        },
        {
            question: "Bagaimana cara mengubah tema aplikasi?",
            answer: "Buka menu Settings, lalu toggle switch 'Mode Tema' untuk beralih antara mode terang dan gelap."
        },
    ];

    const handleContactSupport = () => {
        Linking.openURL("mailto:support@kasirgo.com");
    };

    const handleOpenWebsite = () => {
        Linking.openURL("https://kasirgo.com");
    };

    const toggleFAQ = (index: number) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <HelpCircle size={24} color={colors.primary} />
                <Text style={[styles.title, { color: colors.text }]}>Bantuan & Dukungan</Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>FAQ</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    {faqs.map((faq, index) => (
                        <View key={index}>
                            <TouchableOpacity
                                style={[styles.faqItem, { borderBottomColor: colors.border }]}
                                onPress={() => toggleFAQ(index)}
                            >
                                <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
                                {expandedFAQ === index ? (
                                    <ChevronUp size={20} color={colors.textSecondary} />
                                ) : (
                                    <ChevronDown size={20} color={colors.textSecondary} />
                                )}
                            </TouchableOpacity>
                            {expandedFAQ === index && (
                                <View style={[styles.faqAnswer, { backgroundColor: colors.background }]}>
                                    <Text style={[styles.faqAnswerText, { color: colors.textSecondary }]}>
                                        {faq.answer}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Hubungi Kami</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <TouchableOpacity
                        style={[styles.contactItem, { borderBottomColor: colors.border }]}
                        onPress={handleContactSupport}
                    >
                        <View style={styles.contactLeft}>
                            <View style={[styles.contactIcon, { backgroundColor: `${colors.primary}20` }]}>
                                <Mail size={20} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.contactTitle, { color: colors.text }]}>Email Support</Text>
                                <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>
                                    support@kasirgo.com
                                </Text>
                            </View>
                        </View>
                        <ExternalLink size={18} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.contactItem, { borderBottomWidth: 0 }]}
                        onPress={handleOpenWebsite}
                    >
                        <View style={styles.contactLeft}>
                            <View style={[styles.contactIcon, { backgroundColor: `${colors.primary}20` }]}>
                                <MessageCircle size={20} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.contactTitle, { color: colors.text }]}>Live Chat</Text>
                                <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>
                                    Chat dengan tim support
                                </Text>
                            </View>
                        </View>
                        <ExternalLink size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Informasi Aplikasi</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={[styles.infoItem, { borderBottomColor: colors.border }]}>
                        <View style={styles.infoLeft}>
                            <Info size={18} color={colors.textSecondary} />
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Versi</Text>
                        </View>
                        <Text style={[styles.infoValue, { color: colors.text }]}>1.0.0</Text>
                    </View>

                    <View style={[styles.infoItem, { borderBottomColor: colors.border }]}>
                        <View style={styles.infoLeft}>
                            <FileText size={18} color={colors.textSecondary} />
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Syarat & Ketentuan</Text>
                        </View>
                        <ExternalLink size={18} color={colors.textSecondary} />
                    </View>

                    <View style={[styles.infoItem, { borderBottomWidth: 0 }]}>
                        <View style={styles.infoLeft}>
                            <Shield size={18} color={colors.textSecondary} />
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Kebijakan Privasi</Text>
                        </View>
                        <ExternalLink size={18} color={colors.textSecondary} />
                    </View>
                </View>
            </View>

            <View style={[styles.aboutCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.aboutTitle, { color: colors.text }]}>KasirGO</Text>
                <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
                    Aplikasi Point of Sale modern untuk membantu mengelola bisnis Anda dengan lebih efisien.
                </Text>
                <Text style={[styles.copyright, { color: colors.textSecondary }]}>
                    © 2026 KasirGO. All rights reserved.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    card: {
        borderRadius: 12,
        overflow: "hidden",
    },
    faqItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
    },
    faqQuestion: {
        flex: 1,
        fontSize: 15,
        fontWeight: "600",
        paddingRight: 12,
    },
    faqAnswer: {
        padding: 16,
        paddingTop: 0,
    },
    faqAnswerText: {
        fontSize: 14,
        lineHeight: 20,
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
    },
    contactLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    contactIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2,
    },
    contactSubtitle: {
        fontSize: 12,
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
    },
    infoLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    infoLabel: {
        fontSize: 15,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: "600",
    },
    aboutCard: {
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
        marginBottom: 20,
    },
    aboutTitle: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 12,
    },
    aboutText: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: "center",
        marginBottom: 16,
    },
    copyright: {
        fontSize: 12,
    },
});
