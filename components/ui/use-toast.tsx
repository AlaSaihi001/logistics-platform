import type React from "react";
// This is a simplified version just to make the toast work in the example
import { toast as sonnerToast } from "sonner";

// Toast function to trigger a toast notification
export function toast({
  title,
  description,
  action,
  variant,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
}) {
  return sonnerToast(title, {
    description,
    action,
    style:
      variant === "destructive"
        ? {
            background: "hsl(var(--destructive))",
            color: "hsl(var(--destructive-foreground))",
          }
        : {},
  });
}

// Add useToast hook to provide toast and dismiss functions
export const useToast = () => {
  return {
    toast,
    dismiss: (toastId?: string) => {
      // If sonner has a dismiss function, use it
      if (typeof sonnerToast.dismiss === "function") {
        sonnerToast.dismiss(toastId);
      }
    },
  };
};

// Toaster component to render the toast notifications
import { Toaster as SonnerToaster } from "sonner"; // Importing the Toaster component from Sonner

export const Toaster = () => {
  return (
    <div
      id="toast-container"
      style={{
        position: "fixed",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        maxWidth: "100%",
        pointerEvents: "none",
      }}
    >
      {/* Using SonnerToaster directly */}
      <SonnerToaster />
    </div>
  );
};
