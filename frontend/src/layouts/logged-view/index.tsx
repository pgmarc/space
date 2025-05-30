import React, { useState } from "react";
import LightBackground from "@/layouts/background";
import Sidebar from "./components/sidebar";

interface LoggedLayoutProps {
  readonly children: React.ReactNode;
}

export default function LoggedLayout({ children }: LoggedLayoutProps) {
  
  const [collapsed, setCollapsed] = useState(false);
    
    return (
      <LightBackground>
        <div className="flex w-full min-h-screen">
          <div className={`flex-1 pr-0 md:pl-[${collapsed ? 64 : 280}px] transition-all duration-300`}>
            {children}
          </div>
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed}/>
        </div>
      </LightBackground>
    );
}
