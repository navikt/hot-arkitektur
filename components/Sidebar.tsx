"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip } from "@navikt/ds-react";
import { ChevronLeftIcon } from "@navikt/aksel-icons";
import { NAV_SECTIONS, type NavItem } from "@/lib/navigation";
import {
  SIDEBAR_COLLAPSED,
  SIDEBAR_DESKTOP_QUERY,
  SIDEBAR_STORAGE_KEY,
} from "@/lib/sidebar";
import { ThemeToggle } from "./ThemeToggle";

/** Avrundet firkant med monogrammet «H». */
function BrandMark() {
  return (
    <svg className="portal-brand__mark" viewBox="0 0 32 32" aria-hidden focusable="false">
      <rect width="32" height="32" rx="9" />
      <path className="portal-brand__letter" d="M10.5 9v14M21.5 9v14M10.5 16h11" />
      <circle cx="24.5" cy="8" r="1.8" />
    </svg>
  );
}

/* ── Kollapset tilstand ────────────────────────────────────────────────────
   Ligger på <html data-sidebar> (satt før første tegning, se lib/sidebar.ts) og
   speiles til localStorage. React leser den med useSyncExternalStore. */

const collapseListeners = new Set<() => void>();

function emitCollapse() {
  for (const listener of collapseListeners) listener();
}

function applyCollapsed(collapsed: boolean) {
  const el = document.documentElement;
  if (collapsed) el.setAttribute("data-sidebar", SIDEBAR_COLLAPSED);
  else el.removeAttribute("data-sidebar");
}

function onStorage(event: StorageEvent) {
  if (event.key !== SIDEBAR_STORAGE_KEY) return;
  applyCollapsed(event.newValue === SIDEBAR_COLLAPSED);
  emitCollapse();
}

function subscribeCollapsed(callback: () => void) {
  collapseListeners.add(callback);
  if (collapseListeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    collapseListeners.delete(callback);
    if (collapseListeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function setCollapsed(collapsed: boolean) {
  applyCollapsed(collapsed);
  try {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? SIDEBAR_COLLAPSED : "expanded");
  } catch {
    /* lagring utilgjengelig: valget gjelder til siden lastes på nytt */
  }
  emitCollapse();
}

const isCollapsed = () =>
  document.documentElement.getAttribute("data-sidebar") === SIDEBAR_COLLAPSED;

function subscribeDesktop(callback: () => void) {
  const media = window.matchMedia(SIDEBAR_DESKTOP_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

const isDesktop = () => window.matchMedia(SIDEBAR_DESKTOP_QUERY).matches;
const serverFalse = () => false;
const subscribePlatform = () => () => {};
const isMacPlatform = () => /Mac|iPhone|iPad/.test(navigator.platform);

function isActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(subscribeCollapsed, isCollapsed, serverFalse);
  const desktop = useSyncExternalStore(subscribeDesktop, isDesktop, serverFalse);
  const isMac = useSyncExternalStore(subscribePlatform, isMacPlatform, () => true);
  // Ikonskinnen finnes bare på brede skjermer.
  const rail = collapsed && desktop;
  const toggleCollapsed = useCallback(() => setCollapsed(!isCollapsed()), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "b" &&
        !event.isComposing &&
        isDesktop() &&
        !document.querySelector("dialog[open]")
      ) {
        event.preventDefault();
        if (!event.repeat) toggleCollapsed();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleCollapsed]);

  const brand = (
    <Link href="/" className="portal-brand">
      <BrandMark />
      <span className="portal-brand__text">
        <span className="portal-brand__name">Team HOT</span>
        <span className="portal-brand__sub">Arkitekturportal · Nav</span>
      </span>
    </Link>
  );

  return (
    <header className="portal-sidebar">
      <Tooltip
        content={collapsed ? "Vis sidemeny" : "Skjul sidemeny"}
        keys={[isMac ? "⌘" : "Ctrl", "B"]}
        placement="right"
      >
        <button
          type="button"
          className="portal-sidebar__collapse"
          aria-label="Sidemeny"
          aria-expanded={!collapsed}
          aria-controls="portal-sidebar-panel"
          aria-keyshortcuts={isMac ? "Meta+B" : "Control+B"}
          onClick={toggleCollapsed}
        >
          <ChevronLeftIcon aria-hidden />
        </button>
      </Tooltip>

      <div className="portal-sidebar__top">
        {rail ? (
          <Tooltip content="Team HOT · Oversikt" placement="right">
            {brand}
          </Tooltip>
        ) : (
          brand
        )}
      </div>

      <div id="portal-sidebar-panel" className="portal-sidebar__panel">
        <nav aria-label="Hovedmeny" className="portal-sidebar__nav">
          {NAV_SECTIONS.map((section, i) => (
            <div key={i} className="portal-sidebar__section">
              {section.heading && (
                <div className="portal-sidebar__heading">{section.heading}</div>
              )}
              <ul className="portal-sidebar__list">
                {section.items.map((item) => {
                  const active = isActive(pathname, item);
                  const link = (
                    <Link
                      href={item.href}
                      className={
                        "portal-sidebar__link" + (active ? " portal-sidebar__link--active" : "")
                      }
                      aria-current={active ? "page" : undefined}
                    >
                      <item.Icon aria-hidden className="portal-sidebar__icon" />
                      <span className="portal-sidebar__label">{item.label}</span>
                    </Link>
                  );
                  return (
                    <li key={item.href}>
                      {rail ? (
                        <Tooltip content={item.label} placement="right">
                          {link}
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="portal-sidebar__footer">
          <ThemeToggle />
          <span className="portal-sidebar__footer-label">Fargetema</span>
        </div>
      </div>
    </header>
  );
}
