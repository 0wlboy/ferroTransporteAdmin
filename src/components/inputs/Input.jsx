import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({
    label,
    type = "text",
    value,
    onChange,
    onBlur,
    placeholder,
    required = false,
    error,
    className = "",
    id,
    disabled = false,
    icon: Icon,
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === "password";
    const inputType = isPasswordType && showPassword ? "text" : type;

    return (
        <div className={`flex flex-col w-full ${className}`}>
            {label && (
                <label 
                    htmlFor={id} 
                    className={`block text-xs font-semibold mb-1.5 select-none transition-colors ${
                        disabled ? "text-gray-400" : "text-gray-700"
                    }`}
                >
                    {label} {required && <span className="text-[#8A1538] font-bold">*</span>}
                </label>
            )}
            
            <div className="relative w-full">
                {Icon && (
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center transition-colors ${
                        disabled ? "text-gray-300" : "text-gray-400"
                    }`}>
                        <Icon className="w-4.5 h-4.5" />
                    </div>
                )}
                <input
                    id={id}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`w-full ${Icon ? "pl-11" : "pl-4"} pr-10 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 disabled:bg-[#F3F4F6] disabled:text-gray-400 disabled:border-gray-200/50 disabled:cursor-not-allowed ${
                        error
                            ? "border-red-500 focus:border-red-600 focus:ring-red-500/10 text-red-900 placeholder-red-300"
                            : "border-gray-200 focus:border-[#8A1538] focus:ring-[#8A1538]/10 text-gray-900 placeholder-gray-400 bg-[#F9FAFB] focus:bg-white"
                    }`}
                    {...props}
                />
                
                {isPasswordType && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={disabled}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8A1538] transition-colors cursor-pointer select-none"
                    >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4 stroke-[2]" />
                        ) : (
                            <Eye className="w-4 h-4 stroke-[2]" />
                        )}
                    </button>
                )}
            </div>
            
            {error && (
                <span className="text-red-600 text-[10px] font-black mt-1 pl-1 leading-none select-none animate-fade-in">
                    {error}
                </span>
            )}
        </div>
    );
}

