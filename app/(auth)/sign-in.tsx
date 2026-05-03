import React from 'react';
import { View, Text } from 'react-native';
import {Link} from "expo-router";

const signIn = () => {
  return (
    <View>
      <Text>Sign In</Text>
        <Text>Login Account</Text>
        <Link href="/">Go Back</Link>
    </View>
  );
};

export default signIn;