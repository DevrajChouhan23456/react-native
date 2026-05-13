import "@/global.css";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { styled } from "nativewind";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import DarkScreenHeader from "@/components/DarkScreenHeader";
import InsightBarChart from "@/components/InsightBarChart";
import InsightHistoryCard from "@/components/InsightHistoryCard";
import { components, spacing } from "@/constants/theme";
import {
    buildInsightBars,
    getCurrentExpensesTotal,
    getExpenseChangePercentage,
    isSubscriptionActive,
} from "@/lib/subscription-insights";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { formatCurrency } from "@/lib/utils";

const SafeAreaView = styled(RNSafeAreaView);
const tabBar = components.tabBar;
const preferredHistoryOrder = ["Claude", "Canva", "Grammarly"];

export default function InsightScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { subscriptions } = useSubscriptionStore();

    const contentBottomPadding = tabBar.height + Math.max(insets.bottom, tabBar.horizontalInset) + spacing[6];
    const insightBars = useMemo(() => buildInsightBars(subscriptions), [subscriptions]);
    const totalExpenses = useMemo(() => getCurrentExpensesTotal(subscriptions), [subscriptions]);
    const expenseChange = useMemo(() => getExpenseChangePercentage(subscriptions), [subscriptions]);
    const expenseChangeLabel = `${expenseChange > 0 ? "+" : ""}${expenseChange}%`;
    const historySubscriptions = useMemo(() => {
        const activeSubscriptions = subscriptions.filter(isSubscriptionActive);
        const orderedPreferredSubscriptions = preferredHistoryOrder
            .map((name) => activeSubscriptions.find((subscription) => subscription.name === name))
            .filter((subscription): subscription is Subscription => Boolean(subscription));

        const remainingSubscriptions = activeSubscriptions.filter(
            (subscription) =>
                !orderedPreferredSubscriptions.some((preferred) => preferred.id === subscription.id)
        );

        return [...orderedPreferredSubscriptions, ...remainingSubscriptions].slice(0, 3);
    }, [subscriptions]);

    return (
        <SafeAreaView className="insight-screen">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: contentBottomPadding }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-5 pt-2">
                    <DarkScreenHeader title="Monthly Insights" />

                    <View className="insight-section-row">
                        <Text className="insight-section-title">Upcoming</Text>
                        <Pressable
                            accessibilityRole="button"
                            className="insight-section-action"
                            onPress={() => router.navigate("/(tabs)/subscriptions")}
                        >
                            <Text className="insight-section-action-text">View all</Text>
                        </Pressable>
                    </View>

                    <InsightBarChart data={insightBars} />

                    <View className="insight-expense-card">
                        <View>
                            <Text className="insight-expense-title">Expenses</Text>
                            <Text className="insight-expense-month">
                                {dayjs().format("MMMM YYYY")}
                            </Text>
                        </View>

                        <View className="items-end">
                            <Text className="insight-expense-value">
                                -{formatCurrency(totalExpenses)}
                            </Text>
                            <Text className="insight-expense-change">{expenseChangeLabel}</Text>
                        </View>
                    </View>

                    <View className="insight-section-row insight-history-row">
                        <Text className="insight-section-title">History</Text>
                        <Pressable
                            accessibilityRole="button"
                            className="insight-section-action"
                            onPress={() => router.navigate("/(tabs)/subscriptions")}
                        >
                            <Text className="insight-section-action-text">View all</Text>
                        </Pressable>
                    </View>

                    <View className="insight-history-list">
                        {historySubscriptions.map((subscription) => (
                            <InsightHistoryCard key={subscription.id} subscription={subscription} />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
