import React from "react";
import { ArrowRight, Wallet, Users, CheckCircle, CheckCircleIcon } from "lucide-react";

import { useNavigate } from "react-router-dom";
import TaskCard from "./tasks/TaskCard";
import { mockAds } from "@/lib/utils";
import Header from "./ui/NavBar";

const features = [
	{
		title: "Complete Tasks",
		details:
			"Earn rewards by completing simple tasks and activities on our platform.",
		icon: CheckCircle,
	},
	{
		title: "Refer Friends",
		details:
			"Share your referral link and earn when your friends join and complete tasks.",
		icon: Users,
	},
	{
		title: "Instant Withdrawals",
		details:
			"Withdraw your earnings instantly or use them for airtime and data purchases.",
		icon: Wallet,
	},
];

export const LandingHero: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
			<Header />
			<div className='relative overflow-hidden'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24'>
					<div className='text-center'>
						<h1 className='text-4xl md:text-6xl font-bold text-white mb-6'>
							Earn Rewards for Your{" "}
							<span className='text-indigo-500'>
								Digital Impact
							</span>
						</h1>
						<p className='text-xl text-gray-400 mb-8 max-w-2xl mx-auto'>
							Join our platform to discover exciting tasks, share
							content, and earn rewards while making a difference
							in the digital world.
						</p>
						<div className='flex justify-center gap-4'>
							<button
								className='bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium flex items-center'
								onClick={() => navigate("/login")}>
								Get Started{" "}
								<ArrowRight className='ml-2 w-5 h-5' />
							</button>
							<button
								className='border border-gray-600 hover:border-gray-500 text-gray-300 px-8 py-3 rounded-lg font-medium'
								onClick={() => navigate("/about")}>
								Learn More
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
					{features.map((feature, index) => (
						<div
							key={index}
							className='bg-gray-800/50 p-6 rounded-lg border border-gray-700'>
							<div className='bg-indigo-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4'>
								<feature.icon className='w-6 h-6 text-indigo-500' />
							</div>
							<h3 className='text-xl font-bold text-white mb-2'>
								{feature.title}
							</h3>
							<p className='text-gray-400'>{feature.details}</p>
						</div>
					))}
				</div>
			</div>

			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
				<div className='text-center mb-12'>
					<h2 className='text-3xl font-bold text-white mb-4'>
						Featured Tasks
					</h2>
					<p className='text-gray-400 max-w-2xl mx-auto'>
						Discover high-reward opportunities from top brands and
						businesses looking for digital creators like you.
					</p>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto'>
					{mockAds.slice(0, 9).map((task) => (
						<div className="border-gray-700 border bg-[var(--card-bg-dark)] text-white dark:text-[var(--text-primary)] min-w-[300px] max-w-[400px] rounded-xl shadow-md p-6 space-y-4 mx-auto">
						<div className="flex justify-between items-start">
						  <h3 className="text-xl font-semibold  text-white">{task.title}</h3>
						  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
							₦{task.reward}
						  </span>
						</div>
						
						<div className="flex items-center space-x-2">
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Inactive
        </span>
						</div>
						
						<p className="text-[var(--text-primary)] dark:text-[var(--text-primary)] text-md">{task.description}</p>
						
						<div className="space-y-3">
						  {task.requirements && task.requirements.length > 0 && (
							<div>
							  <h4 className="text-md font-medium text-gray-900">Requirements:</h4>
							  <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
								{task.requirements.map((req, index) => (
								  <li key={index}>{req}</li>
								))}
							  </ul>
							</div>
						  )}
						
						  {task.completionSteps && task.completionSteps.length > 0 && (
							<div>
							  <h4 className="text-sm font-medium text-gray-900">Steps:</h4>
							  <ol className="mt-2 list-decimal list-inside text-sm text-gray-600">
								{task.completionSteps.map((step, index) => (
								  <li key={index}>{step}</li>
								))}
							  </ol>
							</div>
						  )}
						</div>
						
						<button
						 disabled={!task.isActive}
						  className="w-full mt-4 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
						  {!task.isActive ? (
							"Task Inactive"
						  ) : (
							"Start Task"
						  )}
						</button>
						</div>
					))}
				</div>
				<div className='text-center mt-12'>
					<button className='bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium inline-flex items-center' onClick={() => navigate("/login")}>
						View All Tasks <ArrowRight className='ml-2 w-5 h-5' />
					</button>
				</div>
			</div>
		</div>
	);
};
