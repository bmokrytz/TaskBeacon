import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Task, TaskUpdate } from '@/lib/api/tasks';
import { updateTask } from '@/lib/api/tasks';
import { toDateInputValue } from '@/lib/utils/format';

export default function EditTaskPanel({task}: {task: Task}) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [status, setStatus] = useState(task.status);
    const [dueDate, setDueDate] = useState(task.due_date);
    const [showTitleRequired, setShowTitleRequired] = useState<boolean>(false);

    const navigate = useNavigate();
    const fieldBoxClassName = "flex flex-col mb-4 w-full";
    const labelClassName = "text-black font-semibold mb-3";
    const textInputClassName = "border border-gray-300 p-2 mb-2 rounded-lg";
    const errorMsgClass = 'text-red-500 text-sm mb-3'
    const dateInputValue = toDateInputValue(dueDate);
    const titleMaxChars = 120;
    const descriptionMaxChars = 400;

    async function submitHandler() {
        if (title.length === 0) {
            setShowTitleRequired(true);
            return;
        }
        const changes: TaskUpdate = {};
        if (title !== task.title) changes.title = title;
        if (description !== task.description) changes.description = description ?? undefined;
        if (status !== task.status) changes.status = status;
        if (dueDate !== task.due_date) changes.due_date = dueDate ?? undefined;
        const updatedTask = await updateTask(task.id, changes);
        if (updatedTask === null) console.error('Error updating task.');
        navigate('/dashboard');
    }

    return (
        <div className="flex flex-row flex-1 h-full items-center justify-center bg-gray-100">
            <div className="-translate-y-20 bg-white w-auto min-w-150 h-auto min-h-100 p-10 flex flex-col rounded-2xl shadow-gray-300 shadow-[0_0_20px_var(--tw-shadow-color)] border border-gray-300">
                <form className="flex flex-col gap-3" onSubmit={(e) => {
                                e.preventDefault();
                                submitHandler();
                            }}>
                    <div className="w-full items-center mb-3">
                        <p className="text-2xl font-bold text-black">Edit Task</p>
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className={fieldBoxClassName}>
                            <div className='flex flex-row gap-5 items-center'>
                                <label className={labelClassName}>
                                    Title:<span className={showTitleRequired ? 'text-red-500 pl-1' : 'hidden'}>*</span>
                                </label>
                                <p className={showTitleRequired ? errorMsgClass : 'hidden'}>
                                    A title is required.
                                </p>
                            </div>
                            <div className='flex flex-row items-center gap-3'>
                                <input
                                    type="text"
                                    placeholder="you@example.com"
                                    maxLength={titleMaxChars}
                                    className={`${textInputClassName} w-full`}
                                    value={title}
                                    onChange={(e) => {setTitle(e.target.value)}}
                                />
                                <p className={title.length === titleMaxChars ? 'text-red-500 self-end' : 'self-end'}>
                                    {title.length}/{titleMaxChars}
                                </p>
                            </div>
                        </div>
                        <div className={fieldBoxClassName}>
                            <label className={labelClassName}>
                                Description:
                            </label>
                            <div className='flex flex-row items-center gap-3'>
                                <textarea
                                    placeholder='—'
                                    className={`${textInputClassName} resize-y w-full`}
                                    maxLength={descriptionMaxChars}
                                    value={description ? description : ''}
                                    onChange={(e) => {setDescription(e.target.value)}}
                                />
                                <p className={description && description.length === descriptionMaxChars ? 'text-red-500 self-end' : 'self-end'}>
                                    {description ? description.length : 0}/{descriptionMaxChars}
                                </p>
                            </div>
                        </div>
                        <div className='flex flex-row mb-4 w-4/5 items-center gap-3 py-3'>
                            <label className={labelClassName}>
                                Status:
                            </label>
                            <select 
                                className='border border-gray-300 rounded-lg p-1' 
                                value={status} 
                                onChange={(e) => {setStatus(e.target.value as "pending" | "in_progress" | "completed");}}>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className='flex flex-row mb-4 items-center gap-3 py-3'>
                            <label className={labelClassName}>
                                Due Date:
                            </label>
                            <input
                                type="date"
                                className={textInputClassName}  
                                value={dateInputValue ?? undefined}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex self-center w-4/5">
                        <button
                            type="submit"
                            className="bg-button-primary hover:bg-button-hover hover:cursor-pointer text-white text-xl mr-8 font-semibold px-4 py-2 mt-3 rounded-lg"
                        >Update</button>
                        <button
                            onClick={() => {navigate('/dashboard')}}
                            className="bg-red-500 hover:bg-red-800 hover:cursor-pointer text-white text-xl mr-8 font-semibold px-4 py-2 mt-3 rounded-lg"
                        >Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}