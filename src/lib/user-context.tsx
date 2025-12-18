"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import bcrypt from "bcryptjs";

export interface User {
  id: string;
  phone: string;
  name: string;
  address: string;
  created_at: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  loginOrSignup: (phone: string, password: string, name?: string, address?: string) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => void;
  updateUser: (name: string, address: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("checkCheckUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing stored user:", err);
      }
    }
  }, []);

  const loginOrSignup = async (phone: string, password: string, name?: string, address?: string) => {
    setIsLoading(true);
    try {
      if (!supabase) {
        return { success: false, message: "Database not configured" };
      }

      // Check if user exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("*")
        .eq("phone", phone)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is "no rows" error - which is expected for new users
        console.error("Error checking user:", checkError);
        return { success: false, message: "Error checking user account" };
      }

      if (existingUser) {
        // User exists
        // If trying to create a new account with this phone, reject
        if (name || address) {
          return { success: false, message: "This phone number is already registered. Please log in instead." };
        }

        // Otherwise, verify password for login
        const passwordMatch = await bcrypt.compare(password, existingUser.password_hash);
        
        if (!passwordMatch) {
          return { success: false, message: "Invalid password" };
        }

        // Login successful
        const userData: User = {
          id: existingUser.id,
          phone: existingUser.phone,
          name: existingUser.name,
          address: existingUser.address,
          created_at: existingUser.created_at,
        };
        
        setUser(userData);
        localStorage.setItem("checkCheckUser", JSON.stringify(userData));
        return { success: true, message: "Logged in successfully", user: userData };
      } else {
        // New user - create account
        if (!name || !address || !password) {
          return { success: false, message: "Name, address, and password required for new account" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUserData = {
          phone,
          name,
          address,
          password_hash: hashedPassword,
        };

        const { data: createdUser, error: createError } = await supabase
          .from("users")
          .insert([newUserData])
          .select()
          .single();

        if (createError) {
          console.error("Error creating user:", createError);
          // Handle unique constraint error
          if (createError.code === "23505") {
            return { success: false, message: "This phone number is already registered. Please log in instead." };
          }
          return { success: false, message: `Error creating account: ${createError.message}` };
        }

        const userData: User = {
          id: createdUser.id,
          phone: createdUser.phone,
          name: createdUser.name,
          address: createdUser.address,
          created_at: createdUser.created_at,
        };

        setUser(userData);
        localStorage.setItem("checkCheckUser", JSON.stringify(userData));
        return { success: true, message: "Account created successfully", user: userData };
      }
    } catch (err) {
      console.error("Error in loginOrSignup:", err);
      return { success: false, message: "An error occurred" };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("checkCheckUser");
  };

  const updateUser = async (name: string, address: string) => {
    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .update({ name, address })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedUser: User = {
        id: data.id,
        phone: data.phone,
        name: data.name,
        address: data.address,
        created_at: data.created_at,
      };

      setUser(updatedUser);
      localStorage.setItem("checkCheckUser", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Error updating user:", err);
      throw err;
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoading, loginOrSignup, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
