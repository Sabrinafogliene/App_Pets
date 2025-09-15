import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Heart, 
  PawPrint, 
  Syringe, 
  Calendar, 
  Pill, 
  Scale, 
  Camera, 
  Users, 
  Settings,
  Menu,
  X
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Heart,
    color: "text-pink-500"
  },
  {
    title: "Meus Pets",
    url: createPageUrl("Pets"),
    icon: PawPrint,
    color: "text-blue-500"
  },
  {
    title: "Vacinas",
    url: createPageUrl("Vacinacoes"),
    icon: Syringe,
    color: "text-green-500"
  },
  {
    title: "Consultas",
    url: createPageUrl("Consultas"),
    icon: Calendar,
    color: "text-purple-500"
  },
  {
    title: "Medicamentos",
    url: createPageUrl("Medicamentos"),
    icon: Pill,
    color: "text-orange-500"
  },
  {
    title: "Peso",
    url: createPageUrl("Peso"),
    icon: Scale,
    color: "text-indigo-500"
  },
  {
    title: "Galeria",
    url: createPageUrl("Galeria"),
    icon: Camera,
    color: "text-teal-500"
  },
  {
    title: "Veterinários",
    url: createPageUrl("AcessoVeterinario"),
    icon: Users,
    color: "text-cyan-500"
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <style>
          {`
            :root {
              --primary: 59 130 246;
              --primary-foreground: 255 255 255;
              --secondary: 243 244 246;
              --accent: 251 207 232;
              --muted: 249 250 251;
              --border: 229 231 235;
            }
          `}
        </style>
        
        <Sidebar className="border-r border-white/50 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-white/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  PetCare+
                </h2>
                <p className="text-xs text-gray-500">Cuidando do seu melhor amigo</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Navegação
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`rounded-xl mb-1 transition-all duration-300 hover:scale-105 ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 shadow-sm' 
                            : 'hover:bg-white/60'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Configurações
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      className="rounded-xl transition-all duration-300 hover:scale-105 hover:bg-white/60"
                    >
                      <Link to={createPageUrl("Configuracoes")} className="flex items-center gap-3 px-4 py-3">
                        <Settings className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Configurações</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-white/50 p-4">
            <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">Tutor Pet</p>
                <p className="text-xs text-gray-500 truncate">Conta ativa</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-white/50 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-purple-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                PetCare+
              </h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}