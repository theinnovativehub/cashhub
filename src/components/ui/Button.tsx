import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline";
	size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
	children,
	className,
	variant = "primary",
	size = "md",
	...props
}) => {
	return (
		<button
			className={cn(
				"rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2",
				{
					"bg-gradient-to-r from-purple-400 to-indigo-400 text-white hover:from-purple-500 hover:to-indigo-500":
						variant === "primary",
					"bg-gray-100 text-gray-900 hover:bg-gray-200":
						variant === "secondary",
					"border-2 border-purple-400 text-purple-400 hover:bg-purple-50":
						variant === "outline",
					"px-4 py-2 text-sm": size === "sm",
					"px-6 py-3 text-base": size === "md",
					"px-8 py-4 text-lg": size === "lg",
				},
				className
			)}
			{...props}>
			{children}
		</button>
	);
};
