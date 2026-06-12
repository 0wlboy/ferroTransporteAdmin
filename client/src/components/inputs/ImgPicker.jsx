import React, { useState, useRef, useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import useUploadImage from "../../hooks/useUploadImage";

export default function ImagePicker({
    shape = "rouded-full",
    icon: Icon,
    bucketName,
    userId,
    initialImageUrl = "",
    onUploadComplete,
    onFileSelect,
    placeholderType = "user", // "user" or "vehicle"
    className = ""
}) {
    const [previewUrl, setPreviewUrl] = useState(initialImageUrl);
    const fileInputRef = useRef(null);
    const { uploadImage, uploading: isUploading, error } = useUploadImage();

    // Sync preview URL if initial image URL changes
    useEffect(() => {
        if (initialImageUrl) {
            setPreviewUrl(initialImageUrl);
        }
    }, [initialImageUrl]);

    const handleContainerClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 1. Create a local preview immediately for the UI
        const localPreview = URL.createObjectURL(file);
        setPreviewUrl(localPreview);

        // 2. Notify parent of local file selection
        if (onFileSelect) {
            onFileSelect(file);
        }

        // 3. If userId is available, upload immediately
        if (userId && bucketName && onUploadComplete) {
            const uploadedUrl = await uploadImage(file, {
                bucket: bucketName,
                userAuthId: userId,
                uniqueFileName: false,
                upsert: true
            });
            if (uploadedUrl) {
                setPreviewUrl(uploadedUrl);
                onUploadComplete(uploadedUrl);
            }
        }
    };

    return (
        <div className={`flex flex-col items-center gap-2 select-none ${className}`}>
            <div
                onClick={handleContainerClick}
                className={`w-28 h-28 ${shape} overflow-hidden border-4 border-primary bg-gray-50 flex items-center justify-center cursor-pointer group shadow-md relative transition-transform hover:scale-102`}
            >
                {/* Image Preview */}
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-gray-300">
                        {placeholderType === "vehicle" ? (
                            <svg className="w-12 h-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177V3.75m0 3.823a3 3 0 1 1-6 0m6 0a3 3 0 1 0-6 0m6 0H6.75V3.75" />
                            </svg>
                        ) : (
                            <Icon className={`w-12 h-12 text-gray-300`} />
                            /*<User className="w-12 h-12" />*/
                        )}
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                </div>

                {/* Loading spinner overlay */}
                {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                        <span className="text-[9px] font-extrabold text-white mt-1 uppercase tracking-wider">Subiendo...</span>
                    </div>
                )}
            </div>

            {/* Hidden Input file */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
            />

            {error && (
                <span className="text-red-500 text-[10px] font-black text-center max-w-[200px] mt-1 leading-tight">
                    {error}
                </span>
            )}
        </div>
    );
}
