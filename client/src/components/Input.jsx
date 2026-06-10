import React from "react";

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
    ...props
}) {
    return (
        <div className={`flex flex-col w-full ${className}`}>
            {label && (
                <label 
                    htmlFor={id} 
                    className="block text-xs font-semibold text-gray-700 mb-1.5 select-none"
                >
                    {label} {required && <span className="text-[#8A1538] font-bold">*</span>}
                </label>
            )}
            
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    error
                        ? "border-red-500 focus:border-red-600 focus:ring-red-500/10 text-red-900 placeholder-red-300"
                        : "border-gray-200 focus:border-[#8A1538] focus:ring-[#8A1538]/10 text-gray-900 placeholder-gray-400 bg-[#F9FAFB] focus:bg-white"
                }`}
                {...props}
            />
            
            {error && (
                <span className="text-red-600 text-[10px] font-black mt-1 pl-1 leading-none select-none animate-fade-in">
                    {error}
                </span>
            )}
        </div>
    );
}
