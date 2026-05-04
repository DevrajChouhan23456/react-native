import React from 'react';
import {  Text } from 'react-native';
import {Link, useLocalSearchParams} from "expo-router";
import { SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";
const SafeAreaView = styled(RNSafeAreaView);

const SubscriptDetails = () => {
    const {id} = useLocalSearchParams<{id:string}>();
  return (
    <SafeAreaView className={"flex-1 bg-background p-5"}>
      <Text>SubscriptDetails : {id}</Text>
        <Link href="/">GO Back</Link>
    </SafeAreaView>
  );
};

export default SubscriptDetails;