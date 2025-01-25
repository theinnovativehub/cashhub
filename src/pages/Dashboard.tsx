import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TaskList } from "@/components/tasks/TaskList";
import { dummyAds } from "@/lib/utils";

// const mockTasks = [
// 	{
// 		id: "1",
// 		title: "Complete Profile Survey",
// 		description:
// 			"Answer a few questions about yourself to help us personalize your experience.",
// 		reward: 5,
// 		status: "new" as const,
// 		category: "Survey",
// 	},
// 	{
// 		id: "2",
// 		title: "Watch Product Demo",
// 		description: "Watch a 5-minute demo video about our premium features.",
// 		reward: 3,
// 		status: "new" as const,
// 		category: "Learning",
// 	},
// 	{
// 		id: "3",
// 		title: "Refer 3 Friends",
// 		description:
// 			"Share your referral link with friends and earn when they join.",
// 		reward: 10,
// 		status: "new" as const,
// 		category: "Referral",
// 	},
// ];

export const Dashboard: React.FC = () => {
	const handleTaskComplete = (taskId: string) => {
		console.log("Task completed:", taskId);
	};

	return (
		<DashboardLayout>
			<div className='max-w-7xl mx-auto'>
				<div className='mb-8'>
					<h1 className='text-2xl font-bold text-gray-900'>
						Available Tasks
					</h1>
					<p className='text-gray-600 mt-1'>
						Complete tasks to earn rewards
					</p>
				</div>
				<TaskList
					tasks={dummyAds}
					onTaskComplete={handleTaskComplete}
				/>
			</div>
		</DashboardLayout>
	);
};
