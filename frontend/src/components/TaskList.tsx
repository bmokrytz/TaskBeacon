import { useState, useContext } from 'react';
import type { Task, TaskUpdate } from '@/lib/api/tasks';
import { formatDate } from '@/lib/utils/format';
import { updateTask, setTaskStatus, deleteTask } from '@/lib/api/tasks';
import { EnableDeleteContext } from '@/context';

const cellClass = 'min-h-24 align-middle py-3 px-2';
//const innerCellClass = 'border-l border-gray-300 px-3';
const buttonClass = 'border rounded-lg p-2 text-xs hover:cursor-pointer';

export default function TaskList({ taskList, onTaskDeleted }: { taskList: Task[], onTaskDeleted: (id: Task['id']) => void }) {
    return (
        <div className="flex flex-col flex-1 items-center">
            <div className="w-full bg-white rounded-2xl shadow-md overflow-x-auto border border-gray-300">
                <table className="min-w-full border-collapse border-gray-300 table-fixed">
                    <thead>
                        <tr className="bg-gray-100 text-left border-gray-300 border-b">
                            <th className={`${cellClass} pl-5 w-1/4`}>Title</th>
                            <th className='w-1/4'>Description</th>
                            <th className='w-1/8'>Status</th>
                            <th className='w-1/8'>Due Date</th>
                            <th className='w-1/8'>Created</th>
                            <th className='w-2/8'>Actions</th>
                        </tr>
                            
                    </thead>
                    <tbody className='text-sm'>
                        {taskList.map((task, index) => (
                            <TaskItem key={task.id} task={task} index={index} onDeleted={onTaskDeleted} />
                            
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TaskItem({ task, index, onDeleted }: { task: Task, index: number, onDeleted: (id: Task['id']) => void }) {
    const [loadTask, setLoadTask] = useState(task);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [status, setStatus] = useState(task.status);
    const [dueDate, setDueDate] = useState(task.due_date);
    const enableDeleteContext = useContext(EnableDeleteContext);
    
    const titleClass = `${cellClass} max-w-20 pl-5`;
    const background = index % 2 === 0 ? "bg-gray-100" : "bg-white";
    const dueDateFormatted = dueDate ? formatDate(dueDate) : null;
    const creationDate = formatDate(task.created_at);

    async function updateTaskStatusHandler(status: "pending" | "in_progress" | "completed") {
        try {
            const updatedTask = await setTaskStatus(task.id, status);
            if (updatedTask !== null) {
                setLoadTask(updatedTask);
                setStatus(updatedTask.status);
            }

        } catch(error) {
            console.error("Something went wrong. Try again later.");
        }
    }

    async function taskUpdateHandler() {
        const changes: TaskUpdate = {};
        if (title !== loadTask.title) changes.title = title;
        if (description !== loadTask.description) changes.description = description ?? undefined;
        if (status !== loadTask.status) changes.status = status;
        if (dueDate !== loadTask.due_date) changes.due_date = dueDate ?? undefined;
        if (Object.keys(changes).length === 0) return;
        const updatedTask = await updateTask(task.id, changes);
        if (updatedTask !== null) {
            setLoadTask(updatedTask);
            setTitle(updatedTask.title);
            setDescription(updatedTask.description);
            setStatus(updatedTask.status);
            setDueDate(updatedTask.due_date);
        }
    }

    async function deleteTaskHandler() {
        const result = await deleteTask(task.id);
        if (!result) return;
        onDeleted(task.id);
    }

    return (
        <tr className={`border-b border-gray-300 ${background}`}>
            <td className={titleClass}>{title}</td>
            {description === null ? (
                <td>—</td>
            ) : (
                <td className='pr-1 overflow-hidden'>{description}</td>
            )}
            {
                status === "completed" ? (
                    <td className='text-status-completed'>{status}</td>
                ) : status === "in_progress" ? (
                    <td className='text-status-in-progress'>in progress</td>
                ) : (
                    <td>{status}</td>
                )
            }
            {dueDateFormatted === null ? (
                <td>—</td>
            ) : (
                <td>{dueDateFormatted}</td>
            )}
            <td>{creationDate}</td>
            <td>
                <div className='flex flex-row gap-2 pr-1'>
                    {
                        status === "pending" ? (
                            <button className={`${buttonClass} text-black bg-status-in-progress hover:bg-button-hover`} onClick={() => {updateTaskStatusHandler("in_progress")}}>
                                In Progress
                            </button>
                        ) : (
                            <button className={`${buttonClass} text-black bg-status-completed hover:bg-button-hover`} onClick={() => {updateTaskStatusHandler("completed")}}>
                                Complete
                            </button>
                        )
                    }
                    
                    <button className={`${buttonClass} bg-white hover:bg-gray-200 border border-gray-400`}>
                        Edit</button>
                    <button 
                        onClick={deleteTaskHandler}
                        className={enableDeleteContext.enableDelete ? `${buttonClass} text-white bg-red-400 hover:bg-red-800` : 'hidden'}>
                        Delete</button>
                </div>
            </td>
        </tr>
    );
}


/*
export type Task = {
    id: number;
    title: string;
    description?: string | null;
    status: "pending" | "in_progress" | "completed";
    due_date?: string | null;
    created_at: string;
    updated_at?: string | null;
};
*/