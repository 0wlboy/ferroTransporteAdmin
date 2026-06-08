import React from "react";

export default function StatCard({ title, value, subtext, icon: Icon, trend }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-[#F3E8EB] shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-primary/80 uppercase tracking-wider">
                    {title}
                </span>
                {Icon && (
                    <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center border border-primary-light-border">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                )}
            </div>
            <div className="mt-4">
                <h3 className="text-4xl font-black text-gray-900 tracking-tight">
                    {value}
                </h3>
                {subtext && (
                    <div className="flex items-center gap-1.5 mt-2">
                        {trend && trend.type === "up" && (
                            <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        )}
                        <span className={`text-[11px] font-medium ${
                            trend && trend.type === "up" ? "text-emerald-600 font-bold" : "text-gray-400"
                        }`}>
                            {subtext}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
