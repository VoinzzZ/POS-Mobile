import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Calendar, TrendingUp } from "lucide-react-native";
import Svg, { Line, Circle, Text as SvgText, Rect } from "react-native-svg";
import { useTheme } from "../../context/ThemeContext";

interface RevenueChartProps {
  containerStyle?: any;
}

type ViewMode = "weekly" | "yearly";

const RevenueChart: React.FC<RevenueChartProps> = ({ containerStyle }) => {
  const { colors } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");

  // Dummy data untuk weekly view (7 hari terakhir)
  const weeklyData = [
    { label: "Mon", value: 2400000 },
    { label: "Tue", value: 1800000 },
    { label: "Wed", value: 3200000 },
    { label: "Thu", value: 2900000 },
    { label: "Fri", value: 3800000 },
    { label: "Sat", value: 4200000 },
    { label: "Sun", value: 3500000 },
  ];

  // Dummy data untuk yearly view (12 bulan)
  const yearlyData = [
    { label: "Jan", value: 45000000 },
    { label: "Feb", value: 52000000 },
    { label: "Mar", value: 48000000 },
    { label: "Apr", value: 61000000 },
    { label: "May", value: 55000000 },
    { label: "Jun", value: 67000000 },
    { label: "Jul", value: 72000000 },
    { label: "Aug", value: 68000000 },
    { label: "Sep", value: 74000000 },
    { label: "Oct", value: 79000000 },
    { label: "Nov", value: 82000000 },
    { label: "Dec", value: 780000 },
  ];

  const currentData = viewMode === "weekly" ? weeklyData : yearlyData;
  const maxValue = Math.max(...currentData.map((d) => d.value));
  const minValue = Math.min(...currentData.map((d) => d.value));

  const chartWidth = Dimensions.get("window").width - 80;
  const chartHeight = 200;
  const paddingTop = 20;
  const paddingBottom = 30;
  const paddingLeft = 10;
  const paddingRight = 10;

  const graphHeight = chartHeight - paddingTop - paddingBottom;
  const graphWidth = chartWidth - paddingLeft - paddingRight;

  const getY = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue);
    return paddingTop + graphHeight * (1 - normalized);
  };

  const getX = (index: number) => {
    const spacing = graphWidth / (currentData.length - 1);
    return paddingLeft + index * spacing;
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const totalRevenue = currentData.reduce((sum, item) => sum + item.value, 0);
  const averageRevenue = totalRevenue / currentData.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }, containerStyle]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <TrendingUp size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Revenue Overview</Text>
        </View>
        <View style={[styles.toggleContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[
              styles.toggleButton, 
              viewMode === "weekly" && { backgroundColor: colors.primary }
            ]}
            onPress={() => setViewMode("weekly")}
          >
            <Text style={[
              styles.toggleText, 
              { color: viewMode === "weekly" ? "#ffffff" : colors.textSecondary }
            ]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton, 
              viewMode === "yearly" && { backgroundColor: colors.primary }
            ]}
            onPress={() => setViewMode("yearly")}
          >
            <Text style={[
              styles.toggleText, 
              { color: viewMode === "yearly" ? "#ffffff" : colors.textSecondary }
            ]}>
              Year
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Stats */}
      <View style={[styles.summaryContainer, { backgroundColor: colors.background }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>Rp {formatValue(totalRevenue)}</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Average</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>Rp {formatValue(averageRevenue)}</Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = paddingTop + graphHeight * (1 - ratio);
            return (
              <Line
                key={index}
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke={colors.border}
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            );
          })}

          {/* Line Graph */}
          {currentData.map((point, index) => {
            if (index === currentData.length - 1) return null;
            const x1 = getX(index);
            const y1 = getY(point.value);
            const x2 = getX(index + 1);
            const y2 = getY(currentData[index + 1].value);

            return (
              <Line
                key={`line-${index}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={colors.primary}
                strokeWidth="3"
              />
            );
          })}

          {/* Data Points */}
          {currentData.map((point, index) => {
            const x = getX(index);
            const y = getY(point.value);

            return (
              <React.Fragment key={`point-${index}`}>
                <Circle cx={x} cy={y} r="6" fill={colors.background} stroke={colors.primary} strokeWidth="3" />
                <Circle cx={x} cy={y} r="3" fill={colors.primary} />
              </React.Fragment>
            );
          })}

          {/* Labels */}
          {currentData.map((point, index) => {
            const x = getX(index);
            const y = chartHeight - 10;

            return (
              <SvgText
                key={`label-${index}`}
                x={x}
                y={y}
                fill={colors.textSecondary}
                fontSize="10"
                fontWeight="500"
                textAnchor="middle"
              >
                {point.label}
              </SvgText>
            );
          })}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Calendar size={14} color={colors.textSecondary} />
        <Text style={[styles.legendText, { color: colors.textSecondary }]}>
          {viewMode === "weekly" 
            ? "Last 7 days daily revenue" 
            : "Monthly revenue for current year"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  summaryContainer: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    marginHorizontal: 12,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  legendText: {
    fontSize: 11,
  },
});

export default RevenueChart;
