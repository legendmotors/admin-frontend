import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { io, Socket } from "socket.io-client";

const MySwal = withReactContent(Swal);

// Define socketURL globally
const socketURL = process.env.NEXT_PUBLIC_SOCKET_URL || "https://api.legendmotorsuae.com";

interface ProgressData {
    status: string;
    message: string;
    progress: number;
}

interface ImportComponentProps {
    endpoint: string; // The API endpoint to which the file will be uploaded
    socketEvent: string; // The socket event name for progress updates
    title?: string; // Optional title for the import modal
    description?: string; // Optional description for the import modal
    acceptedFileTypes?: string; // File types to be accepted (default is ".csv")
    onComplete?: () => void; // Callback when the import is complete
}

const ImportComponent: React.FC<ImportComponentProps> = ({
    endpoint,
    socketEvent,
    title = "Select a File to Import",
    description = "Click the button below to select a file.",
    acceptedFileTypes = ".csv",
    onComplete,
}) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [progress, setProgress] = useState<number>(0);

    // Initialize socket connection
    useEffect(() => {
        const newSocket = io(socketURL, {
            transports: ["websocket"], // ✅ Force only WebSockets (No polling)
            withCredentials: true, // ✅ Allows cookies and authentication
        });

        setSocket(newSocket);

        newSocket.on(socketEvent, (data: ProgressData) => {
            console.log("Progress data:", data);
            setProgress(data.progress);

            // ✅ Ensure Swal.update() is only called when Swal is open
            if (Swal.isVisible()) {
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
            }

            if (data.progress === 100 && data.status === "completed") {
                Swal.fire({
                    icon: "success",
                    title: "Import Completed",
                    text: "The file has been imported successfully.",
                }).then(() => {
                    if (onComplete) onComplete();
                });
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [socketEvent, onComplete]);

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

            const response = await fetch(endpoint, {
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
            title,
            html: `
                <p>${description}</p>
                <input type="file" id="fileInput" accept="${acceptedFileTypes}" style="display: none;" />
                <label for="fileInput" style="cursor: pointer; padding: 10px; background: #007bff; color: white; border-radius: 5px;">
                    Choose File
                </label>
            `,
            showCancelButton: true,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                const fileInput = document.getElementById("fileInput") as HTMLInputElement;
                if (fileInput) {
                    fileInput.addEventListener("change", (event) => {
                        const target = event.target as HTMLInputElement;
                        if (target && target.files) {
                            handleFileUpload(target.files[0]);
                        }
                    });
                }
            },
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

export default ImportComponent;
