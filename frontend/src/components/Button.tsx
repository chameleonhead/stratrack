import { ReactNode } from "react";
import { cn } from "../utils";

export type ButtonProps = {
  children: ReactNode;
  type: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick: () => void;
};

const baseStyles =
  "inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variantStyles: Record<string, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400",
  outline: "border border-gray-300 text-gray-800 hover:bg-gray-50 focus:ring-gray-400",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
};

const sizeStyles: Record<string, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? "w-full" : null
      )}
      type={type}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 mr-2 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}

export default Button;
