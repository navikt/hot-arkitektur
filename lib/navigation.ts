import type { ComponentType, SVGProps } from "react";
import { DatabaseIcon, HouseIcon, TasklistIcon } from "@navikt/aksel-icons";

export type NavIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type NavItem = {
  href: string;
  label: string;
  Icon: NavIcon;
};

export type NavSection = { heading?: string; items: readonly NavItem[] };

/** Den ene listen over sider i portalen. Sidebaren tegner den, og sidene velger fra den med `PageHref`. */
const NAVIGATION = [
  {
    items: [{ href: "/", label: "Oversikt", Icon: HouseIcon }],
  },
  {
    heading: "Applikasjoner",
    items: [
      { href: "/applikasjoner/hotsak/domenemodell", label: "Domenemodell", Icon: TasklistIcon },
      { href: "/applikasjoner/hotsak/databasemodell", label: "Databasemodell", Icon: DatabaseIcon },
    ],
  },
] as const satisfies readonly NavSection[];

export const NAV_SECTIONS: readonly NavSection[] = NAVIGATION;

/** Alle interne ruter i menyen, så en skrivefeil eller fjernet side feiler i typesjekken. */
export type PageHref = (typeof NAVIGATION)[number]["items"][number]["href"];

const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

const PAGE_BY_HREF = new Map(NAV_ITEMS.map((item) => [item.href, item]));

export function navPage(href: PageHref): NavItem {
  return PAGE_BY_HREF.get(href)!;
}
