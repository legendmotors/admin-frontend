import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import ConfirmationModal from "@/components/modal/MediaModal";

interface BrochureUploadProps {
    onFileUpload: (file: any) => void;
    initialFile?: any;
}


interface UploadedFile {
    id: string;
    fileId: string | null; // Allow null values
    name: string;
    path?: string;
}



const BrochureUpload: React.FC<BrochureUploadProps> = ({ onFileUpload, initialFile }) => {
    const [brochure, setBrochure] = useState<UploadedFile | null>(initialFile || null);
    const [uploadProgress, setUploadProgress] = useState<number | "error">(0);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    useEffect(() => {
        if (initialFile) setBrochure(initialFile);
    }, [initialFile]);

    const handleDrop = async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        const fileId = `brochure-${Date.now()}-${file.name}`;

        // Set placeholder while uploading
        setBrochure({ id: fileId, fileId: "", name: file.name, path: "" });
        // Initialize progress
        setUploadProgress(0);

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Simulate progress
            for (let progress = 0; progress <= 100; progress += 10) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                setUploadProgress(progress);
            }

            // Upload the file
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/file-system/upload`,
                { method: "POST", body: formData }
            );
            const data = await response.json();

            if (response.ok) {
                const uploadedFile: UploadedFile = {
                    id: fileId,
                    fileId: data.id,
                    name: file.name,
                    path: data.path || "",
                };
                setBrochure(uploadedFile);
                onFileUpload(data.id); // Send `fileId` to parent
            } else {
                throw new Error(data.message || "Failed to upload brochure.");
            }
        } catch (error) {
            setUploadProgress("error");
            console.error("Upload failed:", error);
        }
    };

    const removeFile = () => {
        setBrochure(null);
        onFileUpload(null);
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: { "application/pdf": [".pdf"] }, // Explicitly defining accepted types
        maxFiles: 1,
        onDrop: handleDrop,
    });

    const openModal = () => {
        setIsModalOpen(true);
    };

    // Handle modal confirmation
    const handleModalConfirm = (selectedFileIds: string[]) => {
        if (selectedFileIds.length > 0) {
            const fileId = selectedFileIds[0]; // Get selected file's ID

            const uploadedFile: UploadedFile = {
                id: fileId,
                fileId: fileId, // ❌ Unnecessary duplication
                name: `Brochure-${fileId}.pdf`, // ❌ Hardcoded name
                path: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/uploads/${fileId}.pdf`,
            };

            setBrochure(uploadedFile);
            onFileUpload(fileId); // ❌ Incorrect structure
        }
        setIsModalOpen(false);
    };

    return (
        <div className="border rounded-lg p-4">
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleModalConfirm}
                title="Select Brochure"
                description="Choose a PDF brochure to add."
                allowFolders={false}
                selectionMode="single"
            />
            <h3 className="text-md font-medium mb-2">Upload Car Brochure (PDF)</h3>

            {brochure ? (
                <div className="p-3 border rounded flex justify-between items-center">
                    <a
                        href={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${brochure.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                    >
                        {brochure.name}
                    </a>
                    <button onClick={removeFile} className="text-red-500 ml-2">✕</button>
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className="border-dashed border-2 border-gray-300 rounded-lg p-5 cursor-pointer text-center"
                    onClick={openModal}
                >
                    <input {...getInputProps()} />
                    <p className="text-gray-500">Drag & drop a PDF file here, or click to upload</p>
                </div>
            )}
        </div>
    );
};

export default BrochureUpload;
