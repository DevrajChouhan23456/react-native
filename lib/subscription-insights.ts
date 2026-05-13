import dayjs from "dayjs";

const INSIGHT_WEEKDAYS = [
    { key: 1, label: "Mon" },
    { key: 2, label: "Tue" },
    { key: 3, label: "Wed" },
    { key: 4, label: "Thr" },
    { key: 5, label: "Fri" },
    { key: 6, label: "Sat" },
    { key: 0, label: "Sun" },
] as const;

export interface InsightBarDatum {
    label: string;
    value: number;
    total: number;
    isHighlighted: boolean;
}

export function isSubscriptionActive(subscription: Subscription) {
    return subscription.status !== "cancelled";
}

export function getMonthlyEquivalentPrice(subscription: Subscription) {
    if (subscription.billing.toLowerCase() === "yearly") {
        return subscription.price / 12;
    }

    return subscription.price;
}

export function getDaysUntilRenewal(renewalDate?: string) {
    if (!renewalDate) {
        return Number.POSITIVE_INFINITY;
    }

    const renewal = dayjs(renewalDate);

    if (!renewal.isValid()) {
        return Number.POSITIVE_INFINITY;
    }

    const now = dayjs();
    const rawDiff = renewal.startOf("day").diff(now.startOf("day"), "day");

    return rawDiff >= 0 ? rawDiff : Number.POSITIVE_INFINITY;
}

export function getMonthsUntilRenewalLabel(renewalDate?: string) {
    if (!renewalDate) {
        return "No date";
    }

    const renewal = dayjs(renewalDate);

    if (!renewal.isValid()) {
        return "No date";
    }

    const diffInMonths = renewal.diff(dayjs(), "month", true);
    const months = Math.max(1, Math.ceil(diffInMonths));

    return `${months} month${months === 1 ? "" : "s"}`;
}

export function formatInsightHistoryDate(renewalDate?: string) {
    if (!renewalDate) {
        return "No renewal date";
    }

    const renewal = dayjs(renewalDate);

    if (!renewal.isValid()) {
        return "No renewal date";
    }

    return renewal.format("MMMM D, HH:mm");
}

export function buildUpcomingSubscriptions(
    subscriptions: Subscription[],
    limit = 3
): UpcomingSubscription[] {
    return subscriptions
        .filter(isSubscriptionActive)
        .filter((subscription) => getDaysUntilRenewal(subscription.renewalDate) !== Number.POSITIVE_INFINITY)
        .sort(
            (left, right) =>
                getDaysUntilRenewal(left.renewalDate) - getDaysUntilRenewal(right.renewalDate)
        )
        .slice(0, limit)
        .map((subscription) => ({
            id: subscription.id,
            icon: subscription.icon,
            name: subscription.name,
            price: subscription.price,
            currency: subscription.currency,
            daysLeft: getDaysUntilRenewal(subscription.renewalDate),
        }));
}

export function getNextRenewalDate(subscriptions: Subscription[]) {
    const [nextRenewal] = subscriptions
        .filter(isSubscriptionActive)
        .filter((subscription) => subscription.renewalDate)
        .sort((left, right) => dayjs(left.renewalDate).valueOf() - dayjs(right.renewalDate).valueOf());

    return nextRenewal?.renewalDate;
}

export function getCurrentExpensesTotal(subscriptions: Subscription[]) {
    return subscriptions
        .filter(isSubscriptionActive)
        .reduce((total, subscription) => total + getMonthlyEquivalentPrice(subscription), 0);
}

export function getExpenseChangePercentage(subscriptions: Subscription[]) {
    const startOfMonth = dayjs().startOf("month");

    const previousTotal = subscriptions
        .filter(isSubscriptionActive)
        .filter((subscription) => {
            if (!subscription.startDate) {
                return true;
            }

            const startDate = dayjs(subscription.startDate);
            return startDate.isValid() ? startDate.isBefore(startOfMonth) : true;
        })
        .reduce((total, subscription) => total + getMonthlyEquivalentPrice(subscription), 0);

    if (previousTotal <= 0) {
        return 0;
    }

    const currentTotal = getCurrentExpensesTotal(subscriptions);

    return Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
}

export function buildInsightBars(subscriptions: Subscription[]): InsightBarDatum[] {
    const totalsByWeekday = new Map<number, number>(
        INSIGHT_WEEKDAYS.map((weekday) => [weekday.key, 0])
    );

    subscriptions
        .filter(isSubscriptionActive)
        .forEach((subscription) => {
            if (!subscription.renewalDate) {
                return;
            }

            const renewalDate = dayjs(subscription.renewalDate);

            if (!renewalDate.isValid()) {
                return;
            }

            const currentTotal = totalsByWeekday.get(renewalDate.day()) ?? 0;
            totalsByWeekday.set(
                renewalDate.day(),
                currentTotal + getMonthlyEquivalentPrice(subscription)
            );
        });

    const highestTotal = Math.max(...totalsByWeekday.values(), 0);

    return INSIGHT_WEEKDAYS.map((weekday) => {
        const total = totalsByWeekday.get(weekday.key) ?? 0;
        const scaledValue = highestTotal
            ? Math.max(0, Math.round(Math.sqrt(total / highestTotal) * 40))
            : 0;

        return {
            label: weekday.label,
            value: scaledValue,
            total,
            isHighlighted: total > 0 && total === highestTotal,
        };
    });
}
