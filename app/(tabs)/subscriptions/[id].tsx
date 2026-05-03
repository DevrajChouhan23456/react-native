import React from 'react';
import { View, Text } from 'react-native';
import {Link, useLocalSearchParams} from "expo-router";

const SubscriptDetails = () => {
    const {id} = useLocalSearchParams<{id:string}>();
  return (
    <View>
      <Text>SubscriptDetails : {id}</Text>
        <Link href="/">GO Back</Link>
    </View>
  );
};

export default SubscriptDetails;