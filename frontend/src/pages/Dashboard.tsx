import Header from '@/components/Header';
import TaskList from '@/components/TaskList';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getTasks } from '@/lib/api/tasks';
import type { Task } from '@/lib/api/tasks';
import { EnableDeleteContext } from '@/context';
import { Trash2 } from 'lucide-react';

export default function Dashboard() {
    const [taskList, setTaskList] = useState<Task[]>([]);
    const [enableDelete, setEnableDelete] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTasks = async () => {
            const tasksData = await getTasks();
            setTaskList(tasksData);
        };
        fetchTasks();
    }, []);

    function handleTaskDeleted(taskId: Task['id']) {
        setTaskList((prev) => prev.filter((t) => t.id !== taskId));
    }

    return (
        <>
            <div className="flex flex-col h-full bg-gray-100">
                <Header />
                <div className='max-w-7xl w-7xl self-center'>
                    <div className='flex flex-row justify-end pt-10 pb-5 pr-5 gap-3'>
                        <button 
                        onClick={() => {navigate('/create')}}
                        className='bg-button-primary hover:bg-button-hover text-white hover:cursor-pointer text-sm py-1 px-3 rounded-lg'>
                            <div className='flex flex-row justify-center items-center gap-1'><span className='text-2xl'>+</span> New task</div>
                        </button>
                        <button 
                        onClick={() => {enableDelete ? setEnableDelete(false) : setEnableDelete(true)}}
                        className='border border-gray-400 bg-white hover:bg-gray-200 text-red-400 hover:cursor-pointer text-sm py-1 px-3 rounded-lg'>
                            <div className='flex flex-row justify-center items-center gap-1'><Trash2 size={16} /></div>
                        </button>
                    </div>
                    <EnableDeleteContext value={{enableDelete}}>
                        {taskList.length > 0 && <TaskList taskList={taskList} onTaskDeleted={handleTaskDeleted} />}
                    </EnableDeleteContext>
                </div>
                
            </div>
        </>
    );
}


