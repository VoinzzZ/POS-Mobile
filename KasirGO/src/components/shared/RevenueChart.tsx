import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { Calendar, TrendingUp } from "lucide-react-native";
import Svg, { Line, Circle, Text as SvgText } from "react-native-svg";
import { useTheme } from "../../context/ThemeContext";
import { getRevenueReport } from "../../api/financial";

interface RevenueChartProps {
  containerStyle?: any;
}

type ViewMode = "weekly" | "yearly";

const RevenueChart: React.FC<RevenueChartProps> = ({ containerStyle }) => {
  const { colors } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  useEffect(() => {
    setSelectedPointIndex(null);
    fetchRevenueData();
  }, [viewMode]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const groupBy = viewMode === "weekly" ? "day" : "month";

      const now = new Date();
      let startDate: Date;

      if (viewMode === "weekly") {
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate = new Date(now);
        startDate.setDate(now.getDate() + mondayOffset);
      } else {
        startDate = new Date(now.getFullYear(), 0, 1);
      }

      const formatLocalDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const params: {
        group_by: 'day' | 'month';
        start_date: string;
        end_date: string;
      } = {
        group_by: groupBy,
        start_date: formatLocalDate(startDate),
        end_date: formatLocalDate(now),
      };

      console.log('Fetching revenue with params:', params);
      const response = await getRevenueReport(params);

      console.log('Revenue report response:', response);
      console.log('Revenue data:', response.data);

      if (response.success && response.data && response.data.length > 0) {
        const processedData = viewMode === "weekly"
          ? processWeeklyData(response.data)
          : processMonthlyData(response.data);
        console.log('Using processed data:', processedData);
        setRevenueData(processedData);
      } else {
        console.log('No real data, using fallback');
        const fallbackData = viewMode === "weekly"
          ? generateWeeklyFallback()
          : generateMonthlyFallback();
        setRevenueData(fallbackData);
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      const fallbackData = viewMode === "weekly"
        ? generateWeeklyFallback()
        : generateMonthlyFallback();
      setRevenueData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const processWeeklyData = (apiData: any[]) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const weekData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + mondayOffset + i);
      const dateStr = date.toISOString().split('T')[0];

      const dayData = apiData.find(item => item.period === dateStr);
      weekData.push(dayData || {
        period: dateStr,
        revenue: 0,
        cost: 0,
        profit: 0,
        transactions: 0,
        profitMargin: 0,
      });
    }
    return weekData;
  };

  const processMonthlyData = (apiData: any[]) => {
    const currentYear = new Date().getFullYear();
    const monthData = [];

    for (let i = 1; i <= 12; i++) {
      const monthStr = `${currentYear}-${String(i).padStart(2, '0')}`;
      const monthItem = apiData.find(item => item.period === monthStr);
      monthData.push(monthItem || {
        period: monthStr,
        revenue: 0,
        cost: 0,
        profit: 0,
        transactions: 0,
        profitMargin: 0,
      });
    }
    return monthData;
  };

  const generateWeeklyFallback = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    return days.map((day, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + mondayOffset + index);
      return {
        period: date.toISOString().split('T')[0],
        revenue: 0,
        cost: 0,
        profit: 0,
        transactions: 0,
        profitMargin: 0,
      };
    });
  };

  const generateMonthlyFallback = () => {
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    return months.map((month, index) => ({
      period: `${currentYear}-${String(index + 1).padStart(2, '0')}`,
      revenue: 0,
      cost: 0,
      profit: 0,
      transactions: 0,
      profitMargin: 0,
    }));
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }, containerStyle]}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={[styles.skeletonIcon, { backgroundColor: colors.background }]} />
            <View style={[styles.skeletonText, styles.skeletonTitle, { backgroundColor: colors.background }]} />
          </View>
          <View style={[styles.toggleContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.toggleButton, styles.skeletonToggle, { backgroundColor: colors.background }]} />
            <View style={[styles.toggleButton, styles.skeletonToggle, { backgroundColor: colors.background }]} />
          </View>
        </View>

        <View style={styles.chartContainer}>
          <View style={[styles.skeletonChart, { backgroundColor: colors.background }]}>
            {[60, 80, 50, 90, 70].map((height, index) => (
              <View key={index} style={[styles.skeletonBar, { backgroundColor: colors.border, height: height }]} />
            ))}
          </View>
        </View>

        <View style={styles.legendContainer}>
          <View style={[styles.skeletonIcon, { backgroundColor: colors.background, width: 14, height: 14 }]} />
          <View style={[styles.skeletonText, styles.skeletonSmall, { backgroundColor: colors.background, width: 150 }]} />
        </View>
      </View>
    );
  }

  const chartData = revenueData.map((item) => {
    let label = "";
    if (viewMode === "weekly") {
      const dateStr = item.period;
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay();
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      label = days[dayOfWeek];
    } else {
      const monthNum = parseInt(item.period.split("-")[1]);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
      label = months[monthNum - 1] || item.period;
    }

    return {
      label,
      value: item.revenue || 0,
    };
  });

  const maxValue = Math.max(...chartData.map((d) => d.value), 1); // Minimum 1 to avoid division by zero
  const minValue = Math.min(...chartData.map((d) => d.value), 0);

  const chartWidth = Dimensions.get("window").width - 80;
  const chartHeight = 200;
  const paddingTop = 20;
  const paddingBottom = 30;
  const paddingLeft = 50;
  const paddingRight = 10;

  const graphHeight = chartHeight - paddingTop - paddingBottom;
  const graphWidth = chartWidth - paddingLeft - paddingRight;

  const getY = (value: number) => {
    if (maxValue === minValue || maxValue === 0) {
      return paddingTop + graphHeight / 2;
    }
    const normalized = (value - minValue) / (maxValue - minValue);
    return paddingTop + graphHeight * (1 - normalized);
  };

  const getX = (index: number) => {
    const spacing = graphWidth / Math.max(chartData.length - 1, 1);
    return paddingLeft + index * spacing;
  };

  const formatCurrencyCompact = (amount: number): string => {
    if (amount >= 1000000000) {
      return `Rp ${(amount / 1000000000).toFixed(1)}M`;
    } else if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}jt`;
    } else if (amount >= 1000) {
      return `Rp ${(amount / 1000).toFixed(0)}rb`;
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("IDR", "Rp");
  };

  const totalRevenue = chartData.reduce((sum, item) => sum + item.value, 0);
  const averageRevenue = chartData.length > 0 ? totalRevenue / chartData.length : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }, containerStyle]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <TrendingUp size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Pendapatan</Text>
        </View>
        <View style={[styles.toggleContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "weekly" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setViewMode("weekly")}
          >
            <Text
              style={[
                styles.toggleText,
                { color: viewMode === "weekly" ? "#ffffff" : colors.textSecondary },
              ]}
            >
              Minggu
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "yearly" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setViewMode("yearly")}
          >
            <Text
              style={[
                styles.toggleText,
                { color: viewMode === "yearly" ? "#ffffff" : colors.textSecondary },
              ]}
            >
              Tahun
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Y-axis Labels */}
          {[1, 0.75, 0.5, 0.25, 0].map((ratio, index) => {
            const y = paddingTop + graphHeight * (1 - ratio);
            const value = minValue + (maxValue - minValue) * ratio;
            let label = '';
            if (value >= 1000000) {
              label = `${(value / 1000000).toFixed(1)}jt`;
            } else if (value >= 1000) {
              label = `${(value / 1000).toFixed(0)}rb`;
            } else {
              label = `${Math.round(value)}`;
            }
            return (
              <SvgText
                key={`y-${index}`}
                x={5}
                y={y + 4}
                fill={colors.textSecondary}
                fontSize="10"
                fontWeight="500"
              >
                {label}
              </SvgText>
            );
          })}

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
          {chartData.map((point, index) => {
            if (index === chartData.length - 1) return null;
            const x1 = getX(index);
            const y1 = getY(point.value);
            const x2 = getX(index + 1);
            const y2 = getY(chartData[index + 1].value);

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
          {chartData.map((point, index) => {
            const x = getX(index);
            const y = getY(point.value);
            const isSelected = selectedPointIndex === index;

            return (
              <React.Fragment key={`point-${index}`}>
                <Circle
                  cx={x}
                  cy={y}
                  r={isSelected ? "8" : "6"}
                  fill={colors.background}
                  stroke={colors.primary}
                  strokeWidth={isSelected ? "4" : "3"}
                />
                <Circle cx={x} cy={y} r={isSelected ? "4" : "3"} fill={colors.primary} />
              </React.Fragment>
            );
          })}

          {/* Labels */}
          {chartData.map((point, index) => {
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

        {/* Touchable Overlay for Data Points */}
        {chartData.map((point, index) => {
          const x = getX(index);
          const y = getY(point.value);

          return (
            <TouchableOpacity
              key={`touch-${index}`}
              style={[
                styles.touchablePoint,
                {
                  left: x - 20,
                  top: y - 20,
                },
              ]}
              onPress={() => {
                setSelectedPointIndex(selectedPointIndex === index ? null : index);
              }}
              activeOpacity={0.7}
            />
          );
        })}

        {/* Tooltip for Selected Point */}
        {selectedPointIndex !== null && chartData[selectedPointIndex] && (
          <View
            style={[
              styles.tooltip,
              {
                left: getX(selectedPointIndex) - 70,
                top: getY(chartData[selectedPointIndex].value) - 60,
                backgroundColor: colors.primary,
              },
            ]}
          >
            <Text style={[styles.tooltipLabel, { color: '#ffffff' }]}>
              {chartData[selectedPointIndex].label}
            </Text>
            <Text style={[styles.tooltipValue, { color: '#ffffff' }]}>
              {formatCurrency(chartData[selectedPointIndex].value)}
            </Text>
            <View style={[styles.tooltipArrow, { borderTopColor: colors.primary }]} />
          </View>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Calendar size={14} color={colors.textSecondary} />
        <Text style={[styles.legendText, { color: colors.textSecondary }]}>
          {viewMode === "weekly"
            ? "Pendapatan harian 7 hari terakhir"
            : "Pendapatan bulanan tahun ini"}
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
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
    gap: 4,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: "700",
  },
  summaryContainer: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 14,
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
  skeletonIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    opacity: 0.3,
  },
  skeletonText: {
    height: 12,
    borderRadius: 4,
    opacity: 0.3,
  },
  skeletonTitle: {
    width: 80,
  },
  skeletonSmall: {
    width: 60,
    height: 10,
  },
  skeletonMedium: {
    width: 100,
    height: 14,
  },
  skeletonToggle: {
    width: 50,
    height: 28,
    opacity: 0.3,
  },
  skeletonChart: {
    width: Dimensions.get("window").width - 80,
    height: 200,
    borderRadius: 8,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  skeletonBar: {
    width: 30,
    borderRadius: 4,
    opacity: 0.3,
  },
  touchablePoint: {
    position: 'absolute',
    width: 40,
    height: 40,
    zIndex: 10,
  },
  tooltip: {
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  tooltipLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  tooltipValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

export default RevenueChart;
