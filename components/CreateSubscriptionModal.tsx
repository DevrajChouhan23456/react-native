import { useEffect, useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { clsx } from "clsx";
import dayjs from "dayjs";
import {
    SUBSCRIPTION_CATEGORIES,
    SUBSCRIPTION_CATEGORY_COLORS,
    SUBSCRIPTION_FREQUENCIES,
    type SubscriptionCategoryOption,
    type SubscriptionFrequencyOption,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import { getSubscriptionIcon } from "@/lib/utils";
import { posthog } from "@/src/config";


const StyledTextInput = styled(TextInput);

interface CreateSubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
    onCreate: (subscription: Subscription) => void;
}

const DEFAULT_FREQUENCY = SUBSCRIPTION_FREQUENCIES[0];
const DEFAULT_CATEGORY = SUBSCRIPTION_CATEGORIES[0];

const parsePrice = (value: string) => {
    const trimmed = value.trim();
    const hasComma = trimmed.includes(',');
    const hasDot = trimmed.includes('.');

    let normalized: string;
    if (hasComma && hasDot) {
        // Both comma and dot: remove all commas (they are grouping separators)
        // e.g., "1,234.56" → "1234.56"
        normalized = trimmed.replace(/,/g, '');
    } else if (hasComma && !hasDot) {
        // Only comma (no dot): replace comma with dot (decimal separator)
        // e.g., "1,5" → "1.5"
        normalized = trimmed.replace(',', '.');
    } else {
        // Only dot or neither: leave as-is
        normalized = trimmed;
    }

    return Number(normalized);
};

const validateName = (value: string) => (value.trim() ? null : "Add a subscription name.");

const validatePrice = (value: string) => {
    if (!value.trim()) {
        return "Add a price.";
    }

    const parsedPrice = parsePrice(value);

    if (!Number.isFinite(parsedPrice)) {
        return "Enter a valid price.";
    }

    if (parsedPrice <= 0) {
        return "Price must be greater than zero.";
    }

    return null;
};

const createSubscriptionId = (name: string) => {
    const slug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return `${slug || "subscription"}-${Date.now()}`;
};

const CreateSubscriptionModal = ({
    visible,
    onClose,
    onCreate,
}: CreateSubscriptionModalProps) => {
    const insets = useSafeAreaInsets();
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [frequency, setFrequency] = useState<SubscriptionFrequencyOption>(DEFAULT_FREQUENCY);
    const [category, setCategory] = useState<SubscriptionCategoryOption>(DEFAULT_CATEGORY);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const resetForm = () => {
        setName("");
        setPrice("");
        setFrequency(DEFAULT_FREQUENCY);
        setCategory(DEFAULT_CATEGORY);
        setHasSubmitted(false);
    };

    useEffect(() => {
        if (!visible) {
            resetForm();
        }
    }, [visible]);

    const nameError = useMemo(() => {
        if (!hasSubmitted && !name.length) {
            return null;
        }

        return validateName(name);
    }, [hasSubmitted, name]);

    const priceError = useMemo(() => {
        if (!hasSubmitted && !price.length) {
            return null;
        }

        return validatePrice(price);
    }, [hasSubmitted, price]);

    const isSubmitDisabled = Boolean(validateName(name) || validatePrice(price));
    const footerPaddingBottom = Math.max(insets.bottom, 16) + 10;

    const closeModal = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = () => {
        setHasSubmitted(true);

        const nextNameError = validateName(name);
        const nextPriceError = validatePrice(price);

        if (nextNameError || nextPriceError) {
            return;
        }

        const startDate = dayjs();
        const renewalDate =
            frequency === "Yearly" ? startDate.add(1, "year") : startDate.add(1, "month");
        const parsedPrice = Number(parsePrice(price).toFixed(2));

        onCreate({
            id: createSubscriptionId(name),
            name: name.trim(),
            price: parsedPrice,
            frequency,
            category,
            status: "active",
            startDate: startDate.toISOString(),
            renewalDate: renewalDate.toISOString(),
            icon: getSubscriptionIcon(name, category),
            billing: frequency,
            color: SUBSCRIPTION_CATEGORY_COLORS[category],
            currency: "USD",
            paymentMethod: "Added manually",
            plan: category,
        });

      posthog.capture("subscription_created", {
            name: name.trim(),
            price: parsedPrice,
            frequency,
            category,
        });

        resetForm();
        closeModal();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={closeModal}
            statusBarTranslucent
        >
            <View className="modal-overlay justify-end">
                <Pressable
                    accessibilityRole="button"
                    style={StyleSheet.absoluteFillObject}
                    onPress={closeModal}
                />

                <KeyboardAvoidingView
                    className="flex-1 justify-end"
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
                >
                    <View className="modal-container">
                        <View className="modal-header">
                            <Text className="modal-title">New Subscription</Text>
                            <Pressable className="modal-close" onPress={closeModal}>
                                <Text className="modal-close-text">x</Text>
                            </Pressable>
                        </View>

                        <ScrollView
                            automaticallyAdjustKeyboardInsets
                            contentContainerClassName="modal-body"
                            keyboardDismissMode="on-drag"
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View className="auth-field">
                                <Text className="auth-label modal-label">Name</Text>
                                <StyledTextInput
                                    className={clsx("auth-input", nameError && "auth-input-error")}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Spotify"
                                    placeholderTextColor="rgba(0, 0, 0, 0.35)"
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                />
                                {nameError ? <Text className="auth-error">{nameError}</Text> : null}
                            </View>

                            <View className="auth-field">
                                <Text className="auth-label modal-label">Price</Text>
                                <StyledTextInput
                                    className={clsx("auth-input", priceError && "auth-input-error")}
                                    value={price}
                                    onChangeText={setPrice}
                                    placeholder="12.00"
                                    placeholderTextColor="rgba(0, 0, 0, 0.35)"
                                    keyboardType="decimal-pad"
                                    returnKeyType="done"
                                />
                                {priceError ? <Text className="auth-error">{priceError}</Text> : null}
                            </View>

                            <View className="auth-field">
                                <Text className="auth-label modal-label">Frequency</Text>
                                <View className="picker-row">
                                    {SUBSCRIPTION_FREQUENCIES.map((option) => {
                                        const isActive = frequency === option;

                                        return (
                                            <Pressable
                                                key={option}
                                                className={clsx(
                                                    "picker-option",
                                                    isActive && "picker-option-active"
                                                )}
                                                onPress={() => setFrequency(option)}
                                            >
                                                <Text
                                                    className={clsx(
                                                        "picker-option-text",
                                                        isActive && "picker-option-text-active"
                                                    )}
                                                >
                                                    {option}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>

                            <View className="auth-field">
                                <Text className="auth-label modal-label">Category</Text>
                                <View className="category-scroll">
                                    {SUBSCRIPTION_CATEGORIES.map((option) => {
                                        const isActive = category === option;

                                        return (
                                            <Pressable
                                                key={option}
                                                className={clsx(
                                                    "category-chip",
                                                    isActive && "category-chip-active"
                                                )}
                                                onPress={() => setCategory(option)}
                                            >
                                                <Text
                                                    className={clsx(
                                                        "category-chip-text",
                                                        isActive && "category-chip-text-active"
                                                    )}
                                                >
                                                    {option}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                        </ScrollView>

                        <View className="modal-footer" style={{ paddingBottom: footerPaddingBottom }}>
                            <Pressable
                                className={clsx(
                                    "auth-button",
                                    isSubmitDisabled && "auth-button-disabled"
                                )}
                                onPress={handleSubmit}
                                disabled={isSubmitDisabled}
                            >
                                <Text className="auth-button-text modal-button-text">
                                    Create subscription
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

export default CreateSubscriptionModal;
