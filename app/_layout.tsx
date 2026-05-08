import "@/global.css";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@/lib/clerk";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { View } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        "sans-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
        "sans-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
        "sans-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
        "sans-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
        "sans-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
        "sans-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    });

    if (!fontsLoaded) return null;

    const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

    if (!publishableKey) {
        throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
    }

    return (
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
            <AuthGate />
        </ClerkProvider>
    );
}

function AuthGate() {
    const { isLoaded, isSignedIn } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (!isLoaded) {
            return;
        }

        const inAuthGroup = segments[0] === "(auth)";

        if (!isSignedIn && !inAuthGroup) {
            router.replace("/(auth)/sign-in");
            return;
        }

        if (isSignedIn && inAuthGroup) {
            router.replace("/(tabs)");
        }
    }, [isLoaded, isSignedIn, router, segments]);

    useEffect(() => {
        if (isLoaded) {
            SplashScreen.hideAsync();
        }
    }, [isLoaded]);

    if (!isLoaded) {
        return <View className="flex-1 bg-background" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}
