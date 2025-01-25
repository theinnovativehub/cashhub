import React from "react";
import Task from "@/types/index";
import TaskCard from "./TaskCard";

interface TaskListProps {
	tasks: Task[];
	onTaskComplete: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
	tasks,
	onTaskComplete,
}) => {
	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
			{tasks.map((task) => (
				<TaskCard
					key={task.id}
					task={task}
					onComplete={onTaskComplete}
				/>
			))}
		</div>
	);
};
