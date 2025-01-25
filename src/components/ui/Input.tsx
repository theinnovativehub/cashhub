import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
}

export const Input: React.FC<InputProps> = ({
	label,
	className,
	error,
	...props
}) => {
	return (
		<div className='space-y-1'>
			{label && (
				<label className='block text-sm font-medium text-gray-200'>
					{label}
				</label>
			)}
			<input
				className={cn(
					"block w-full rounded-lg border px-3 py-2 text-white outline-none bg-white/20 transition-all",
					error
						? "border-red-600 focus:ring-red-500 focus:border-red-600"
						: "border-gray-300 focus:ring-purple-500 focus:border-purple-500",
					className
				)}
				{...props}
			/>
			{error && <span className='text-red-600 text-xs'>{error}</span>}
		</div>
	);
};
