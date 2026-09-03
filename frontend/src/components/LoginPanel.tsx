export default function LoginPanel() {
    const fieldBoxClassName = "flex flex-col mb-4 w-4/5";
    const labelClassName = "text-black font-semibold mb-3";
    const textInputClassName = "border border-gray-300 p-2 mb-2 rounded-lg";
    const passwordInputClassName = "border border-gray-300 p-2 mb-2 rounded-lg";

    return (
        <div className="flex flex-row flex-1 items-center justify-center">
            <div className="bg-white w-auto min-w-150 h-auto min-h-100 p-10 flex flex-col rounded-2xl shadow-gray-300 shadow-[0_0_20px_var(--tw-shadow-color)] border border-gray-300">
                <form className="flex flex-col gap-3">
                    <div className="flex items-center justify-center mb-6">
                        <p className="text-4xl font-bold text-black">Task Beacon</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className={fieldBoxClassName}>
                            <label className={labelClassName}>
                                Email:
                            </label>
                            <input
                                type="text"
                                placeholder="you@example.com"
                                className={textInputClassName}
                            />
                        </div>
                        <div className={fieldBoxClassName}>
                            <label className={labelClassName}>
                                Password:
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••••••••••"
                                className={passwordInputClassName}  
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-end">
                        <button
                            type="submit"
                            className="bg-blue-400 text-white text-xl mr-8 font-semibold px-4 py-2 mt-3 rounded-lg"
                        >Login</button>
                    </div>
                </form>
            </div>
        </div>
    );
}