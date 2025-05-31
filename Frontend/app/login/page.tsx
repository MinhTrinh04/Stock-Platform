"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API_URL = "http://localhost:3001"; // URL của user-service

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = isLogin
        ? `${API_URL}/api/users/login`
        : `${API_URL}/api/users/register`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Store token in localStorage and cookies
      localStorage.setItem("token", data.token);
      document.cookie = `token=${data.token}; path=/`;

      // Redirect to home page
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>{isLogin ? "Login" : "Register"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Enter your credentials to login"
              : "Create a new account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full">
              {isLogin ? "Login" : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin
              ? "Need an account? Register"
              : "Already have an account? Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
