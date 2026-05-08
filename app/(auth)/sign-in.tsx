import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { Link, useRouter } from "expo-router";
import { useClerk, useSignIn } from "@clerk/clerk-expo";
import {
    getClerkErrorMessage,
    normalizeEmail,
    validateEmail,
    validateSignInPassword,
} from "@/lib/auth";

const SafeAreaView = styled(RNSafeAreaView);
const StyledTextInput = styled(TextInput);

export default function SignInScreen() {
    const router = useRouter();
    const { signIn, isLoaded } = useSignIn();
    const { setActive } = useClerk();
    const scrollViewRef = useRef<ScrollView>(null);
    const fieldOffsets = useRef<Record<string, number>>({});
    const cardOffset = useRef(0);
    const focusedField = useRef<string | null>(null);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const scrollToField = useCallback((field: string) => {
        const y = fieldOffsets.current[field];
        if (typeof y === "number") {
            scrollViewRef.current?.scrollTo({
                y: Math.max(0, cardOffset.current + y - 12),
                animated: true,
            });
        }
    }, []);

    const focusField = (field: string) => {
        focusedField.current = field;
        scrollToField(field);
        setTimeout(() => scrollToField(field), 280);
    };

    useEffect(() => {
        const keyboardShow = Keyboard.addListener("keyboardDidShow", () => {
            setIsKeyboardVisible(true);
            if (focusedField.current) {
                scrollToField(focusedField.current);
            }
        });
        const keyboardHide = Keyboard.addListener("keyboardDidHide", () => {
            setIsKeyboardVisible(false);
            focusedField.current = null;
        });

        return () => {
            keyboardShow.remove();
            keyboardHide.remove();
        };
    }, [scrollToField]);

    useEffect(() => {
        if (isKeyboardVisible && focusedField.current) {
            setTimeout(() => {
                if (focusedField.current) {
                    scrollToField(focusedField.current);
                }
            }, 120);
        }
    }, [isKeyboardVisible, scrollToField]);

    const emailError = useMemo(
        () => (hasSubmitted || email.trim() ? validateEmail(email) : null),
        [email, hasSubmitted]
    );
    const passwordError = useMemo(
        () => (hasSubmitted || password.trim() ? validateSignInPassword(password) : null),
        [hasSubmitted, password]
    );
    const canSubmit = Boolean(email.trim() && password.trim() && !isSubmitting);

    const submit = async () => {
        setHasSubmitted(true);

        const nextEmailError = validateEmail(email);
        const nextPasswordError = validateSignInPassword(password);

        if (nextEmailError || nextPasswordError) {
            setErrorMessage(nextEmailError ?? nextPasswordError);
            return;
        }

        if (!signIn) {
            setErrorMessage("Secure access is still loading. Try again in a moment.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const attempt = await signIn.create({
                identifier: normalizeEmail(email),
                password,
            });

            if (attempt.createdSessionId) {
                await setActive({ session: attempt.createdSessionId });
                router.replace("/(tabs)");
                return;
            }

            setErrorMessage("One more verification step is required before we can open your workspace.");
        } catch (error) {
            setErrorMessage(getClerkErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isLoaded) {
        return (
            <SafeAreaView className="auth-safe-area items-center justify-center">
                <Text className="auth-helper">Preparing secure access...</Text>
            </SafeAreaView>
        );
    }

    return (
            <SafeAreaView className="auth-safe-area">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    className="auth-scroll"
                    automaticallyAdjustKeyboardInsets
                    contentContainerClassName="auth-content pb-64"
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                >
                    {!isKeyboardVisible ? (
                        <View className="auth-brand-block">
                            <View className="auth-logo-wrap">
                                <View className="auth-logo-mark">
                                    <Text className="auth-logo-mark-text">R</Text>
                                </View>
                                <View>
                                    <Text className="auth-wordmark">Recurly</Text>
                                    <Text className="auth-wordmark-sub">Subscription control</Text>
                                </View>
                            </View>

                            <Text className="auth-title">Welcome back.</Text>
                            <Text className="auth-subtitle">
                                Review upcoming charges, keep renewals in sight, and stay ahead of every plan.
                            </Text>
                            <Text className="auth-assurance">
                                Private access. Fast renewal checks. No billing changes without you.
                            </Text>
                        </View>
                    ) : null}

                    <View
                        className={isKeyboardVisible ? "auth-card auth-card-keyboard" : "auth-card"}
                        onLayout={(event) => {
                            cardOffset.current = event.nativeEvent.layout.y;
                            if (isKeyboardVisible && focusedField.current) {
                                scrollToField(focusedField.current);
                            }
                        }}
                    >
                        <View className="auth-form">
                            <View
                                className="auth-field"
                                onLayout={(event) => {
                                    fieldOffsets.current.email = event.nativeEvent.layout.y;
                                }}
                            >
                                <Text className="auth-label">Email address</Text>
                                <StyledTextInput
                                    className={`auth-input ${emailError ? "auth-input-error" : ""}`}
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect={false}
                                    keyboardType="email-address"
                                    placeholder="you@example.com"
                                    placeholderTextColor="rgba(0, 0, 0, 0.35)"
                                    returnKeyType="next"
                                    textContentType="username"
                                    value={email}
                                    onChangeText={setEmail}
                                    onFocus={() => focusField("email")}
                                />
                                {emailError ? <Text className="auth-error">{emailError}</Text> : null}
                            </View>

                            <View
                                className="auth-field"
                                onLayout={(event) => {
                                    fieldOffsets.current.password = event.nativeEvent.layout.y;
                                }}
                            >
                                <View className="flex-row items-center justify-between">
                                    <Text className="auth-label">Password</Text>
                                    <TouchableOpacity onPress={() => setShowPassword((current) => !current)}>
                                        <Text className="auth-link">
                                            {showPassword ? "Hide" : "Show"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <StyledTextInput
                                    className={`auth-input ${passwordError ? "auth-input-error" : ""}`}
                                    autoCapitalize="none"
                                    autoComplete="password"
                                    autoCorrect={false}
                                    placeholder="Your account password"
                                    placeholderTextColor="rgba(0, 0, 0, 0.35)"
                                    returnKeyType="done"
                                    secureTextEntry={!showPassword}
                                    textContentType="password"
                                    value={password}
                                    onChangeText={setPassword}
                                    onSubmitEditing={submit}
                                    onFocus={() => focusField("password")}
                                />
                                {passwordError ? <Text className="auth-error">{passwordError}</Text> : null}
                            </View>

                            {errorMessage ? <Text className="auth-error">{errorMessage}</Text> : null}

                            <TouchableOpacity
                                className={`auth-button ${!canSubmit ? "auth-button-disabled" : ""}`}
                                disabled={!canSubmit}
                                onPress={submit}
                            >
                                <Text className="auth-button-text">
                                    {isSubmitting ? "Opening workspace..." : "Continue"}
                                </Text>
                            </TouchableOpacity>

                            <View className="auth-link-row">
                                <Text className="auth-link-copy">Starting fresh?</Text>
                                <Link href="/(auth)/sign-up">
                                    <Text className="auth-link">Create your workspace</Text>
                                </Link>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
