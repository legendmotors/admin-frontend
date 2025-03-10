import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { ReactSortable } from "react-sortablejs";
import ConfirmationModal from "@/components/modal/MediaModal"; // Import your modal component
import Swal from "sweetalert2";

const ComponentsDragndropGrid = ({ onImagesUpdate, initialImages }) => {
  const [imageSections, setImageSections] = useState({
    interior: [],
    exterior: [],
    highlight: [],
  });
  const [uploadProgress, setUploadProgress] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);

  // Helper to calculate total images count
  const getTotalCount = (sections) =>
    Object.values(sections).reduce((acc, section) => acc + section.length, 0);

  // Initialize state with initialImages if provided and sort them by the order property.
  // If an image doesn't have an id, we assign fileId to id.
  useEffect(() => {
    if (initialImages?.length) {
      const organizedImages = { interior: [], exterior: [], highlight: [] };
      initialImages.forEach((image) => {
        const img = { ...image, id: image.id || image.fileId };
        if (organizedImages[img.type]) {
          organizedImages[img.type].push(img);
        }
      });
      Object.keys(organizedImages).forEach((section) => {
        organizedImages[section].sort((a, b) => (a.order || 0) - (b.order || 0));
      });
      setImageSections(organizedImages);
    }
  }, [initialImages]);

  // Notify parent component about updated images.
  useEffect(() => {
    const formattedImages = [];
    Object.keys(imageSections).forEach((section) => {
      imageSections[section].forEach((image, index) => {
        formattedImages.push({
          ...image,
          type: section,
          order: index + 1, // Update order based on current array index.
        });
      });
    });
    onImagesUpdate(formattedImages);
  }, [imageSections, onImagesUpdate]);

  // Handle file drop.
  const handleDrop = async (acceptedFiles, section) => {
    const totalCount = getTotalCount(imageSections);
    if (totalCount >= 30) {
      Swal.fire({
        title: "Limit reached",
        text: "You can only add up to 30 images.",
        icon: "warning",
      });
      return;
    }

    let filesToProcess = acceptedFiles;
    if (totalCount + acceptedFiles.length > 30) {
      const available = 30 - totalCount;
      Swal.fire({
        title: "Limit reached",
        text: `You can only add ${available} more image${available > 1 ? "s" : ""}.`,
        icon: "warning",
      });
      filesToProcess = acceptedFiles.slice(0, available);
    }

    for (const file of filesToProcess) {
      // Generate a unique filename by adding a timestamp or random string
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}-${file.name}`;

      const fileId = `${section}-${uniqueFileName}`;
      const placeholderImage = {
        id: fileId,
        fileId: null,
        thumbnailPath: null,
        type: section,
      };

      setImageSections((prevState) => ({
        ...prevState,
        [section]: [...prevState[section], placeholderImage],
      }));

      setUploadProgress((prev) => ({
        ...prev,
        [fileId]: 0,
      }));

      const formData = new FormData();
      formData.append("file", file, uniqueFileName); // Append file with new name

      try {
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setUploadProgress((prev) => ({
            ...prev,
            [fileId]: progress,
          }));
        }

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


  // Open the media modal.
  const openModal = (section) => {
    setCurrentSection(section);
    setIsModalOpen(true);
  };

  // Handle modal confirmation.
  const handleModalConfirm = (selectedFiles) => {
    const totalCount = getTotalCount(imageSections);
    if (totalCount >= 30) {
      Swal.fire({
        title: "Limit reached",
        text: "You can only add up to 30 images.",
        icon: "warning",
      });
      return;
    }

    let filesToAdd = selectedFiles;
    if (totalCount + selectedFiles.length > 30) {
      const available = 30 - totalCount;
      Swal.fire({
        title: "Limit reached",
        text: `You can only add ${available} more image${available > 1 ? "s" : ""}.`,
        icon: "warning",
      });
      filesToAdd = selectedFiles.slice(0, available);
    }

    setImageSections((prevState) => ({
      ...prevState,
      [currentSection]: [
        ...prevState[currentSection],
        ...filesToAdd.map((file) => ({
          id: file.id || file.fileId,
          fileId: file.id || file.fileId,
          thumbnailPath: file.thumbnailPath || file.path,
          type: currentSection,
        })),
      ],
    }));
    setIsModalOpen(false);
  };

  // Remove a specific image from a section.
  const removeImage = (section, id, event) => {
    event.stopPropagation();
    setImageSections((prevState) => ({
      ...prevState,
      [section]: prevState[section].filter((img) => img.id !== id),
    }));
  };

  // Render the dropzone for each section.
  const renderDropzone = (section) => {
    const { getRootProps, getInputProps } = useDropzone({
      accept: { "image/*": [] },
      onDrop: (acceptedFiles) => handleDrop(acceptedFiles, section),
    });

    return (
      <div
        {...getRootProps()}
        className="dropzone border-dashed border-2 border-gray-300 rounded-lg p-5 cursor-pointer text-center mb-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            openModal(section);
          }
        }}
      >
        <input {...getInputProps()} />

        <ReactSortable
          list={imageSections[section].map((item) => ({ ...item }))}
          setList={(newList) => {
            setImageSections((prevState) => ({
              ...prevState,
              [section]: newList.map((item) => ({ ...item })),
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

              <button
                type="button"
                onClick={(e) => removeImage(section, image.id, e)}
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
