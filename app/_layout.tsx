import {SplashScreen, Stack} from "expo-router";
import "@/global.css"
import {useFonts} from "expo-font";
import {useEffect} from "react";

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        "sans-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
        "sans-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
        "sans-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
        "sans-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
        "sans-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
        "sans-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }

    }, [fontsLoaded])

    if (!fontsLoaded) return null;

    return <Stack screenOptions={{headerShown: false}}/>;
}
