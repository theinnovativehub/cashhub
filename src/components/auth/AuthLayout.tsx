import React from "react";
import BackButton from "../ui/BackButton";
import { useAuth } from "@/supabase_hooks/useAuth";
import { Navigate } from "react-router-dom";

interface AuthLayoutProps {
	children: React.ReactNode;
	title: string;
	subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
	children,
	title,
	subtitle,
}) => {
	const { user } = useAuth();
	return (
		<>
			{user && user?.email !== "" && (
				<Navigate to='/overview' />
			)}
			<div className='min-h-screen h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8'>
				<BackButton />
				<div className='max-w-md w-full space-y-8'>
					<div className='text-center'>
						<h2 className='text-3xl font-bold text-gray-200 mb-2'>
							{title}
						</h2>
						{subtitle && (
							<p className='text-gray-400 text-sm'>
								{subtitle}
							</p>
						)}
					</div>
					<div className='bg-white/10 backdrop-blur-md border border-gray-700 rounded-xl shadow-lg p-6 sm:p-8'>
						{children}
					</div>
				</div>
			</div>
		</>
	);
};

export default AuthLayout;
