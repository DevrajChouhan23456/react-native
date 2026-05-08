import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

const SafeAreaView = styled(RNSafeAreaView);

export default function SettingsScreen() {
    const router = useRouter();
    const { isLoaded, isSignedIn, user } = useUser();
    const { signOut } = useClerk();
    const { sessionId } = useAuth();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = async () => {
        setIsSigningOut(true);

        try {
            await signOut();
            router.replace("/(auth)/sign-in");
        } catch {
            Alert.alert("Sign out failed", "Please try again.");
        } finally {
            setIsSigningOut(false);
        }
    };

    if (!isLoaded || !isSignedIn) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center p-5">
                <Text className="text-sm font-sans-medium text-muted-foreground">Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <View className="auth-brand-block items-start">
                <Text className="auth-title">Settings</Text>
                <Text className="auth-subtitle text-left">
                    Manage your signed-in session and account access.
                </Text>
            </View>

            <View className="auth-card mt-6 gap-4">
                <View className="gap-1">
                    <Text className="auth-label">Account</Text>
                    <Text className="text-base font-sans-bold text-primary">
                        {sessionId ? "Active session" : "Session unavailable"}
                    </Text>
                    <Text className="text-sm font-sans-medium text-muted-foreground">
                        {sessionId ?? "No session ID available"}
                    </Text>
                </View>

                <View className="gap-1">
                    <Text className="auth-label">Email</Text>
                    <Text className="text-base font-sans-semibold text-primary">
                        {user?.primaryEmailAddress?.emailAddress ?? "Not available"}
                    </Text>
                    <Text className="text-sm font-sans-medium text-muted-foreground">
                        {user?.fullName?.trim() || user?.firstName?.trim() || "Account profile"}
                    </Text>
                </View>

                <TouchableOpacity
                    className={`auth-button ${isSigningOut ? "auth-button-disabled" : ""}`}
                    disabled={isSigningOut}
                    onPress={handleSignOut}
                >
                    <Text className="auth-button-text">
                        {isSigningOut ? "Signing out..." : "Sign out"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
