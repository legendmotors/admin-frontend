"use client";
import { useEffect, useRef, useState } from "react";
import { createFolderAPI } from "@/api/createFolderAPI";
import { renameAPI } from "@/api/renameAPI";
import { deleteAPI } from "@/api/deleteAPI";
import { copyItemAPI, moveItemAPI } from "@/api/fileTransferAPI";
import { getAllFilesAPI } from "@/api/getAllFilesAPI";
import { downloadFile } from "@/api/downloadFileAPI";
import FileManager from "@/components/FileManager/FileManager";
import "./App.scss";
import { useFileManagement } from "./hooks/useFileManagement";

const FileManagerWrapper = () => {
  const fileUploadConfig = {
    url: process.env.NEXT_PUBLIC_API_BASE_URL + "file-system/upload",
  };

  const {
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
  } = useFileManagement();

  return (
    <div className="app">
      <div className="file-manager-container">
        <FileManager
          onSearch={handleSearch}
          searchQuery={searchQuery}
          onPageChange={handlePageChange}
          currentPage={currentPage}
          totalPages={totalPages}
          files={files}
          fileUploadConfig={fileUploadConfig}
          isLoading={isLoading}
          onCreateFolder={handleCreateFolder}
          onFileUploading={() => { }}
          onFileUploaded={handleFileUploaded}
          onCut={handleCut}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onRename={handleRename}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onLayoutChange={() => { }}
          onRefresh={handleRefresh}
          onFileOpen={handleFileOpen}
          layout="grid"
          enableFilePreview
          maxFileSize={20971520}
          filePreviewPath={`${process.env.NEXT_PUBLIC_FILE_PREVIEW_URL}`}
          acceptedFileTypes=".txt, .png, .jpg, .jpeg, .pdf, .doc, .docx, .exe"
          height="100%"
          width="100%"
          initialPath=""
        />
      </div>
    </div>
  );
};

export default FileManagerWrapper;
