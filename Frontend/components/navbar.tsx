"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Menu, X, Moon, Sun, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface NavbarProps {
  onCategoryChange: (category: string) => void
  currentCategory: string
}

export function Navbar({ onCategoryChange, currentCategory }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { setTheme, theme } = useTheme()

  const categories = [
    { id: "stocks", label: "Stocks" },
    { id: "forex", label: "Forex" },
    { id: "crypto", label: "Crypto" },
  ]

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>

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
            <span className="hidden font-bold sm:inline-block">FinanceView</span>
          </Link>
        </div>

        <div
          className={cn(
            "absolute left-0 top-full w-full bg-background md:static md:w-auto",
            isMenuOpen ? "block" : "hidden md:block",
          )}
        >
          <div className="container flex flex-col items-start p-4 md:flex-row md:items-center md:p-0">
            <div className="flex w-full items-center justify-between space-x-2 md:w-auto">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={currentCategory === category.id ? "default" : "ghost"}
                  onClick={() => {
                    onCategoryChange(category.id)
                    setIsMenuOpen(false)
                  }}
                  className="justify-start"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center space-x-2">
          <div className="hidden md:flex md:w-80">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search symbols..."
                className="w-full rounded-md bg-background pl-8 md:w-[200px] lg:w-[300px]"
              />
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
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
  )
}
