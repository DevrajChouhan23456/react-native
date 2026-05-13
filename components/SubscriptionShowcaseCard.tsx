import { Pressable, Text, View } from "react-native";
import SubscriptionBrandBadge from "@/components/SubscriptionBrandBadge";
import { getMonthsUntilRenewalLabel } from "@/lib/subscription-insights";
import { formatCurrency } from "@/lib/utils";

interface SubscriptionShowcaseCardProps {
    subscription: Subscription;
    expanded: boolean;
    onPress: () => void;
    onManagePress: () => void;
    onChangePress: () => void;
    onCancelPress: () => void;
}

const getMaskedPaymentInfo = (paymentMethod?: string) => {
    const digits = paymentMethod?.match(/(\d{4})$/)?.[1];
    return digits ? `*****${digits}` : "*****0000";
};

const SubscriptionShowcaseCard = ({
    subscription,
    expanded,
    onPress,
    onManagePress,
    onChangePress,
    onCancelPress,
}: SubscriptionShowcaseCardProps) => {
    return (
        <View
            className={
                expanded ? "subscription-showcase-card-expanded" : "subscription-showcase-card"
            }
            style={expanded && subscription.color ? { backgroundColor: subscription.color } : undefined}
        >
            <Pressable className="subscription-showcase-head" onPress={onPress}>
                <SubscriptionBrandBadge icon={subscription.icon} name={subscription.name} />

                <View className="subscription-showcase-copy">
                    <Text className="subscription-showcase-title" numberOfLines={1}>
                        {subscription.name}
                    </Text>
                    <Text className="subscription-showcase-subtitle" numberOfLines={1}>
                        {subscription.plan || subscription.category}
                    </Text>
                </View>

                <View className="subscription-showcase-price-box">
                    <Text className="subscription-showcase-price">
                        {formatCurrency(subscription.price, subscription.currency)}
                    </Text>
                    <Text className="subscription-showcase-term">
                        {getMonthsUntilRenewalLabel(subscription.renewalDate)}
                    </Text>
                </View>
            </Pressable>

            {expanded ? (
                <View className="subscription-showcase-body">
                    <View className="subscription-showcase-row">
                        <Text className="subscription-showcase-label">Payment info:</Text>
                        <View className="subscription-showcase-row-side">
                            <Text className="subscription-showcase-value">
                                {getMaskedPaymentInfo(subscription.paymentMethod)}
                            </Text>
                            <Pressable
                                className="subscription-showcase-small-button"
                                onPress={onManagePress}
                            >
                                <Text className="subscription-showcase-small-button-text">Manage</Text>
                            </Pressable>
                        </View>
                    </View>

                    <View className="subscription-showcase-row">
                        <Text className="subscription-showcase-label">Plan details:</Text>
                        <View className="subscription-showcase-row-side">
                            <Text className="subscription-showcase-value">
                                {subscription.category || subscription.plan || "Premium"}
                            </Text>
                            <Pressable
                                className="subscription-showcase-small-button"
                                onPress={onChangePress}
                            >
                                <Text className="subscription-showcase-small-button-text">Change</Text>
                            </Pressable>
                        </View>
                    </View>

                    <Pressable className="subscription-showcase-cancel" onPress={onCancelPress}>
                        <Text className="subscription-showcase-cancel-text">Cancel Subscription</Text>
                    </Pressable>
                </View>
            ) : null}
        </View>
    );
};

export default SubscriptionShowcaseCard;
