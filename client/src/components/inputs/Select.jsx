import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Reusable Select input component that matches standard input designs.
 */
export default function Select({
    label,
    value,
    onChange,
    onBlur,
    options = [],
    placeholder = "Seleccione una opción",
    required = false,
    error,
    className = "",
    id,
    disabled = false,
    icon: Icon
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                if (onBlur) onBlur();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onBlur]);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className={`flex flex-col w-full relative ${className}`} ref={dropdownRef}>
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
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center transition-colors z-10 ${
                        disabled ? "text-gray-300" : "text-gray-400"
                    }`}>
                        <Icon className="w-4.5 h-4.5" />
                    </div>
                )}
                
                <button
                    id={id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full text-left ${Icon ? "pl-11" : "pl-4"} pr-10 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 flex items-center justify-between cursor-pointer disabled:bg-[#F3F4F6] disabled:text-gray-400 disabled:border-gray-200/50 disabled:cursor-not-allowed ${
                        isOpen ? "ring-2 ring-[#8A1538]/10 border-[#8A1538] bg-white text-gray-900" : ""
                    } ${
                        !isOpen ? (
                            error
                                ? "border-red-500 text-red-900 placeholder-red-300"
                                : "border-gray-200 text-gray-900 bg-[#F9FAFB] hover:bg-gray-50 focus:bg-white"
                        ) : ""
                    }`}
                >
                    <span className="truncate">
                        {selectedOption ? selectedOption.label : <span className="text-gray-400">{placeholder}</span>}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-450 shrink-0 transition-transform ${isOpen ? "rotate-180 text-[#8A1538]" : ""}`} />
                </button>

                {isOpen && (
                    <div className="absolute left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-30 animate-fade-in max-h-60 overflow-y-auto">
                        {/* Placeholder option if value is empty/not strictly required */}
                        {placeholder && (
                            <button
                                type="button"
                                onClick={() => handleSelect("")}
                                className="flex items-center w-full px-4 py-2.5 text-xs font-semibold text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                            >
                                {placeholder}
                            </button>
                        )}
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleSelect(opt.value)}
                                className={`flex items-center w-full px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer text-left ${
                                    opt.value === value
                                        ? "bg-primary-light text-primary font-bold"
                                        : "text-gray-700 hover:bg-gray-55"
                                }`}
                            >
                                <span className="truncate">{opt.label}</span>
                            </button>
                        ))}
                    </div>
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
