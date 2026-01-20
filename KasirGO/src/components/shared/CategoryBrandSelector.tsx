import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Folder, Tag } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import {
  Category,
  Brand,
  getAllCategories,
  getAllBrands,
} from "../../api/product";

type TabType = "categories" | "brands";

interface CategoryBrandSelectorProps {
  onFilterSelect?: (type: "category" | "brand", id: number, name: string) => void;
  showNavigateOption?: boolean;
}

export default function CategoryBrandSelector({
  onFilterSelect,
  showNavigateOption = true
}: CategoryBrandSelectorProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        getAllCategories(),
        getAllBrands(),
      ]);

      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }

      if (brandsRes.success && brandsRes.data) {
        setBrands(brandsRes.data);
      }
    } catch (error) {
      console.error("Error loading categories/brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (type: "category" | "brand", item: Category | Brand) => {
    const id = type === "category" ? (item as Category).category_id : (item as Brand).brand_id;
    const name = type === "category" ? (item as Category).category_name : (item as Brand).brand_name;

    if (onFilterSelect) {
      // If custom handler provided, use that
      onFilterSelect(type, id, name);
    } else if (showNavigateOption) {
      // Otherwise, navigate to filter screen
      router.push({
        pathname: "/productsByFilter",
        params: {
          type,
          id: id.toString(),
          name: name,
        },
      });
    }
  };

  const renderCategoryTab = (category: Category) => (
    <TouchableOpacity
      key={category.category_id}
      style={[styles.categoryTab, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handleItemPress("category", category)}
      activeOpacity={0.7}
    >
      <Folder size={16} color={colors.primary} />
      <Text style={[styles.categoryTabText, { color: colors.text }]} numberOfLines={1}>
        {category.category_name}
      </Text>
    </TouchableOpacity>
  );

  const renderBrandItem = (brand: Brand) => (
    <TouchableOpacity
      key={brand.brand_id}
      style={[styles.item, { backgroundColor: colors.card }]}
      onPress={() => handleItemPress("brand", brand)}
    >
      <View style={[styles.itemIcon, { backgroundColor: colors.primary + "20" }]}>
        <Tag size={20} color={colors.primary} />
      </View>
      <Text style={[styles.itemName, { color: colors.text }]}>
        {brand.brand_name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "categories" && {
              borderBottomWidth: 2,
              borderBottomColor: colors.primary,
            },
          ]}
          onPress={() => setActiveTab("categories")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === "categories" ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            Kategori
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "brands" && {
              borderBottomWidth: 2,
              borderBottomColor: colors.primary,
            },
          ]}
          onPress={() => setActiveTab("brands")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === "brands" ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            Brand
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : activeTab === "categories" ? (
        // Categories as horizontal tabs
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContainer}
        >
          {categories.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Belum ada kategori
              </Text>
            </View>
          ) : (
            categories.map(renderCategoryTab)
          )}
        </ScrollView>
      ) : (
        // Brands as bubble buttons (horizontal scroll)
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.brandScrollContainer}
        >
          {brands.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Belum ada brand
              </Text>
            </View>
          ) : (
            brands.map(renderBrandItem)
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 16,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  categoryScrollContainer: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: "row",
  },
  brandScrollContainer: {
    paddingHorizontal: 20,
    gap: 12,
    flexDirection: "row",
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 100,
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
});