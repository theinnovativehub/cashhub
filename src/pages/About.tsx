import { Info } from "lucide-react";
import React from "react";

import { Wallet } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

const breakdownItems = [
	{
		label: "REGISTRATION FEE",
		value: "FREE",
		description:
			"ONE REGISTRATION AND YOU ARE EXPECTED TO REFER AND PERFORM DAILY TASKS",
	},
	{ label: "VIP PLAN", value: "₦1,000", description: "VIP MEMBERSHIP" },
	{ label: "TASKS DAILY VALUE", value: "₦500 and Above", description: "After Registering for VIP you get ₦1000 as VIP Membership Bonus" },
	{ label: "REEFERRAL BONUS", value: "₦500 as Normal User, ₦800 as VIP", description: "As a normal user, you will get ₦500 for every referral. As a VIP user, you will get ₦800 for every referral, And if your referral gets a VIP membership, you will get ₦2000 for that user" },
	
];

const withdrawalRules = [
	{
		title: "Activities Earnings",
		requirement: "Minimum of ₦1000 required",
	},
	{
		title: "Referral Earnings",
		requirement: "Minimum of ₦5000 required",
	},
];

const AboutPage: React.FC = () => {
	return (
		<div className='min-h-screen bg-gray-900'>
			<BackButton />
			<div className='bg-gradient-to-r from-indigo-900 via-blue-900 to-purple-900 text-white py-20'>
				<div className='container mx-auto px-6'>
					<div className='flex items-center justify-center space-x-4'>
						<Info
							size={40}
							className='text-indigo-400'
						/>
						<h1 className='text-4xl font-bold text-indigo-200'>
							What is CashHub?
						</h1>
					</div>
					<p className='mt-6 text-xl text-center max-w-3xl mx-auto leading-relaxed text-gray-300'>
						CashHub is a platform that helps you make money by
						completing tasks and sharing your content. It's a
						platform that rewards you for your actions.
					</p>
				</div>
			</div>

			<div className='bg-gray-900 py-16'>
				<div className='container mx-auto px-6'>
					<h2 className='text-3xl font-bold text-center text-indigo-400 mb-12'>
						Breakdown on How CashHub Works
					</h2>
					<div className='grid md:grid-cols-2 gap-8'>
						{breakdownItems.map((item, index) => (
							<div
								key={index}
								className='bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-indigo-900'>
								<h3 className='text-lg font-semibold text-indigo-400'>
									{item.label}
								</h3>
								<p className='text-2xl font-bold text-purple-400 mt-2'>
									{item.value}
								</p>
								{item.description && (
									<p className='text-sm text-gray-400 mt-2'>
										{item.description}
									</p>
								)}
							</div>
						))}
					</div>
				</div>
			</div>

			<div className='bg-gray-800 py-16'>
				<div className='container mx-auto px-6'>
					<div className='flex items-center justify-center mb-10'>
						<Wallet
							className='text-indigo-400 mr-3'
							size={32}
						/>
						<h2 className='text-3xl font-bold text-indigo-400'>
							Withdrawal on CashHub
						</h2>
					</div>

					<div className='grid md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
						{withdrawalRules.map((rule, index) => (
							<div
								key={index}
								className='bg-gray-900 p-6 rounded-xl shadow-lg border border-indigo-800'>
								<h3 className='text-xl font-semibold text-blue-400 mb-3'>
									{rule.title}
								</h3>
								<p className='text-gray-300'>
									{rule.requirement}
								</p>
							</div>
						))}
					</div>

					<p className='text-center mt-10 text-lg text-indigo-400 font-medium'>
						All your earnings will be paid straight to your bank
						account after placing your withdrawal
					</p>
				</div>
			</div>
		</div>
	);
};

export default AboutPage;
