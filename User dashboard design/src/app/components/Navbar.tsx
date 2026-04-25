import { Search, Plus, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-semibold">DA</span>
              </div>
              <span className="hidden font-semibold sm:inline-block">DataAI</span>
            </div>

            <div className="hidden items-center gap-6 md:flex">
              <a href="#" className="text-sm text-foreground/80 transition-colors hover:text-foreground">
                Dashboard
              </a>
              <a href="#" className="text-sm text-foreground/80 transition-colors hover:text-foreground">
                Projects
              </a>
              <a href="#" className="text-sm text-foreground/80 transition-colors hover:text-foreground">
                Analytics
              </a>
              <a href="#" className="text-sm text-foreground/80 transition-colors hover:text-foreground">
                Settings
              </a>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-4 md:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="w-full bg-muted/50 pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button className="hidden gap-2 sm:flex">
              <Plus className="h-4 w-4" />
              New Project
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
