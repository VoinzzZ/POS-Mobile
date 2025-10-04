import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { TabView, TabBar } from "react-native-tab-view";
import { useTheme } from "../../context/ThemeContext";
import {
  Category,
  getAllCategories,
} from "../../api/product";
import ProductsByCategory from "./ProductsByCategory";
import BrandFilter from "./BrandFilter";

interface CategoryTabViewProps {
  selectedBrandId?: number | null;
  selectedBrandName?: string;
  onBrandFilter?: (brandId: number | null, brandName: string) => void;
  onAddToCart?: (product: any) => void;
}

export default function CategoryTabView({
  selectedBrandId,
  selectedBrandName,
  onBrandFilter,
  onAddToCart
}: CategoryTabViewProps) {
  const { colors } = useTheme();
  const layout = useWindowDimensions();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await getAllCategories();
      if (response.success && response.data) {
        setCategories(response.data);
        
        // Create routes with "Semua" as first tab
        const categoryRoutes = [
          { key: 'all', title: 'Semua', categoryId: null },
          ...response.data.map(cat => ({
            key: `cat_${cat.id}`,
            title: cat.name,
            categoryId: cat.id
          }))
        ];
        setRoutes(categoryRoutes);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderScene = ({ route }: any) => {
    const categoryId = route.categoryId;
    const categoryName = route.title;

    return (
      <View style={styles.scene}>
        {/* Brand Filter */}
        <BrandFilter
          selectedCategoryId={categoryId}
          onBrandFilter={onBrandFilter}
        />
        
        {/* Products */}
        <View style={{ flex: 1 }}>
          <ProductsByCategory
            categoryId={categoryId}
            categoryName={categoryName}
            brandId={selectedBrandId}
            brandName={selectedBrandName}
            onAddToCart={onAddToCart}
          />
        </View>
      </View>
    );
  };

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: colors.primary }}
      style={{ backgroundColor: colors.surface }}
      labelStyle={{ 
        fontSize: 14, 
        fontWeight: '600', 
        textTransform: 'none',
        marginHorizontal: 4
      }}
      activeColor={colors.primary}
      inactiveColor={colors.textSecondary}
      scrollEnabled={true}
      tabStyle={{ width: 'auto', minWidth: 90 }}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      swipeEnabled={true}
    />
  );
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
});