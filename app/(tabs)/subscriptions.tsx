import "@/global.css";
import React, {useState} from 'react';
import {FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView as RNSafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import {styled} from "nativewind";
import SubscriptionCard from "@/components/SubscriptionCard";
import {components, spacing} from "@/constants/theme";
import {useSubscriptions} from "@/contexts/SubscriptionsContext";

const SafeAreaView = styled(RNSafeAreaView);
const StyledTextInput = styled(TextInput);
const tabBar = components.tabBar;

const SubscriptionsScreen = () => {
  const insets = useSafeAreaInsets();
  const {subscriptions} = useSubscriptions();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const bottomInset = Math.max(insets.bottom, tabBar.horizontalInset);
  const listBottomPadding = tabBar.height + bottomInset + spacing[6];

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    if (!normalizedQuery) {
      return true;
    }

    const searchContent = [
      subscription.name,
      subscription.plan,
      subscription.category,
      subscription.paymentMethod,
      subscription.status,
      subscription.billing,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return searchContent.includes(normalizedQuery);
  });

  return (
    <SafeAreaView className={"flex-1 bg-background"}>
      <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? spacing[6] : 0}
      >
        <FlatList
            data={filteredSubscriptions}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => (
                <SubscriptionCard
                    {...item}
                    expanded={expandedSubscriptionId === item.id}
                    onPress={() =>
                        setExpandedSubscriptionId((currentId) =>
                            item.id === currentId ? null : item.id
                        )
                    }
                />
            )}
            automaticallyAdjustKeyboardInsets
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View className="h-4"/>}
            extraData={expandedSubscriptionId}
            ListHeaderComponent={
              <View className="subscriptions-hero">
                <Text className="subscriptions-title">All subscriptions</Text>

                <View className="subscriptions-search-row">
                  <StyledTextInput
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search name, plan, category, or payment"
                      placeholderTextColor="rgba(0, 0, 0, 0.45)"
                      className="subscriptions-search-input"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="search"
                      clearButtonMode="while-editing"
                  />

                  {normalizedQuery ? (
                      <TouchableOpacity
                          className="subscriptions-search-clear"
                          onPress={() => {
                            setSearchQuery("");
                            setExpandedSubscriptionId(null);
                          }}
                      >
                        <Text className="subscriptions-search-clear-text">Clear</Text>
                      </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            }
            ListEmptyComponent={
              <View className="subscriptions-empty-state">
                <Text className="subscriptions-empty-title">No subscriptions found</Text>
                <Text className="subscriptions-empty-copy">
                  Try searching by category, plan, billing cycle, or provider name.
                </Text>
              </View>
            }
            contentContainerStyle={{
              paddingTop: spacing[5],
              paddingHorizontal: spacing[5],
              paddingBottom: listBottomPadding,
            }}
            scrollIndicatorInsets={{bottom: listBottomPadding}}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SubscriptionsScreen;
