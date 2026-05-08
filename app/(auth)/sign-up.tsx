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
import { useClerk, useSignUp } from "@clerk/clerk-expo";
import {
    getClerkErrorMessage,
    normalizeEmail,
    validateEmail,
    validateFullName,
    validatePassword,
    validatePasswordConfirmation,
    validateVerificationCode,
} from "@/lib/auth";

const SafeAreaView = styled(RNSafeAreaView);
const StyledTextInput = styled(TextInput);

function splitFullName(fullName: string) {
    const parts = fullName.trim().split(/\s+/);

    if (parts.length === 1) {
        return {
            firstName: parts[0],
            lastName: "",
        };
    }

    return {
        firstName: parts[0],
        lastName: parts.slice(1).join(" "),
    };
}

export default function SignUpScreen() {
    const router = useRouter();
    const { signUp, isLoaded } = useSignUp();
    const { setActive } = useClerk();
    const scrollViewRef = useRef<ScrollView>(null);
    const fieldOffsets = useRef<Record<string, number>>({});
    const cardOffset = useRef(0);
    const focusedField = useRef<string | null>(null);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerificationStep, setIsVerificationStep] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [hasSubmittedVerification, setHasSubmittedVerification] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
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

    useEffect(() => {
        if (!resendCooldown) {
            return;
        }

        const timer = setTimeout(() => {
            setResendCooldown((current) => Math.max(0, current - 1));
        }, 1000);

        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const fullNameError = useMemo(
        () => (hasSubmitted || fullName.trim() ? validateFullName(fullName) : null),
        [fullName, hasSubmitted]
    );
    const emailError = useMemo(
        () => (hasSubmitted || email.trim() ? validateEmail(email) : null),
        [email, hasSubmitted]
    );
    const passwordError = useMemo(
        () => (hasSubmitted || password.trim() ? validatePassword(password) : null),
        [hasSubmitted, password]
    );
    const confirmationError = useMemo(
        () =>
            hasSubmitted || confirmPassword.trim()
                ? validatePasswordConfirmation(password, confirmPassword)
                : null,
        [confirmPassword, hasSubmitted, password]
    );
    const verificationError = useMemo(
        () =>
            hasSubmittedVerification || verificationCode.trim()
                ? validateVerificationCode(verificationCode)
                : null,
        [hasSubmittedVerification, verificationCode]
    );

    const updateVerificationCode = (value: string) => {
        setVerificationCode(value.replace(/\D/g, "").slice(0, 6));
        setErrorMessage(null);
    };

    const createAccount = async () => {
        setHasSubmitted(true);

        const nextFullNameError = validateFullName(fullName);
        const nextEmailError = validateEmail(email);
        const nextPasswordError = validatePassword(password);
        const nextConfirmationError = validatePasswordConfirmation(password, confirmPassword);

        if (nextFullNameError || nextEmailError || nextPasswordError || nextConfirmationError) {
            setErrorMessage(
                nextFullNameError ?? nextEmailError ?? nextPasswordError ?? nextConfirmationError
            );
            return;
        }

        if (!signUp) {
            setErrorMessage("Secure account setup is still loading. Try again in a moment.");
            return;
        }

        const { firstName, lastName } = splitFullName(fullName);
        setIsSubmitting(true);
        setErrorMessage(null);
        setStatusMessage(null);

        try {
            const created = await signUp.create({
                firstName,
                lastName,
                emailAddress: normalizeEmail(email),
                password,
            });

            if (created.createdSessionId) {
                await setActive({ session: created.createdSessionId });
                router.replace("/(tabs)");
                return;
            }

            await created.prepareEmailAddressVerification({
                strategy: "email_code",
            });

            setVerificationCode("");
            setHasSubmittedVerification(false);
            setIsVerificationStep(true);
            setResendCooldown(30);
            setStatusMessage(`We sent a verification code to ${normalizeEmail(email)}.`);
        } catch (error) {
            setErrorMessage(getClerkErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const verifyEmail = async () => {
        setHasSubmittedVerification(true);

        const nextVerificationError = validateVerificationCode(verificationCode);

        if (nextVerificationError) {
            setErrorMessage(nextVerificationError);
            return;
        }

        if (!signUp) {
            setErrorMessage("Secure verification is still loading. Try again in a moment.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const result = await signUp.attemptEmailAddressVerification({
                code: verificationCode.trim(),
            });

            if (result.createdSessionId) {
                await setActive({ session: result.createdSessionId });
                router.replace("/(tabs)");
                return;
            }

            setErrorMessage("That code did not verify. Use the newest code from your inbox.");
        } catch (error) {
            setErrorMessage(getClerkErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const resendCode = async () => {
        if (resendCooldown || isSubmitting) {
            return;
        }

        if (!signUp) {
            setErrorMessage("Secure account setup is still loading. Try again in a moment.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);
        setStatusMessage(null);

        try {
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code",
            });
            setVerificationCode("");
            setHasSubmittedVerification(false);
            setResendCooldown(30);
            setStatusMessage("A fresh code is on its way.");
        } catch (error) {
            setErrorMessage(getClerkErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const submit = async () => {
        if (isVerificationStep) {
            await verifyEmail();
            return;
        }

        await createAccount();
    };

    const editDetails = () => {
        setIsVerificationStep(false);
        setHasSubmitted(false);
        setHasSubmittedVerification(false);
        setVerificationCode("");
        setErrorMessage(null);
        setStatusMessage(null);
    };

    if (!isLoaded) {
        return (
            <SafeAreaView className="auth-safe-area items-center justify-center">
                <Text className="auth-helper">Preparing your workspace...</Text>
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

                            <Text className="auth-title">
                                {isVerificationStep ? "Check your inbox." : "Build your workspace."}
                            </Text>
                            <Text className="auth-subtitle">
                                {isVerificationStep
                                    ? "Confirm your email so your billing workspace stays protected."
                                    : "Track renewals, catch upcoming charges, and keep recurring spend under control."}
                            </Text>
                            <Text className="auth-assurance">
                                No card required. Add your first subscription after setup.
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
                            {!isVerificationStep ? (
                                <>
                                    <View
                                        className="auth-field"
                                        onLayout={(event) => {
                                            fieldOffsets.current.fullName = event.nativeEvent.layout.y;
                                        }}
                                    >
                                        <Text className="auth-label">Your name</Text>
                                        <StyledTextInput
                                            className={`auth-input ${fullNameError ? "auth-input-error" : ""}`}
                                            autoCapitalize="words"
                                            autoComplete="name"
                                            autoCorrect={false}
                                            placeholder="Devraj Chouhan"
                                            placeholderTextColor="rgba(0, 0, 0, 0.35)"
                                            returnKeyType="next"
                                            textContentType="name"
                                            value={fullName}
                                            onChangeText={setFullName}
                                            onFocus={() => focusField("fullName")}
                                        />
                                        {fullNameError ? <Text className="auth-error">{fullNameError}</Text> : null}
                                    </View>

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
                                            textContentType="emailAddress"
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
                                            autoComplete="new-password"
                                            autoCorrect={false}
                                            placeholder="Create a strong password"
                                            placeholderTextColor="rgba(0, 0, 0, 0.35)"
                                            returnKeyType="next"
                                            secureTextEntry={!showPassword}
                                            textContentType="newPassword"
                                            value={password}
                                            onChangeText={setPassword}
                                            onFocus={() => focusField("password")}
                                        />
                                        {passwordError ? <Text className="auth-error">{passwordError}</Text> : null}
                                    </View>

                                    <View
                                        className="auth-field"
                                        onLayout={(event) => {
                                            fieldOffsets.current.confirmPassword = event.nativeEvent.layout.y;
                                        }}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <Text className="auth-label">Confirm password</Text>
                                            <TouchableOpacity
                                                onPress={() => setShowConfirmation((current) => !current)}
                                            >
                                                <Text className="auth-link">
                                                    {showConfirmation ? "Hide" : "Show"}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        <StyledTextInput
                                            className={`auth-input ${
                                                confirmationError ? "auth-input-error" : ""
                                            }`}
                                            autoCapitalize="none"
                                            autoComplete="password-new"
                                            autoCorrect={false}
                                            placeholder="Type it once more"
                                            placeholderTextColor="rgba(0, 0, 0, 0.35)"
                                            returnKeyType="done"
                                            secureTextEntry={!showConfirmation}
                                            textContentType="newPassword"
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            onSubmitEditing={submit}
                                            onFocus={() => focusField("confirmPassword")}
                                        />
                                        {confirmationError ? (
                                            <Text className="auth-error">{confirmationError}</Text>
                                        ) : null}
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View className="auth-verification-header">
                                        <Text className="auth-verification-title">Secure your workspace</Text>
                                        <Text className="auth-helper">
                                            Enter the 6-digit code sent to {normalizeEmail(email)}.
                                        </Text>
                                    </View>

                                    <View
                                        className="auth-field"
                                        onLayout={(event) => {
                                            fieldOffsets.current.verificationCode = event.nativeEvent.layout.y;
                                        }}
                                    >
                                        <Text className="auth-label">Verification code</Text>
                                        <StyledTextInput
                                            className={`auth-input auth-code-input ${
                                                verificationError ? "auth-input-error" : ""
                                            }`}
                                            autoCapitalize="none"
                                            autoComplete="one-time-code"
                                            autoCorrect={false}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            placeholder="123456"
                                            placeholderTextColor="rgba(0, 0, 0, 0.35)"
                                            returnKeyType="done"
                                            textContentType="oneTimeCode"
                                            value={verificationCode}
                                            onChangeText={updateVerificationCode}
                                            onSubmitEditing={submit}
                                            onFocus={() => focusField("verificationCode")}
                                        />
                                        {verificationError ? (
                                            <Text className="auth-error">{verificationError}</Text>
                                        ) : null}
                                    </View>
                                </>
                            )}

                            {statusMessage ? <Text className="auth-helper">{statusMessage}</Text> : null}
                            {errorMessage ? <Text className="auth-error">{errorMessage}</Text> : null}

                            <TouchableOpacity
                                className={`auth-button ${isSubmitting ? "auth-button-disabled" : ""}`}
                                disabled={isSubmitting}
                                onPress={submit}
                            >
                                <Text className="auth-button-text">
                                    {isSubmitting
                                        ? isVerificationStep
                                            ? "Verifying..."
                                            : "Creating workspace..."
                                        : isVerificationStep
                                            ? "Verify and continue"
                                            : "Create workspace"}
                                </Text>
                            </TouchableOpacity>

                            {isVerificationStep ? (
                                <View className="auth-link-row justify-between">
                                    <TouchableOpacity onPress={editDetails}>
                                        <Text className="auth-link">Change email</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={resendCode}
                                        disabled={isSubmitting || Boolean(resendCooldown)}
                                    >
                                        <Text
                                            className={
                                                resendCooldown || isSubmitting
                                                    ? "auth-link-disabled"
                                                    : "auth-link"
                                            }
                                        >
                                            {resendCooldown
                                                ? `Resend in ${resendCooldown}s`
                                                : "Resend code"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ) : null}

                            <View className="auth-link-row">
                                <Text className="auth-link-copy">Already managing plans?</Text>
                                <Link href="/(auth)/sign-in" asChild>
                                    <Text className="auth-link">Sign in</Text>
                                </Link>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
