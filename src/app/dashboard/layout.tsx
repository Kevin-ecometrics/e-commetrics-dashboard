import { ThemeProvider } from "@/components/theme-provider";
import Chatbot from "@/components/chatbot";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/toggle";
import { AppSidebar } from "@/components/app-sidebar";
import Bread from "@/components/bread";
import ClientOnly from "@/components/ClientOnly";
import NotificationBell from "@/components/notification-bell";
import LanguageToggle from "@/components/language-toggle";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SidebarProvider>
        <ClientOnly>
          <AppSidebar />
        </ClientOnly>
        <SidebarInset>
          <header className="flex relative h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <ClientOnly>
                <Bread />
              </ClientOnly>
            </div>
            <div className="absolute top-4 right-4" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <LanguageToggle />
              <NotificationBell />
              <ModeToggle />
            </div>
          </header>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Chatbot />
          </ThemeProvider>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
