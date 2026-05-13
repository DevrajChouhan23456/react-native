import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

const ListHeading = ({title, onViewAllPress} : ListHeadingProps) => {
    return (
        <View className={"list-head"}>
            <Text className={"list-title"}>{title}</Text>
            {onViewAllPress ? (
                <TouchableOpacity className={"list-action"} onPress={onViewAllPress}>
                    <Text className={"list-action-text"}>View All</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

export default ListHeading;
