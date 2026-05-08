import { isClerkAPIResponseError, isClerkRuntimeError } from "@clerk/clerk-expo";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string) {
    return value.trim().toLowerCase();
}

export function validateEmail(value: string) {
    const email = value.trim();

    if (!email) {
        return "Email is required";
    }

    if (!EMAIL_REGEX.test(email)) {
        return "Enter a valid email address";
    }

    return null;
}

export function validateFullName(value: string) {
    const fullName = value.trim();

    if (!fullName) {
        return "Full name is required";
    }

    if (fullName.length < 2) {
        return "Enter at least 2 characters";
    }

    return null;
}

export function validateSignInPassword(value: string) {
    if (!value.trim()) {
        return "Password is required";
    }

    return null;
}

export function validatePassword(value: string) {
    if (!value.trim()) {
        return "Password is required";
    }

    if (value.length < 8) {
        return "Use at least 8 characters";
    }

    if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
        return "Use upper, lower, and numeric characters";
    }

    return null;
}

export function validatePasswordConfirmation(password: string, confirmation: string) {
    if (!confirmation.trim()) {
        return "Confirm your password";
    }

    if (password !== confirmation) {
        return "Passwords do not match";
    }

    return null;
}

export function validateVerificationCode(value: string) {
    const code = value.trim();

    if (!code) {
        return "Enter the verification code";
    }

    if (!/^\d{6}$/.test(code)) {
        return "Enter the 6-digit code";
    }

    return null;
}

export function getClerkErrorMessage(error: unknown) {
    if (isClerkAPIResponseError(error)) {
        return (
            error.errors?.[0]?.longMessage ||
            error.errors?.[0]?.message ||
            error.message ||
            "Something went wrong"
        );
    }

    if (isClerkRuntimeError(error)) {
        return error.message || "Something went wrong";
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Something went wrong";
}
