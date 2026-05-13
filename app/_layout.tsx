import "@/global.css";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@/lib/clerk";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import { PostHogProvider, usePostHog } from "posthog-react-native";
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

    const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

    const appTree = <AuthGate />;

    const appWithPosthog = posthogApiKey ? (
        <PostHogProvider
            apiKey={posthogApiKey}
            options={{ host: posthogHost }}
            autocapture={{ captureScreens: false, captureTouches: false }}
        >
            {appTree}
        </PostHogProvider>
    ) : (
        appTree
    );

    return (
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
            {appWithPosthog}
        </ClerkProvider>
    );
}

function AuthGate() {
    const { isLoaded, isSignedIn } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const posthog = usePostHog();

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

    useEffect(() => {
        if (!isLoaded) {
            return;
        }

        posthog?.capture("app_opened", { platform: "expo" });
    }, [isLoaded, posthog]);

    useEffect(() => {
        if (!isLoaded) {
            return;
        }

        const screenName = segments.join("/") || "root";
        posthog?.screen(screenName);
    }, [isLoaded, posthog, segments]);

    if (!isLoaded) {
        return <View className="flex-1 bg-background" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}
