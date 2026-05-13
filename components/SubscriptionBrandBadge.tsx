import { Image, Text, View } from "react-native";
import { clsx } from "clsx";

interface SubscriptionBrandBadgeProps {
    icon: Subscription["icon"];
    name: string;
    tone?: "cream" | "soft";
}

const SubscriptionBrandBadge = ({
    icon,
    name,
    tone = "cream",
}: SubscriptionBrandBadgeProps) => {
    const isGrammarly = name.toLowerCase() === "grammarly";

    return (
        <View
            className={clsx(
                "subscription-brand-badge",
                tone === "cream" ? "subscription-brand-badge-cream" : "subscription-brand-badge-soft"
            )}
        >
            {isGrammarly ? (
                <View className="subscription-brand-monogram">
                    <Text className="subscription-brand-monogram-text">G</Text>
                </View>
            ) : (
                <Image source={icon} resizeMode="contain" className="subscription-brand-image" />
            )}
        </View>
    );
};

export default SubscriptionBrandBadge;
