import "@navikt/ds-css";
import "./globals.css";

import type { Metadata } from "next";
import { Box } from "@navikt/ds-react";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { sidebarBootScript } from "@/lib/sidebar";
import { themeBootScript } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Team HOT",
  description:
    "Arkitekturportal for Hjelpemidler og tilrettelegging i Nav: applikasjoner, domenemodell og databasemodell.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript + sidebarBootScript }} />
      </head>
      <body>
        <ThemeProvider>
          <a href="#main" className="portal-skip-link">
            Hopp til innhold
          </a>
          <div className="portal-shell">
            <Sidebar />
            <Box
              as="main"
              id="main"
              tabIndex={-1}
              className="portal-main"
              paddingInline={{ xs: "space-16", md: "space-40" }}
              paddingBlock={{ xs: "space-24", md: "space-48" }}
              style={{ maxWidth: "var(--portal-wide-max)", width: "100%" }}
            >
              {children}
            </Box>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
