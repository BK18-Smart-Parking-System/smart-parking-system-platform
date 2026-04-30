'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface RoleContextType {
  userRole: string;
  setUserRole: (role: string) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<string>("student");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.role) {
        setUserRole(decoded.role.toLowerCase());
      }
    }
  }, []);

  return (
    <RoleContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
