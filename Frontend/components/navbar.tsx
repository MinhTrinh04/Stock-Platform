"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, Moon, Sun, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onCategoryChange: (category: string) => void;
  currentCategory: string;
}

export function Navbar({ onCategoryChange, currentCategory }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { setTheme, theme } = useTheme();

  const categories = [
    { id: "stocks", label: "Stocks" },
    { id: "forex", label: "Forex" },
    { id: "crypto", label: "Crypto" },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-x-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
            <span className="hidden font-bold sm:inline-block">
              FinanceView
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-x-4 mx-auto">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={currentCategory === category.id ? "default" : "ghost"}
              onClick={() => {
                onCategoryChange(category.id);
                setIsMenuOpen(false);
              }}
              className="justify-start"
            >
              {category.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
