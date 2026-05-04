import "@/global.css"
import {Text} from "react-native";
import {Link} from "expo-router";
import {SafeAreaView, SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
    // @ts-ignore
    return (
        <SafeAreaView >
            <Text className="text-xl font-bold text-success">
                Welcome to Nativewind!
            </Text>
            <Link href="/onboarding" className="mt-4 rounded bg-primary text-white p-4">Click Here for
                onboarding </Link>
            <Link href="/(auth)/sign-in" className="mt-4 rounded bg-primary text-white p-4">Click Here for
                sign-in </Link>
            <Link href="/(auth)/sign-up" className="mt-4 rounded bg-primary text-white p-4">Click Here for
                sign-up </Link>
            <Link href="/subscriptions/spotify" className="mt-4 rounded bg-primary text-white p-4">spotify
                subscription </Link>
            <Link href={{pathname:"/subscriptions/[id]",params:{id:"claude"},}}>claude subscription</Link>
        </SafeAreaView>
    );


}