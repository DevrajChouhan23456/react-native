import activity from "@/assets/icons/activity.png";
import add from "@/assets/icons/add.png";
import adobe from "@/assets/icons/adobe.png";
import back from "@/assets/icons/back.png";
import canva from "@/assets/icons/canva.png";
import claude from "@/assets/icons/claude.png";
import dropbox from "@/assets/icons/dropbox.png";
import figma from "@/assets/icons/figma.png";
import github from "@/assets/icons/github.png";
import home from "@/assets/icons/home.png";
import medium from "@/assets/icons/medium.png";
import menu from "@/assets/icons/menu.png";
import notion from "@/assets/icons/notion.png";
import openai from "@/assets/icons/openai.png";
import plus from "@/assets/icons/plus.png";
import setting from "@/assets/icons/setting.png";
import spotify from "@/assets/icons/spotify.png";
import wallet from "@/assets/icons/wallet.png";

export const icons = {
    home,
    wallet,
    setting,
    activity,
    add,
    back,
    menu,
    plus,
    notion,
    dropbox,
    openai,
    adobe,
    medium,
    figma,
    spotify,
    github,
    claude,
    canva,
} as const;

export type IconKey = keyof typeof icons;

// Mapping of subscription names/keywords to their icon keys
export const SUBSCRIPTION_ICON_MAP: Record<string, IconKey> = {
    spotify: "spotify",
    notion: "notion",
    figma: "figma",
    dropbox: "dropbox",
    github: "github",
    "github copilot": "github",
    adobe: "adobe",
    claude: "claude",
    canva: "canva",
    openai: "openai",
    "openai team": "openai",
    grammarly: "medium",
    medium: "medium",
};

// Mapping of subscription categories to fallback icon keys
export const CATEGORY_ICON_MAP: Record<string, IconKey> = {
    "Entertainment": "activity",
    "AI Tools": "claude",
    "Developer Tools": "github",
    "Design": "figma",
    "Productivity": "medium",
    "Cloud": "dropbox",
    "Music": "spotify",
    "Other": "wallet",
};