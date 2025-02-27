import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { ReactSortable } from "react-sortablejs";
import ConfirmationModal from "@/components/modal/MediaModal"; // Import your modal component

const ComponentsDragndropGrid = ({ onImagesUpdate, initialImages }) => {
    const [imageSections, setImageSections] = useState({
        interior: [],
        exterior: [],
        highlight: [],
    });

    const [uploadProgress, setUploadProgress] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSection, setCurrentSection] = useState(null);

    // Initialize state with initialImages if provided
    useEffect(() => {
        console.log("Initial Images in Drag-n-Drop Grid:", initialImages);
        if (initialImages?.length) {
            const organizedImages = { interior: [], exterior: [], highlight: [] };
            initialImages.forEach((image) => {
                if (organizedImages[image.type]) {
                    organizedImages[image.type].push(image);
                }
            });
            setImageSections(organizedImages);
        }
    }, [initialImages]);


    // Notify parent component about updated images
    useEffect(() => {
        const formattedImages = [];
        Object.keys(imageSections).forEach((section) => {
            imageSections[section].forEach((image, index) => {
                formattedImages.push({
                    ...image,
                    type: section,
                    order: index + 1,
                });
            });
        });
        onImagesUpdate(formattedImages);
    }, [imageSections]);

    // Handle file drop
    const handleDrop = async (acceptedFiles, section) => {
        const newImages = [];
        for (const file of acceptedFiles) {
            const fileId = `${section}-${Date.now()}-${file.name}`;
            const placeholderImage = {
                id: fileId,
                fileId: null,
                thumbnailPath: null,
                type: section,
            };
            newImages.push(placeholderImage);

            setImageSections((prevState) => ({
                ...prevState,
                [section]: [...prevState[section], placeholderImage],
            }));

            // Initialize upload progress
            setUploadProgress((prev) => ({
                ...prev,
                [fileId]: 0,
            }));

            const formData = new FormData();
            formData.append("file", file);

            try {
                // Simulate upload progress
                for (let progress = 0; progress <= 100; progress += 10) {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    setUploadProgress((prev) => ({
                        ...prev,
                        [fileId]: progress,
                    }));
                }

                // Perform the actual upload
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}file-system/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );
                const data = await response.json();

                if (response.ok) {
                    setImageSections((prevState) => ({
                        ...prevState,
                        [section]: prevState[section].map((img) =>
                            img.id === fileId
                                ? {
                                    ...img,
                                    fileId: data.id,
                                    thumbnailPath: data.thumbnailPath || data.path,
                                }
                                : img
                        ),
                    }));

                    setUploadProgress((prev) => {
                        const { [fileId]: _, ...rest } = prev;
                        return rest;
                    });
                } else {
                    throw new Error(data.message || "Failed to upload image.");
                }
            } catch (error) {
                setUploadProgress((prev) => ({
                    ...prev,
                    [fileId]: "error",
                }));
                console.error("Upload failed:", error);
            }
        }
    };

    // Open the media modal
    const openModal = (section) => {
        setCurrentSection(section);
        setIsModalOpen(true);
    };

    // Handle modal confirmation
    const handleModalConfirm = (selectedFiles) => {
        setImageSections((prevState) => ({
            ...prevState,
            [currentSection]: [
                ...prevState[currentSection],
                ...selectedFiles.map((file) => ({
                    id: file.id,
                    fileId: file.id,
                    thumbnailPath: file.thumbnailPath || file.path,
                    type: currentSection,
                })),
            ],
        }));
        setIsModalOpen(false);
    };

    // Render the dropzone for each section
    const renderDropzone = (section) => {
        const { getRootProps, getInputProps } = useDropzone({
            accept: { "image/*": [] },
            onDrop: (acceptedFiles) => handleDrop(acceptedFiles, section),
        });

        return (
            <div
                {...getRootProps()}
                className="dropzone border-dashed border-2 border-gray-300 rounded-lg p-5 cursor-pointer text-center mb-4"
                onClick={() => openModal(section)}
            >
                <input {...getInputProps()} />

                <ReactSortable
                    list={imageSections[section].map((item) => ({ ...item }))} // Create shallow copies of objects
                    setList={(newList) => {
                        setImageSections((prevState) => ({
                            ...prevState,
                            [section]: newList.map((item) => ({ ...item })), // Ensure immutability of new state
                        }));
                    }}
                    animation={200}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    {imageSections[section].map((image) => (
                        <div
                            key={image.id}
                            className="border border-gray-300 rounded-lg p-2 relative"
                        >
                            {/* Display Image */}
                            <div className="flex justify-center">
                                {image.thumbnailPath ? (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${image.thumbnailPath}`}
                                        alt="Uploaded"
                                        className="max-w-full max-h-32"
                                    />
                                ) : (
                                    <p className="text-gray-500">Uploading...</p>
                                )}
                            </div>

                            {/* Per-Image Progress Bar */}
                            {uploadProgress[image.id] !== undefined && (
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                                    {uploadProgress[image.id] === "error" ? (
                                        <p className="text-red-500">Upload failed</p>
                                    ) : (
                                        <div
                                            className="bg-blue-500 h-2.5 rounded-full"
                                            style={{ width: `${uploadProgress[image.id]}%` }}
                                        ></div>
                                    )}
                                </div>
                            )}

                            {/* Remove Image Button */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setImageSections((prevState) => ({
                                        ...prevState,
                                        [section]: prevState[section].filter(
                                            (img) => img.id !== image.id
                                        ),
                                    }));
                                }}
                                className="mt-2 text-red-500 underline text-sm absolute top-1 right-1"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </ReactSortable>


                <p className="text-gray-500 mt-2">
                    Drag & drop images here, or click to select files
                </p>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleModalConfirm}
                title="Select Images"
                description="Choose images to add to the section."
                allowFolders={false}
                selectionMode="multi"
            />

            <div>
                <h3 className="text-md font-medium mb-2">Interior Images</h3>
                {renderDropzone("interior")}
            </div>
            <div>
                <h3 className="text-md font-medium mb-2">Exterior Images</h3>
                {renderDropzone("exterior")}
            </div>
            <div>
                <h3 className="text-md font-medium mb-2">Highlight Images</h3>
                {renderDropzone("highlight")}
            </div>
        </div>
    );
};

export default ComponentsDragndropGrid;
