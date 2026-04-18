import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface ThemeToggleProps {
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({
  variant = "ghost",
  size = "sm",
  className = "",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme, switchable } = useTheme();

  if (!switchable || !toggleTheme) return null;

  const isDark = theme === "dark";
  const label = isDark ? "Switch to Daylight View" : "Switch to Night View";

  if (showLabel) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={toggleTheme}
        className={`gap-2 ${className}`}
        aria-label={label}
      >
        {isDark ? (
          <Sun className="size-4 text-amber-400" />
        ) : (
          <Moon className="size-4 text-indigo-500" />
        )}
        <span className="text-sm">{isDark ? "Daylight" : "Night"}</span>
      </Button>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={toggleTheme}
            className={`relative overflow-hidden ${className}`}
            aria-label={label}
          >
            <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0 text-amber-500" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100 text-indigo-300" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
