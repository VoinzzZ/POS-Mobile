import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Tag } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import {
  Category,
  Brand,
  getAllCategories,
  getAllBrands,
} from "../../api/product";

interface BrandFilterProps {
  onCategoryChange?: (categoryId: number | null, categoryName: string, categories?: Category[]) => void;
  onBrandFilter?: (brandId: number | null, brandName: string) => void;
  selectedCategoryId?: number | null;
}

export default function BrandFilter({ 
  onCategoryChange,
  onBrandFilter,
  selectedCategoryId: externalSelectedCategoryId
}: BrandFilterProps) {
  const { colors } = useTheme();

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const selectedCategoryId = externalSelectedCategoryId !== undefined ? externalSelectedCategoryId : null;

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
        // Send categories to parent on initial load
        if (onCategoryChange) {
          onCategoryChange(null, "Semua Produk", categoriesRes.data);
        }
      }
      
      if (brandsRes.success && brandsRes.data) {
        setBrands(brandsRes.data);
        setFilteredBrands(brandsRes.data);
      }
    } catch (error) {
      console.error("Error loading categories/brands:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter brands when category changes
  useEffect(() => {
    if (selectedCategoryId === null) {
      // Show all brands
      setFilteredBrands(brands);
    } else {
      // Filter brands by selected category
      const filtered = brands.filter(brand => brand.categoryId === selectedCategoryId);
      setFilteredBrands(filtered);
    }
  }, [selectedCategoryId, brands]);
  
  // Reset brand selection when category changes (separate effect)  
  const resetBrandSelection = () => {
    setSelectedBrandId(null);
    if (onBrandFilter) {
      onBrandFilter(null, "Semua Brand");
    }
  };
  
  useEffect(() => {
    resetBrandSelection();
  }, [selectedCategoryId]);

  const handleCategoryPress = (category: Category | null) => {
    const categoryId = category?.id || null;
    const categoryName = category?.name || "Semua Produk";
    
    if (onCategoryChange) {
      onCategoryChange(categoryId, categoryName, categories);
    }
  };

  const handleBrandPress = (brand: Brand | null) => {
    const brandId = brand?.id || null;
    const brandName = brand?.name || "Semua Brand";
    
    setSelectedBrandId(brandId);
    
    if (onBrandFilter) {
      onBrandFilter(brandId, brandName);
    }
  };


  const renderBrandChip = (brand: Brand | null, isAll: boolean = false) => {
    const isSelected = isAll ? selectedBrandId === null : selectedBrandId === brand?.id;
    
    return (
      <TouchableOpacity
        key={isAll ? "all-brands" : brand!.id}
        style={[
          styles.brandChip, 
          { 
            backgroundColor: isSelected ? colors.primary : colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
          }
        ]}
        onPress={() => handleBrandPress(brand)}
        activeOpacity={0.7}
      >
        <Tag 
          size={12} 
          color={isSelected ? "#ffffff" : colors.primary} 
        />
        <Text 
          style={[
            styles.brandChipText, 
            { color: isSelected ? "#ffffff" : colors.text }
          ]} 
          numberOfLines={1}
        >
          {isAll ? "Semua" : brand!.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Memuat kategori dan brand...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Brand Filter Section - Only show if there are brands for selected category */}
      {filteredBrands.length > 0 && (
        <View style={styles.brandFilterSection}>
          <Text style={[styles.brandFilterLabel, { color: colors.text }]}>
            Filter Brand
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.brandScrollContainer}
          >
            {/* All Brands Chip */}
            {renderBrandChip(null, true)}
            
            {/* Individual Brand Chips */}
            {filteredBrands.map((brand) => renderBrandChip(brand))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // No special styling needed
  },
  brandFilterSection: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  brandFilterLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  brandScrollContainer: {
    gap: 8,
    flexDirection: "row",
  },
  brandChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 70,
    gap: 4,
  },
  brandChipText: {
    fontSize: 11,
    fontWeight: "500",
  },
  emptyBrandSection: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  emptyBrandText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  loadingContainer: {
    padding: 30,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    marginTop: 8,
  },
});
