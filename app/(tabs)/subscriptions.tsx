import "@/global.css";
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { styled } from "nativewind";
import SubscriptionShowcaseCard from "@/components/SubscriptionShowcaseCard";
import DarkScreenHeader from "@/components/DarkScreenHeader";
import { components, spacing } from "@/constants/theme";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { isSubscriptionActive } from "@/lib/subscription-insights";

const SafeAreaView = styled(RNSafeAreaView);
const tabBar = components.tabBar;
const DEFAULT_EXPANDED_SUBSCRIPTION_ID = "github-copilot";

const SubscriptionsScreen = () => {
  const insets = useSafeAreaInsets();
  const { subscriptions, cancelSubscription } = useSubscriptionStore();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const visibleSubscriptions = useMemo(
    () => subscriptions.filter(isSubscriptionActive),
    [subscriptions]
  );

  const listBottomPadding =
    tabBar.height + Math.max(insets.bottom, tabBar.horizontalInset) + spacing[6];

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredSubscriptions = useMemo(
    () => visibleSubscriptions.filter((subscription) => {
      if (!normalizedQuery) {
        return true;
      }
      return subscription.name.toLowerCase().includes(normalizedQuery);
    }),
    [visibleSubscriptions, normalizedQuery]
  );

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

  const showComingSoonMessage = (action: string, name: string) => {
    Alert.alert(
      "Coming Soon",
      `${action} for ${name} will be available soon.`
    );
  };

  return (
    <SafeAreaView className="subscriptions-showcase-screen">
      <FlatList
        data={filteredSubscriptions}
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
        ListHeaderComponent={
          <>
            <View className="px-5 pt-2">
              <DarkScreenHeader title="My Subscriptions" />
            </View>
            <View className="subscriptions-search-wrapper px-5 py-2">
              <TextInput
                placeholder="Search subscriptions..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#536482"
                className="subscriptions-search-field"
              />
            </View>
          </>
        }
        ListHeaderComponentStyle={{ marginBottom: spacing[4] }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-10">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              {filteredSubscriptions.length === 0 && normalizedQuery
                ? "No subscriptions found"
                : "No active subscriptions"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default SubscriptionsScreen;
