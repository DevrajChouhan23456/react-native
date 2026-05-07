import "@/global.css"
import {FlatList, Image, Text, View} from "react-native";
import {Link} from "expo-router";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";
import images from "@/constants/images";
import {HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS} from "@/constants/data";
import {icons} from "@/constants/icons";
import {formatCurrency} from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpComingSubscriptionCard from "@/components/UpComingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";


const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
    // @ts-ignore
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
    return (
        <SafeAreaView className="flex-1 bg-background p-5">


            <FlatList

                ListHeaderComponent={() => <>
                    <View className="home-header">
                        <View className={"home-user"}>
                            <Image source={images.avatar} className={"home-avatar"}/>
                            <Text className={"home-user-name"}>{HOME_USER.name}</Text>
                        </View>
                        <Image source={icons.add} className={"home-add-icon"}/>
                    </View>

                    <View className="home-balance-card">
                        <Text className={"home-balance-label"}>Balance</Text>
                        <Text className={"home-balance-amount"}>{formatCurrency(HOME_BALANCE.amount)}</Text>
                        <Text
                            className={"home-balance-date"}>{dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}</Text>
                    </View>

                    <View>
                        <ListHeading title="Upcoming"/>
                        <FlatList data={UPCOMING_SUBSCRIPTIONS}
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
                data={HOME_SUBSCRIPTIONS}
                keyExtractor={(item) => item.id}
                renderItem={({item}) =>
                    (<SubscriptionCard {...item} expanded={expandedSubscriptionId === item.id}
                                       onPress={() => setExpandedSubscriptionId((currentId: string) =>
                                           (item.id === currentId ? null : item.id))}
                    />)}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View className="h-4"/>}
                extraData={expandedSubscriptionId}
                ListEmptyComponent={<Text className="home-empty-state">No Subscriptions yet</Text>}
                contentContainerClassName="pb-30"
            ></FlatList>

        </SafeAreaView>
    );


}
