import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Inputpassword({ value, onChange, name, error}) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
            <input
             type={show ? "text" : "password"}
             value={value}
             onChange={onChange}
             name={name}
             placeholder="Password"
             className={`w-full px-4 py-2 pr-10 border ${error ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500`}
            />
            <span
             className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
             onClick={() => setShow(!show)}
            >
                { show? <EyeOff size={18}/> : <Eye size={18}/>}
            </span>
            { error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    )
}