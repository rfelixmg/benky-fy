'use client';

import { Button } from "@/components/ui/button";
import { User, Settings } from "lucide-react";
import Link from "next/link";
import { UserMenuProps } from "./types";

export function UserMenu({ onProfileClick, onSettingsClick }: UserMenuProps) {
  return (
    <div className="hidden md:flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onProfileClick}
        className="hover:bg-accent/50"
      >
        <User className="w-4 h-4 mr-2" />
        Profile
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onSettingsClick}
        className="hover:bg-accent/50"
      >
        <Settings className="w-4 h-4" />
      </Button>
    </div>
  );
}
