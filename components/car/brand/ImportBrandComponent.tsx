import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { io, Socket } from "socket.io-client";

const MySwal = withReactContent(Swal);

interface ProgressData {
  status: string;
  message: string;
  progress: number;
}

const ImportBrandComponent: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [progress, setProgress] = useState<number>(0);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_IMAGE_BASE_URL); // Adjust the URL as per your backend setup
    setSocket(newSocket);

    newSocket.on("progress", (data: ProgressData) => {
      console.log("Progress data:", data);
      setProgress(data.progress);

      // Update the SweetAlert2 modal content dynamically
      Swal.update({
        html: `
          <div>
            <p>${data.message}</p>
            <div style="width: 100%; background: #e0e0e0; border-radius: 5px; margin-top: 10px;">
              <div style="width: ${data.progress}%; background: #4caf50; height: 20px; border-radius: 5px;"></div>
            </div>
            <p>${data.progress}% completed</p>
          </div>
        `,
      });

      // Handle completion
      if (data.progress === 100 && data.status === "completed") {
        Swal.fire({
          icon: "success",
          title: "Import Completed",
          text: "The file has been imported successfully.",
        });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      Swal.fire({
        title: "Uploading File",
        html: "Please wait while the file is being uploaded...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/api/brand/import`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire("Success", "File uploaded successfully.", "success");
      } else {
        Swal.fire("Error", result.message || "File upload failed.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Something went wrong during upload.", "error");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      Swal.fire("Error", "No file selected!", "error");
      return;
    }

    handleFileUpload(file);
  };

  const handleImportClick = () => {
    MySwal.fire({
      title: "Select a File to Import",
      html: `
        <p>Click the button below to select a CSV file.</p>
        <input type="file" id="fileInput" accept=".csv" style="display: none;" />
        <label for="fileInput" style="cursor: pointer; padding: 10px; background: #007bff; color: white; border-radius: 5px;">
          Choose File
        </label>
      `,
      showCancelButton: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
    //   didOpen: () => {
    //     const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    //     if (fileInput) {
    //       fileInput.addEventListener("change", handleFileChange);
    //     }
    //   },
    });
  };

  return (
    <div>
      <button
        onClick={handleImportClick}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Import File
      </button>

      {/* Progress bar overlay */}
      {progress > 0 && progress < 100 && (
        <div className="fixed top-0 left-0 w-full bg-blue-500 text-white text-center">
          Import Progress: {progress}%
        </div>
      )}
    </div>
  );
};

export default ImportBrandComponent;
