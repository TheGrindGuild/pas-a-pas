"use client";

import { Video } from "lucide-react";
import { ACTIVITY_NAMES, type Gender, WordPicture } from "./activities/shared";
import type { Theme } from "./activities/data";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar
} from "./ui/sidebar";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const ACTIVITY_ICONS: Record<string, string> = {
  ecoute: "🔊",
  lis: "📖",
  trouve: "🔎",
  trace: "✍️",
  colorie: "🎨",
  trie: "🗂️",
  points: "🔵",
  associe: "🔗",
  memoire: "🃏",
  phrase: "💬",
  jacques: "🏃",
  manque: "❔",
  lettre: "🔤",
  enregistre: "🎙️"
};

type Props = {
  activityId: string;
  theme: Theme;
  themes: Theme[];
  gender: Gender;
  onThemeChange: (theme: Theme) => void;
};

export default function AppSidebar({ activityId, theme, themes, gender, onThemeChange }: Props) {
  const { isMobile, setOpenMobile } = useSidebar();
  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <div className="sidebar-header-row">
          <a className="brand sidebar-brand" href="#" aria-label="Pas à pas — accueil" onClick={closeMobile}>
            <svg className="brand-mark brand-mark-default" width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
              <rect x="1" y="1" width="38" height="38" rx="11" fill="var(--teal)" />
              <ellipse cx="14" cy="24" rx="5" ry="7.5" fill="#fff" />
              <circle cx="11.5" cy="14" r="1.8" fill="#fff" />
              <circle cx="15.5" cy="13.5" r="1.6" fill="#fff" />
              <ellipse cx="26.5" cy="18" rx="5" ry="7.5" fill="var(--sun)" />
              <circle cx="24" cy="8" r="1.8" fill="var(--sun)" />
              <circle cx="28" cy="7.5" r="1.6" fill="var(--sun)" />
            </svg>
            <img className="brand-mark brand-mark-halloween" src={`${BASE_PATH}/favicon-halloween.svg`} alt="" />
            <span>
              <b>Pas à pas</b>
              <small>Français de base · 4<sup>e</sup>–5<sup>e</sup> année</small>
            </span>
          </a>
          <SidebarTrigger className="sidebar-collapse-trigger" aria-label="Réduire ou agrandir le menu" />
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Activités</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Object.entries(ACTIVITY_NAMES).map(([id, name]) => (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton
                    asChild
                    isActive={activityId === id}
                    tooltip={name}
                  >
                    <a href={`#${id}`} onClick={closeMobile}>
                      <span aria-hidden="true">{ACTIVITY_ICONS[id]}</span>
                      <span>{name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Thèmes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {themes.map(item => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    type="button"
                    isActive={theme.id === item.id}
                    tooltip={item.name}
                    onClick={() => {
                      onThemeChange(item);
                      closeMobile();
                    }}
                  >
                    <span className="sidebar-theme-icon" aria-hidden="true">
                      <WordPicture word={item.words[item.id === "nombres" ? 5 : 0]} gender={gender} />
                    </span>
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Vidéos">
              <a href="#videos" onClick={closeMobile}>
                <Video aria-hidden="true" />
                <span>Vidéos</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
