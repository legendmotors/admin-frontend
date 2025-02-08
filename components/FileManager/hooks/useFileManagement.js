import { useEffect, useState, useRef } from "react";
import { createFolderAPI } from "@/api/createFolderAPI";
import { renameAPI } from "@/api/renameAPI";
import { deleteAPI } from "@/api/deleteAPI";
import { copyItemAPI, moveItemAPI } from "@/api/fileTransferAPI";
import { getAllFilesAPI } from "@/api/getAllFilesAPI";
import { downloadFile } from "@/api/downloadFileAPI";

export const useFileManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  
  const isMountRef = useRef(false);

  const getFiles = async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const response = await getAllFilesAPI(search, page, 10);
      if (response.success) {
        setFiles(response.data);
        setTotalPages(response.pagination.totalPages);
        setCurrentPage(response.pagination.currentPage);
      } else {
        console.error("❌ API Error:", response);
        setFiles([]);
      }
    } catch (err) {
      console.error("❌ API Fetch Error:", err);
      setFiles([]);
    }
    setIsLoading(false);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setIsLoading(true);
    const response = await getAllFilesAPI(query);
    if (response.success) {
      setFiles(response.data);
    } else {
      console.error("❌ Search failed");
    }
    setIsLoading(false);
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      getFiles(page, searchQuery);
    }
  };

  const handleCreateFolder = async (name, parentFolder) => {
    setIsLoading(true);
    const response = await createFolderAPI(name, parentFolder?.id);
    if (response.error) {
      console.error("❌ Failed to Create Folder:", response.error);
    } else {
      setFiles((prev) => [...prev, response]);
    }
    setIsLoading(false);
  };

  const handleFileUploaded = (response) => {
    const uploadedFile = JSON.parse(response);
    setFiles((prev) => [...prev, uploadedFile]);
  };

  const handleRename = async (file, newName) => {
    setIsLoading(true);
    const response = await renameAPI(file.id, newName);
    if (response.status === 200) {
      getFiles();
    } else {
      console.error(response);
    }
    setIsLoading(false);
  };

  const handleDelete = async (filesToDelete) => {
    setIsLoading(true);
    const idsToDelete = filesToDelete.map((file) => file.id);
    try {
      const response = await deleteAPI(idsToDelete);
      if (response.status === 200) {
        setFiles((prevFiles) => prevFiles.filter((file) => !idsToDelete.includes(file.id)));
      } else {
        console.error("❌ Delete failed:", response);
        getFiles();
      }
    } catch (error) {
      console.error("❌ Delete request error:", error);
    }
    setIsLoading(false);
  };

  const handlePaste = async (copiedItems, destinationFolder, operationType) => {
    setIsLoading(true);
    const copiedItemIds = copiedItems.map((item) => item._id);
    if (operationType === "copy") {
      await copyItemAPI(copiedItemIds, destinationFolder?._id);
    } else {
      await moveItemAPI(copiedItemIds, destinationFolder?._id);
    }
    await getFiles();
  };

  const handleRefresh = () => {
    getFiles();
  };

  const handleFileOpen = (file) => {
    console.log(`Opening file: ${file.name}`);
  };

  const handleDownload = async (files) => {
    await downloadFile(files);
  };

  const handleCut = (files) => {
    console.log("Moving Files", files);
  };

  const handleCopy = (files) => {
    console.log("Copied Files", files);
  };

  useEffect(() => {
    if (isMountRef.current) return;
    isMountRef.current = true;
    getFiles();
  }, []);

  return {
    files,
    isLoading,
    currentPage,
    totalPages,
    searchQuery,
    handleSearch,
    handlePageChange,
    handleCreateFolder,
    handleFileUploaded,
    handleRename,
    handleDelete,
    handlePaste,
    handleRefresh,
    handleFileOpen,
    handleDownload,
    handleCut,
    handleCopy,
  };
};
