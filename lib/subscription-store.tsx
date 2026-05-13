import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";

interface SubscriptionStoreValue {
    subscriptions: Subscription[];
    addSubscription: (subscription: Subscription) => void;
    updateSubscription: (id: string, updater: (subscription: Subscription) => Subscription) => void;
    cancelSubscription: (id: string) => void;
}

const SubscriptionStoreContext = createContext<SubscriptionStoreValue | null>(null);

export function SubscriptionStoreProvider({ children }: PropsWithChildren) {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>(HOME_SUBSCRIPTIONS);

    const addSubscription = (subscription: Subscription) => {
        setSubscriptions((currentSubscriptions) => [subscription, ...currentSubscriptions]);
    };

    const updateSubscription = (
        id: string,
        updater: (subscription: Subscription) => Subscription
    ) => {
        setSubscriptions((currentSubscriptions) =>
            currentSubscriptions.map((subscription) =>
                subscription.id === id ? updater(subscription) : subscription
            )
        );
    };

    const cancelSubscription = (id: string) => {
        updateSubscription(id, (subscription) => ({
            ...subscription,
            status: "cancelled",
        }));
    };

    const value = useMemo(
        () => ({
            subscriptions,
            addSubscription,
            updateSubscription,
            cancelSubscription,
        }),
        [subscriptions]
    );

    return (
        <SubscriptionStoreContext.Provider value={value}>
            {children}
        </SubscriptionStoreContext.Provider>
    );
}

export function useSubscriptionStore() {
    const context = useContext(SubscriptionStoreContext);

    if (!context) {
        throw new Error("useSubscriptionStore must be used within SubscriptionStoreProvider");
    }

    return context;
}
