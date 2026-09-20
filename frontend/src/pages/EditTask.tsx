import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import EditTaskPanel from '@/components/EditTaskPanel';
import type { Task } from '@/lib/api/tasks';
import { getTaskById } from '@/lib/api/tasks';
import { isLoggedIn } from '@/lib/utils/validate';

export default function EditTask() {
    const [task, setTask] = useState<Task | null>(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTask = async () => {
            const taskData = id ? await getTaskById(id) : null;
            if (taskData !== null) {
                setTask(taskData);
            } else {
                if (isLoggedIn()) {
                    navigate('/dashboard');
                } else {
                    navigate('/');
                }
            }
        }
        fetchTask();
    }, [id, navigate]);

    return (
        <>
            <div className='bg-gray-100 w-full h-full flex flex-col'>
                {task && <EditTaskPanel task={task} />}
            </div>
        </>
    );
}