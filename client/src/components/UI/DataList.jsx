import { Fragment, useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import Pagination from "./Pagination";

/**
 * Reusable DataList component that standardizes tables, grids, search inputs,
 * dropdown filters, loading states, and pagination across the application.
 *
 * @param {Object} props
 * @param {Array} props.data - Array of items to display.
 * @param {boolean} props.loading - Indicates if data is currently loading.
 * @param {Array} [props.headers] - Column definitions (if rendering a table).
 * @param {function} [props.renderItem] - Custom grid item renderer (if rendering cards/grid).
 * @param {string} [props.gridClassName] - Custom CSS classes for the grid layout.
 * @param {boolean} [props.cardWrapper=true] - Wraps the component in a unified card design. Set to false for grids of individual cards.
 * @param {string} [props.noDataMessage="No se encontraron registros."] - Message displayed when data is empty.
 * @param {string} [props.loadingMessage="Cargando datos..."] - Loading spinner message.
 * @param {Object} [props.filters] - Configuration for search and filter selectors.
 * @param {Object} [props.filters.search] - Search input config { value, onChange, placeholder }.
 * @param {Array<Object>} [props.filters.selects] - Select elements config [{ label, value, onChange, options }].
 * @param {Object} [props.pagination] - Pagination config { page, totalPages, totalItems, pageSize, setPage, nextPage, prevPage, itemTypeName }.
 */
export default function DataList({
    data = [],
    loading = false,
    headers = [],
    renderItem,
    gridClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    cardWrapper = true,
    noDataMessage = "No se encontraron registros que coincidan con los filtros aplicados.",
    loadingMessage = "Cargando registros...",
    filters,
    pagination,
}) {
    // 1. Search Bar & Filters UI
    const renderFiltersSection = (standalone = false) => {
        if (!filters) return null;

        const hasSearch = !!filters.search;
        const hasSelects = Array.isArray(filters.selects) && filters.selects.length > 0;

        if (!hasSearch && !hasSelects) return null;

        const containerClasses = standalone
            ? "bg-white rounded-2xl border border-[#F3E8EB] p-5 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between mb-6"
            : "p-5 border-b border-[#F3E8EB] bg-[#FCFCFD] flex flex-col md:flex-row gap-4 items-center justify-between";

        return (
            <div className={containerClasses}>
                {/* Search Input */}
                {hasSearch && (
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                        <input
                            type="text"
                            value={filters.search.value}
                            onChange={(e) => filters.search.onChange(e.target.value)}
                            placeholder={filters.search.placeholder || "Buscar..."}
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder-gray-400 bg-[#F9FAFB]"
                        />
                    </div>
                )}

                {/* Additional Stats Count (for Grid lists without selects, like LocationView) */}
                {standalone && !hasSelects && pagination && (
                    <div className="text-xs font-semibold text-gray-400">
                        Total: {pagination.totalItems} {pagination.itemTypeName || "registros encontrados"}
                    </div>
                )}

                {/* Select Dropdowns (Filters & Sorting) */}
                {hasSelects && (
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                        {filters.selects.map((select, idx) => (
                            <div key={idx} className="flex items-center gap-2 w-full sm:w-auto">
                                {select.label && (
                                    <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
                                        {select.label}
                                    </span>
                                )}
                                <CustomSelect
                                    value={select.value}
                                    onChange={select.onChange}
                                    options={select.options}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // 2. Pagination Footer UI
    const renderPaginationFooter = (standalone = false) => {
        if (!pagination) return null;

        const {
            page = 1,
            totalPages = 1,
            totalItems = 0,
            pageSize = 10,
            setPage,
            nextPage,
            prevPage,
            itemTypeName = "registros",
        } = pagination;

        const startIndex = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
        const endIndex = Math.min(page * pageSize, totalItems);

        const containerClasses = standalone
            ? "bg-white rounded-2xl border border-[#F3E8EB] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 mt-6"
            : "p-4 border-t border-[#F3E8EB] bg-[#FCFCFD] flex flex-col sm:flex-row items-center justify-between gap-4";

        return (
            <div className={containerClasses}>
                {/* Showing index text */}
                <div className="text-[11px] font-semibold text-gray-400">
                    {totalItems > 0 ? (
                        <span>
                            Mostrando {startIndex}–{endIndex} de {totalItems} {itemTypeName}
                        </span>
                    ) : (
                        <span>No hay registros disponibles</span>
                    )}
                </div>

                {/* Pagination Controls */}
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    setPage={setPage}
                    nextPage={nextPage}
                    prevPage={prevPage}
                />
            </div>
        );
    };

    // 3. Table Layout
    const renderTable = () => {
        return (
            <div className="overflow-x-auto relative min-h-[300px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-3xs flex items-center justify-center z-10 transition-opacity">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            <span className="text-xs font-bold text-primary">{loadingMessage}</span>
                        </div>
                    </div>
                )}

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#F3E8EB] bg-[#FCFCFD] select-none">
                            {headers.map((h, idx) => (
                                <th
                                    key={idx}
                                    className={`p-4 text-[10px] font-black text-primary tracking-wider uppercase ${
                                        idx === 0 ? "pl-6" : ""
                                    } ${idx === headers.length - 1 ? "pr-6 text-center" : ""} ${
                                        h.headerClassName || ""
                                    }`}
                                >
                                    {h.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3E8EB]">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={headers.length || 1}
                                    className="p-8 text-center text-gray-400 text-sm"
                                >
                                    {noDataMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item, rowIdx) => (
                                <tr key={item.id || rowIdx} className="hover:bg-[#FCFCFD]/50 transition-colors">
                                    {headers.map((h, colIdx) => {
                                        const classes = `${colIdx === 0 ? "pl-6" : ""} ${
                                            colIdx === headers.length - 1 ? "pr-6 text-center" : ""
                                        } ${h.className || ""}`;

                                        return (
                                            <td key={colIdx} className={`p-4 ${classes}`}>
                                                {h.render
                                                    ? h.render(item)
                                                    : h.key
                                                    ? item[h.key] ?? "N/D"
                                                    : "N/D"}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    // 4. Grid / List Layout
    const renderGridLayout = () => {
        if (!renderItem) return null;

        return (
            <div className="relative min-h-[150px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-3xs flex items-center justify-center z-10 transition-opacity">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            <span className="text-xs font-bold text-primary">{loadingMessage}</span>
                        </div>
                    </div>
                )}

                {data.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#F3E8EB] p-12 text-center text-gray-400 text-sm">
                        {noDataMessage}
                    </div>
                ) : (
                    <div className={gridClassName}>
                        {data.map((item, idx) => (
                            <Fragment key={item.id || idx}>
                                {renderItem(item)}
                            </Fragment>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // 5. Render Core based on layout style
    if (cardWrapper) {
        return (
            <div className="bg-white rounded-2xl border border-[#F3E8EB] shadow-xs overflow-hidden">
                {renderFiltersSection(false)}
                {renderItem ? <div className="p-6">{renderGridLayout()}</div> : renderTable()}
                {renderPaginationFooter(false)}
            </div>
        );
    }

    // Standalone wrappers (e.g. card layouts outside of table boxes)
    return (
        <div className="space-y-6">
            {renderFiltersSection(true)}
            {renderItem ? renderGridLayout() : (
                <div className="bg-white rounded-2xl border border-[#F3E8EB] shadow-xs overflow-hidden">
                    {renderTable()}
                </div>
            )}
            {renderPaginationFooter(true)}
        </div>
    );
}

/**
 * Custom dropdown select component styling matches ExportDropdown.
 */
function CustomSelect({ value, onChange, options }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value) || options[0];

    return (
        <div className="relative inline-block text-left w-full sm:w-auto" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-2.5 w-full sm:w-auto px-4 py-2.5 bg-white border border-primary text-primary transition-all font-bold text-xs tracking-wider rounded-xl cursor-pointer shadow-xs hover:shadow-sm hover:bg-primary-light hover:text-primary text-left"
            >
                <span className="truncate">{selectedOption?.label?.toUpperCase() || ""}</span>
                <ChevronDown className="w-4 h-4 text-primary shrink-0" />
            </button>

            {isOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-30 animate-fade-in">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
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
    );
}

