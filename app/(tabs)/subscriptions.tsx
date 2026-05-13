import "@/global.css";
import React, {useState} from 'react';
import {FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView as RNSafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import {styled} from "nativewind";
import SubscriptionCard from "@/components/SubscriptionCard";
import {components, spacing} from "@/constants/theme";
import {useSubscriptions} from "@/contexts/SubscriptionsContext";

const SafeAreaView = styled(RNSafeAreaView);
const tabBar = components.tabBar;
const DEFAULT_EXPANDED_SUBSCRIPTION_ID = "github-copilot";

const SubscriptionsScreen = () => {
  const insets = useSafeAreaInsets();
  const {subscriptions} = useSubscriptions();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

    const visibleSubscriptions = useMemo(
        () => subscriptions.filter(isSubscriptionActive),
        [subscriptions]
    );
    const listBottomPadding =
        tabBar.height + Math.max(insets.bottom, tabBar.horizontalInset) + spacing[6];

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    if (!normalizedQuery) {
      return true;
    }

    const handleCancelSubscription = (subscription: Subscription) => {
        Alert.alert(
            "Cancel subscription",
            `Do you want to cancel ${subscription.name}?`,
            [
                { text: "Keep", style: "cancel" },
                {
                    text: "Cancel subscription",
                    style: "destructive",
                    onPress: () => {
                        cancelSubscription(subscription.id);
                        setExpandedSubscriptionId((currentId) =>
                            currentId === subscription.id ? null : currentId
                        );
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView className="subscriptions-showcase-screen">
            <FlatList
                data={visibleSubscriptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SubscriptionShowcaseCard
                        subscription={item}
                        expanded={expandedSubscriptionId === item.id}
                        onPress={() =>
                            setExpandedSubscriptionId((currentId) =>
                                currentId === item.id ? null : item.id
                            )
                        }
                        onManagePress={() => showComingSoonMessage("Manage", item.name)}
                        onChangePress={() => showComingSoonMessage("Change", item.name)}
                        onCancelPress={() => handleCancelSubscription(item)}
                    />
                )}
                ItemSeparatorComponent={() => <View className="h-5" />}
                contentContainerStyle={{
                    paddingHorizontal: spacing[5],
                    paddingTop: spacing[2],
                    paddingBottom: listBottomPadding,
                }}
                ListHeaderComponent={<DarkScreenHeader title="My Subscriptions" />}
                ListHeaderComponentStyle={{ marginBottom: spacing[8] }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}
