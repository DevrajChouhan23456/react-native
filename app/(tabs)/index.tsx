import "@/global.css"
import {FlatList, Image, Pressable, Text, View} from "react-native";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";
import {useMemo, useState} from "react";
import images from "@/constants/images";
<<<<<<< HEAD
import {HOME_BALANCE, HOME_USER, UPCOMING_SUBSCRIPTIONS} from "@/constants/data";
=======
import {HOME_BALANCE, HOME_USER} from "@/constants/data";
>>>>>>> ace7d33 (impliment fixes insigt and refine the subscription screen)
import {icons} from "@/constants/icons";
import {formatCurrency} from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpComingSubscriptionCard from "@/components/UpComingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
<<<<<<< HEAD
import {useSubscriptions} from "@/contexts/SubscriptionsContext";
=======
import { buildUpcomingSubscriptions, getNextRenewalDate } from "@/lib/subscription-insights";
import { useSubscriptionStore } from "@/lib/subscription-store";
>>>>>>> ace7d33 (impliment fixes insigt and refine the subscription screen)


const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
    const { subscriptions, addSubscription } = useSubscriptionStore();
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
<<<<<<< HEAD
    const {subscriptions, addSubscription} = useSubscriptions();
=======
>>>>>>> ace7d33 (impliment fixes insigt and refine the subscription screen)
    const [isCreateSubscriptionModalVisible, setIsCreateSubscriptionModalVisible] = useState(false);
    const upcomingSubscriptions = useMemo(
        () => buildUpcomingSubscriptions(subscriptions),
        [subscriptions]
    );
    const nextRenewalDate = useMemo(
        () => getNextRenewalDate(subscriptions) ?? HOME_BALANCE.nextRenewalDate,
        [subscriptions]
    );

    const openCreateSubscriptionModal = () => {
        setIsCreateSubscriptionModalVisible(true);
    };

    const closeCreateSubscriptionModal = () => {
        setIsCreateSubscriptionModalVisible(false);
    };

    const handleCreateSubscription = (subscription: Subscription) => {
        addSubscription(subscription);
        setExpandedSubscriptionId(null);
    };

    return (
        <SafeAreaView className="flex-1 bg-background p-5">


            <FlatList

                ListHeaderComponent={() => <>
                    <View className="home-header">
                        <View className={"home-user"}>
                            <Image source={images.avatar} className={"home-avatar"}/>
                            <Text className={"home-user-name"}>{HOME_USER.name}</Text>
                        </View>
                        <Pressable
                            accessibilityRole="button"
                            onPress={openCreateSubscriptionModal}
                        >
                            <Image source={icons.add} className={"home-add-icon"}/>
                        </Pressable>
                    </View>

                    <View className="home-balance-card">
                        <Text className={"home-balance-label"}>Balance</Text>
                        <Text className={"home-balance-amount"}>{formatCurrency(HOME_BALANCE.amount)}</Text>
                        <Text
                            className={"home-balance-date"}>{dayjs(nextRenewalDate).format('MM/DD')}</Text>
                    </View>

                    <View>
                        <ListHeading title="Upcoming"/>
                        <FlatList data={upcomingSubscriptions}
                                  renderItem={({item}) => (<UpComingSubscriptionCard {...item}/>)}
                                  keyExtractor={(item) => item.id}
                                  horizontal
                                  showsHorizontalScrollIndicator={false}
                                  ListEmptyComponent={<Text className="home-empty-state">No Upcoming Renewable
                                      yet</Text>}

                        />
                    </View>

                    <ListHeading title="All Subscriptions"/>
                </>
                }
                data={subscriptions}
                keyExtractor={(item) => item.id}
                renderItem={({item}) =>
                    (<SubscriptionCard {...item} expanded={expandedSubscriptionId === item.id}
                                       onPress={() => setExpandedSubscriptionId((currentId: string | null) =>
                                           (item.id === currentId ? null : item.id))}
                    />)}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View className="h-4"/>}
                extraData={expandedSubscriptionId}
                ListEmptyComponent={<Text className="home-empty-state">No Subscriptions yet</Text>}
                contentContainerClassName="pb-30"
            ></FlatList>
            <CreateSubscriptionModal
                visible={isCreateSubscriptionModalVisible}
                onClose={closeCreateSubscriptionModal}
                onCreate={handleCreateSubscription}
            />

        </SafeAreaView>
    );


}
