import { Text, View } from "react-native";
import SubscriptionBrandBadge from "@/components/SubscriptionBrandBadge";
import { formatInsightHistoryDate } from "@/lib/subscription-insights";
import { formatCurrency } from "@/lib/utils";

interface InsightHistoryCardProps {
    subscription: Subscription;
}

const InsightHistoryCard = ({ subscription }: InsightHistoryCardProps) => {
    return (
        <View className="insight-history-card" style={{ backgroundColor: subscription.color }}>
            <SubscriptionBrandBadge icon={subscription.icon} name={subscription.name} tone="soft" />

            <View className="insight-history-copy">
                <Text className="insight-history-name" numberOfLines={1}>
                    {subscription.name}
                </Text>
                <Text className="insight-history-date">
                    {formatInsightHistoryDate(subscription.renewalDate)}
                </Text>
            </View>

            <View className="insight-history-price-box">
                <Text className="insight-history-price">
                    {formatCurrency(subscription.price, subscription.currency)}
                </Text>
                <Text className="insight-history-billing">
                    per {subscription.billing.toLowerCase()}
                </Text>
            </View>
        </View>
    );
};

export default InsightHistoryCard;
