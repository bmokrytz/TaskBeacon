import { useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import type { Task } from '@/lib/api/tasks';
import { formatDate } from '@/lib/utils/format';
import { setTaskStatus, deleteTask } from '@/lib/api/tasks';
import { EnableDeleteContext } from '@/context';

const cellClass = 'min-h-24 align-middle py-3 px-2';
//const innerCellClass = 'border-l border-gray-300 px-3';
const buttonClass = 'border rounded-lg p-2 text-[11px] hover:cursor-pointer w-max h-max';

export default function TaskList({ taskList, onTaskDeleted }: { taskList: Task[], onTaskDeleted: (id: Task['id']) => void }) {
    return (
        <div className="flex flex-col flex-1 items-center">
            <div className="w-full bg-white rounded-2xl shadow-md overflow-x-auto border border-gray-300">
                <table className="min-w-full border-collapse border-gray-300 table-fixed">
                    <thead>
                        <tr className="bg-gray-100 text-left border-gray-300 border-b">
                            <th className={`${cellClass} pl-5 w-1/4`}>Title</th>
                            <th className='w-3/8'>Description</th>
                            <th className='w-max'>Status</th>
                            <th className='w-max'>Due Date</th>
                            <th className='w-max'>Created</th>
                            <th className='w-max'>Actions</th>
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
    
    const enableDeleteContext = useContext(EnableDeleteContext);

    const navigate = useNavigate();
    
    const titleClass = `${cellClass} max-w-20 pl-5`;
    const background = index % 2 === 0 ? "bg-gray-100" : "bg-white";
    const dueDateFormatted = loadTask.due_date ? formatDate(loadTask.due_date) : null;
    const creationDate = formatDate(task.created_at);

    async function updateTaskStatusHandler(status: "pending" | "in_progress" | "completed") {
        try {
            const updatedTask = await setTaskStatus(task.id, status);
            if (updatedTask !== null) {
                setLoadTask(updatedTask);
            }

        } catch(error) {
            console.error("Something went wrong. Try again later.");
        }
    }

    async function deleteTaskHandler() {
        const result = await deleteTask(task.id);
        if (!result) return;
        onDeleted(task.id);
    }

    return (
        <tr className={`border-b border-gray-300 ${background}`}>
            <td className={titleClass}>{loadTask.title}</td>
            {loadTask.description === null ? (
                <td>—</td>
            ) : (
                <td className='pr-3 overflow-hidden'>{loadTask.description}</td>
            )}
            {
                loadTask.status === "completed" ? (
                    <td className='text-status-completed-text font-semibold'>
                        Completed
                    </td>
                ) : loadTask.status === "in_progress" ? (
                    <td className='text-status-in-progress-text font-semibold'>
                        In Progress
                    </td>
                ) : (
                    <td>
                        Pending
                    </td>
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
                        loadTask.status === "pending" ? (
                            <button className={`${buttonClass} text-black bg-status-in-progress hover:bg-button-hover`} onClick={() => {updateTaskStatusHandler("in_progress")}}>
                                In Progress
                            </button>
                        ) : loadTask.status === "in_progress" ? (
                            <button className={`${buttonClass} text-black bg-status-completed hover:bg-button-hover`} onClick={() => {updateTaskStatusHandler("completed")}}>
                                Complete
                            </button>
                        ) : (
                            <></>
                        )
                    }
                    
                    <button 
                        onClick={() => {navigate(`/edit/${task.id}`)}}
                        className={`${buttonClass} bg-white hover:bg-gray-200 border border-gray-400`}>
                        Edit</button>
                    <button 
                        onClick={deleteTaskHandler}
                        className={(loadTask.status === "completed" || enableDeleteContext.enableDelete) ? `${buttonClass} text-white bg-red-400 hover:bg-red-800` : 'hidden'}>
                        Delete</button>
                </div>
            </td>
        </tr>
    );
}
