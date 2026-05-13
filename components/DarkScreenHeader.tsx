import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { icons } from "@/constants/icons";

interface DarkScreenHeaderProps {
    title: string;
    onBackPress?: () => void;
    onActionPress?: () => void;
}

const iconTint = "#081126";

const DarkScreenHeader = ({
    title,
    onBackPress,
    onActionPress,
}: DarkScreenHeaderProps) => {
    const router = useRouter();

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
            return;
        }

        router.navigate("/(tabs)");
    };

    const handleActionPress = () => {
        if (onActionPress) {
            onActionPress();
            return;
        }

        router.navigate("/(tabs)/settings");
    };

    return (
        <View className="dark-screen-header">
            <Pressable
                accessibilityRole="button"
                className="dark-screen-header-button"
                onPress={handleBackPress}
            >
                <Image
                    source={icons.back}
                    resizeMode="contain"
                    className="dark-screen-header-icon"
                    style={{ tintColor: iconTint }}
                />
            </Pressable>

            <Text className="dark-screen-header-title">{title}</Text>

            <Pressable
                accessibilityRole="button"
                className="dark-screen-header-button"
                onPress={handleActionPress}
            >
                <Image
                    source={icons.menu}
                    resizeMode="contain"
                    className="dark-screen-header-icon"
                    style={{ tintColor: iconTint }}
                />
            </Pressable>
        </View>
    );
};

export default DarkScreenHeader;
