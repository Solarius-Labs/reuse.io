
// src/components/ui/Navbar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "~/lib/utils";
import { 
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle 
} from "~/components/ui/navigation-menu";
import { Home, LineChart, MessageSquare } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;
  
  return (
    <div className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl font-bold text-primary">Auction Chat</span>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/" passHref>
                    <NavigationMenuLink 
                      className={cn(
                        navigationMenuTriggerStyle(),
                        isActive('/') && "bg-accent text-accent-foreground"
                      )}
                    >
                      Home
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/auction" passHref>
                    <NavigationMenuLink 
                      className={cn(
                        navigationMenuTriggerStyle(),
                        isActive('/auction') && "bg-accent text-accent-foreground"
                      )}
                    >
                      Auctions
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/chat" passHref>
                    <NavigationMenuLink 
                      className={cn(
                        navigationMenuTriggerStyle(),
                        isActive('/chat') && "bg-accent text-accent-foreground"
                      )}
                    >
                      Chat
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="md:hidden border-t">
        <div className="grid grid-cols-3">
          <Link 
            href="/"
            className={cn(
              "flex flex-col items-center py-2 px-1 text-xs",
              isActive('/') ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Home className="h-5 w-5 mb-1" />
            <span>Home</span>
          </Link>
          <Link 
            href="/auction"
            className={cn(
              "flex flex-col items-center py-2 px-1 text-xs",
              isActive('/auction') ? "text-primary" : "text-muted-foreground"
            )}
          >
            <LineChart className="h-5 w-5 mb-1" />
            <span>Auctions</span>
          </Link>
          <Link 
            href="/chat"
            className={cn(
              "flex flex-col items-center py-2 px-1 text-xs",
              isActive('/chat') ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MessageSquare className="h-5 w-5 mb-1" />
            <span>Chat</span>
          </Link>
        </div>
      </div>
    </div>
  );
}