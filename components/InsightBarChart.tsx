import { Text, View } from "react-native";
import { clsx } from "clsx";
import type { InsightBarDatum } from "@/lib/subscription-insights";

interface InsightBarChartProps {
    data: InsightBarDatum[];
}

const CHART_MAX = 45;
const CHART_HEIGHT = 180;
const AXIS_LABELS = [45, 35, 25, 5, 0];

const InsightBarChart = ({ data }: InsightBarChartProps) => {
    return (
        <View className="insight-chart-card">
            <View className="insight-chart-inner">
                <View className="insight-chart-axis">
                    {AXIS_LABELS.map((label) => (
                        <Text key={label} className="insight-chart-axis-label">
                            {label}
                        </Text>
                    ))}
                </View>

                <View className="insight-chart-plot">
                    <View className="insight-chart-grid">
                        {AXIS_LABELS.slice(0, -1).map((label) => (
                            <View key={label} className="insight-chart-grid-line" />
                        ))}
                    </View>

                    <View className="insight-chart-bars">
                        {data.map((bar) => {
                            const height = (bar.value / CHART_MAX) * CHART_HEIGHT;

                            return (
                                <View key={bar.label} className="insight-chart-bar-group">
                                    <View className="insight-chart-bar-wrap">
                                        {bar.isHighlighted ? (
                                            <View className="insight-chart-bubble">
                                                <Text className="insight-chart-bubble-text">
                                                    ${bar.value}
                                                </Text>
                                            </View>
                                        ) : null}

                                        <View
                                            className={clsx(
                                                "insight-chart-bar",
                                                bar.isHighlighted && "insight-chart-bar-highlighted"
                                            )}
                                            style={{ height: Math.max(height, 12) }}
                                        />
                                    </View>

                                    <Text className="insight-chart-day">{bar.label}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </View>
        </View>
    );
};

export default InsightBarChart;
