import { useNavigate } from "react-router"; 
import { useState } from "react";
import { createTask } from '@/lib/api/tasks';
import type { TaskCreate } from '@/lib/api/tasks';

export default function CreateTask() {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [status, setStatus] = useState<"pending" | "in_progress">("pending");
    const [dueDate, setDueDate] = useState<string>("");
    const [showRequired, setShowRequired] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const navigate = useNavigate();
    const fieldBoxClassName = "flex flex-col mb-4 w-full";
    const labelClassName = "text-black font-semibold mb-3";
    const textInputClassName = "border border-gray-300 p-2 mb-2 rounded-lg w-full";
    const errorMsgContainerClass = 'w-4/5 pb-3 text-sm text-red-500';
    const titleMaxChars = 120;
    const descriptionMaxChars = 400;

    async function handleCreate() {
        if (title === "") {
            setShowRequired(true);
            return;
        }
        if (description.length > 400) {
            setShowError(true);
            setErrorMsg("400 Characters Max.");
            return
        }
        const newTask: TaskCreate = { title: title, status: status };
        if (description !== "") newTask.description = description;
        if (dueDate !== "") newTask.due_date = dueDate;
        await createTask(newTask);
        navigate('/dashboard');
    }

    return (
        <div className="flex flex-row flex-1 h-full items-center justify-center bg-gray-100">
            <div className="-translate-y-20 bg-white w-auto min-w-150 h-auto min-h-100 p-10 flex flex-col rounded-2xl shadow-gray-300 shadow-[0_0_20px_var(--tw-shadow-color)] border border-gray-300">
                <form className="flex flex-col gap-3" onSubmit={(e) => {
                                e.preventDefault();
                                handleCreate();
                            }}>
                    <div className="flex flex-col">
                        <div className="w-full items-center mb-3">
                            <p className="text-2xl font-bold text-black">New Task</p>
                        </div>
                        <div className={fieldBoxClassName}>
                            <label className={labelClassName}>
                                Title: {showRequired && <span className="text-red-400">*</span>}
                            </label>
                            <div className='flex flex-row items-center gap-3'>
                                <input
                                    type="text"
                                    placeholder="you@example.com"
                                    className={textInputClassName}
                                    value={title}
                                    maxLength={titleMaxChars}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <p className={title.length === titleMaxChars ? 'text-red-500 self-end' : 'self-end'}>
                                    {title.length}/{titleMaxChars}
                                </p>
                            </div>
                        </div>
                        <div className={fieldBoxClassName}>
                            <div className="flex flex-row gap-5 items-center">
                                <label className={labelClassName}>
                                    Description:
                                </label>
                                <div className={showError ? `${errorMsgContainerClass}` : `${errorMsgContainerClass} hidden`}>
                                    <p>{errorMsg}</p>
                                </div>
                            </div>
                            <div className='flex flex-row items-center gap-3'>
                                <textarea
                                    placeholder='—'
                                    className={`${textInputClassName} resize-y`}
                                    maxLength={descriptionMaxChars}
                                    value={description ? description : ''}
                                    onChange={(e) => {setDescription(e.target.value)}}
                                />
                                <p className={description && description.length === descriptionMaxChars ? 'text-red-500 self-end' : 'self-end'}>
                                    {description ? description.length : 0}/{descriptionMaxChars}
                                </p>
                            </div>
                        </div>
                        <div className='flex flex-row mb-4 w-full items-center gap-3 py-3'>
                            <label className={labelClassName}>
                                Status:
                            </label>
                            <select
                                className='border border-gray-300 rounded-lg p-1'
                                value={status}
                                onChange={(e) => setStatus(e.target.value as "pending" | "in_progress")}
                            >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                            </select>
                        </div>
                        <div className='flex flex-row mb-4 w-full items-center gap-3 py-3'>
                            <label className={labelClassName}>
                                Due Date:
                            </label>
                            <input
                                type="date"
                                className='border border-gray-300 rounded-lg p-1' 
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex self-center w-4/5">
                        <button
                            type='submit'
                            className="bg-button-primary hover:bg-button-hover hover:cursor-pointer text-white text-xl mr-8 font-semibold px-4 py-2 mt-3 rounded-lg"
                        >Create</button>
                        <button
                            type='button'
                            className="bg-red-500 hover:bg-red-800 hover:cursor-pointer text-white text-xl mr-8 font-semibold px-4 py-2 mt-3 rounded-lg"
                            onClick={() => navigate('/dashboard')}
                        >Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
