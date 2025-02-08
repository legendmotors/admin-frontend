import { useEffect, useRef, useState } from "react";
import { FaRegFile, FaRegFolderOpen } from "react-icons/fa6";
import { useFileIcons } from "../hooks/useFileIcons";
import CreateFolderAction from "../Actions/CreateFolder/CreateFolder.action";
import RenameAction from "../Actions/Rename/Rename.action";
import { getDataSize } from "../utils/getDataSize";
import { formatDate } from "../utils/formatDate";
import { useFileNavigation } from "../contexts/FileNavigationContext";
import { useSelection } from "../contexts/SelectionContext";
import { useClipBoard } from "../contexts/ClipboardContext";
import { useLayout } from "../contexts/LayoutContext";
import Checkbox from "../components/Checkbox/Checkbox";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { clearSelection, selectFile } from "@/store/fileSelectionSlice";

const dragIconSize = 50;

const FileItem = ({
  index,
  file,
  onCreateFolder,
  onRename,
  enableFilePreview,
  onFileOpen,
  filesViewRef,
  selectedFileIndexes,
  triggerAction,
  handleContextMenu,
  setLastSelectedFile,
}) => {


  const dispatch = useDispatch();
  const { selectedFileIds, selectionMode, allowFolders } = useSelector(state => state.fileSelection); // ✅ Get from Redux

  console.log(selectionMode, "selectionMode");


  const [fileSelected, setFileSelected] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [checkboxClassName, setCheckboxClassName] = useState("hidden");
  const [dropZoneClass, setDropZoneClass] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState(null);

  const { activeLayout } = useLayout();
  const iconSize = activeLayout === "grid" ? 80 : 80;
  const fileIcons = useFileIcons(iconSize);
  const { setCurrentPath, currentPathFiles } = useFileNavigation();
  const { setSelectedFiles } = useSelection();
  const { clipBoard, handleCutCopy, setClipBoard, handlePasting } = useClipBoard();
  const dragIconRef = useRef(null);
  const dragIcons = useFileIcons(dragIconSize);

  const isFileMoving =
    clipBoard?.isMoving &&
    clipBoard.files.find((f) => f.name === file.name && f.path === file.path);

  const handleFileAccess = () => {
    onFileOpen(file);
    if (file.isDirectory) {
      setCurrentPath(file.path);
      setSelectedFiles([]);
    } else {
      enableFilePreview && triggerAction.show("previewFile");
    }
  };

  const handleFileRangeSelection = (shiftKey, ctrlKey) => {
    if (selectedFileIndexes.length > 0 && shiftKey) {
      let reverseSelection = false;
      let startRange = selectedFileIndexes[0];
      let endRange = index;

      // Reverse Selection
      if (startRange >= endRange) {
        const temp = startRange;
        startRange = endRange;
        endRange = temp;
        reverseSelection = true;
      }

      const filesRange = currentPathFiles.slice(startRange, endRange + 1);
      setSelectedFiles(reverseSelection ? filesRange.reverse() : filesRange);
    } else if (selectedFileIndexes.length > 0 && ctrlKey) {
      // Remove file from selected files if it already exists on CTRL + Click, other push it in selectedFiles
      setSelectedFiles((prev) => {
        const filteredFiles = prev.filter((f) => f.path !== file.path);
        if (prev.length === filteredFiles.length) {
          return [...prev, file];
        }
        return filteredFiles;
      });
    } else {
      setSelectedFiles([file]);
    }
  };


  useEffect(() => {
    dispatch(clearSelection()); // ✅ Clear previous selection before updating

    const selectedFiles = selectedFileIndexes.map(index => {
      const file = currentPathFiles[index];
      console.log(file, "filefilefile");

      return {
        id: file.id,
        name: file.name,
        path: file.path,
        thumbnailPath: file.thumbnailPath,
        compressedPath: file.compressedPath,
        createdAt: file.createdAt,
        isDirectory: file.isDirectory,
        mimeType: file.mimeType,
        originalPath: file.originalPath,
        parentId: file.parentId,
        size: file.size,
        updatedAt: file.updatedAt,
        webpPath: file.webpPath,
      };
    });

    selectedFiles.forEach(file => dispatch(selectFile(file))); // ✅ Store full file objects

    console.log("🚀 Selected Files Before Storing in Redux:", selectedFiles); // ✅ Debug log
  }, [selectedFileIndexes, dispatch, currentPathFiles]);



  const handleFileSelection = (e) => {
    e.stopPropagation();
    if (file.isEditing) return;

    handleFileRangeSelection(e.shiftKey, e.ctrlKey);

    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime < 300) {
      handleFileAccess();
      return;
    }
    setLastClickTime(currentTime);

    // dispatch(setLastSelectedFile(file)); // ✅ Store last selected file in Redux
  };


  const handleOnKeyDown = (e) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      setSelectedFiles([file]);
      handleFileAccess();
    }
  };

  const handleItemContextMenu = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (file.isEditing) return;

    if (!fileSelected) {
      setSelectedFiles([file]);
    }

    setLastSelectedFile(file);
    handleContextMenu(e, true);
  };

  // Selection Checkbox Functions
  const handleMouseOver = () => {
    setCheckboxClassName("visible");
  };

  const handleMouseLeave = () => {
    !fileSelected && setCheckboxClassName("hidden");
  };

  const handleCheckboxChange = (e) => {
    if (e.target.checked) {
      setSelectedFiles((prev) => [...prev, file]);
    } else {
      setSelectedFiles((prev) => prev.filter((f) => f.name !== file.name && f.path !== file.path));
    }

    setFileSelected(e.target.checked);
  };
  //

  const handleDragStart = (e) => {
    e.dataTransfer.setDragImage(dragIconRef.current, 30, 50);
    e.dataTransfer.effectAllowed = "copy";
    handleCutCopy(true);
  };

  const handleDragEnd = () => setClipBoard(null);

  const handleDragEnterOver = (e) => {
    e.preventDefault();
    if (fileSelected || !file.isDirectory) {
      e.dataTransfer.dropEffect = "none";
    } else {
      setTooltipPosition({ x: e.clientX, y: e.clientY + 12 });
      e.dataTransfer.dropEffect = "copy";
      setDropZoneClass("file-drop-zone");
    }
  };

  const handleDragLeave = (e) => {
    // To stay in dragging state for the child elements of the target drop-zone
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropZoneClass((prev) => (prev ? "" : prev));
      setTooltipPosition(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (fileSelected || !file.isDirectory) return;

    handlePasting(file);
    setDropZoneClass((prev) => (prev ? "" : prev));
    setTooltipPosition(null);
  };

  useEffect(() => {
    setFileSelected(selectedFileIndexes.includes(index));
    setCheckboxClassName(selectedFileIndexes.includes(index) ? "visible" : "hidden");
  }, [selectedFileIndexes]);

  const isImageFile = (file) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const fileExtension = file.name?.split(".").pop()?.toLowerCase();
    return imageExtensions.includes(fileExtension);
  };

  const renderFileIcon = () => {
    if (isImageFile(file)) {
      return <img src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${file.thumbnailPath}`} alt={file.name} style={{ width: iconSize, height: iconSize, objectFit: "cover" }} />;
    }
    return fileIcons[file.name?.split(".").pop()?.toLowerCase()] ?? <FaRegFile size={iconSize} />;
  };


  return (
    <div
      className={`file-item-container ${dropZoneClass} ${fileSelected || !!file.isEditing ? "file-selected" : ""
        } ${isFileMoving ? "file-moving" : ""}`}
      tabIndex={0}
      title={file.name}
      onClick={handleFileSelection}
      onKeyDown={handleOnKeyDown}
      onContextMenu={handleItemContextMenu}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      draggable={fileSelected}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragEnter={handleDragEnterOver}
      onDragOver={handleDragEnterOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="file-item">
        {!file.isEditing && (
          <Checkbox
            name={file.name}
            id={file.name}
            checked={fileSelected}
            disabled={(selectionMode === "single" && selectedFileIds.length > 0 && selectedFileIds[0] !== file.id) || (file.isDirectory && !allowFolders)}
            className={`selection-checkbox ${checkboxClassName}`}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
          />

        )}
        {file.isDirectory ? (
          <FaRegFolderOpen size={iconSize} />
        ) : (
          renderFileIcon()
        )}

        {file.isEditing ? (
          <div className={`rename-file-container ${activeLayout}`}>
            {triggerAction.actionType === "createFolder" ? (
              <CreateFolderAction
                filesViewRef={filesViewRef}
                file={file}
                onCreateFolder={onCreateFolder}
                triggerAction={triggerAction}
              />
            ) : (
              <RenameAction
                filesViewRef={filesViewRef}
                file={file}
                onRename={onRename}
                triggerAction={triggerAction}
              />
            )}
          </div>
        ) : (
          <span className="text-truncate file-name">{file.name}</span>
        )}
      </div>

      {activeLayout === "list" && (
        <>
          <div className="modified-date">{formatDate(file.updatedAt)}</div>
          <div className="size">{file?.size > 0 ? getDataSize(file?.size) : ""}</div>
        </>
      )}

      {/* Drag Icon & Tooltip Setup */}
      {tooltipPosition && (
        <div
          style={{
            top: `${tooltipPosition.y}px`,
            left: `${tooltipPosition.x}px`,
          }}
          className="drag-move-tooltip"
        >
          Move to <span className="drop-zone-file-name">{file.name}</span>
        </div>
      )}

      <div ref={dragIconRef} className="drag-icon">
        {file.isDirectory ? (
          <FaRegFolderOpen size={dragIconSize} />
        ) : (
          <>
            {dragIcons[file.name?.split(".").pop()?.toLowerCase()] ?? (
              <FaRegFile size={dragIconSize} />
            )}
          </>
        )}
      </div>
      {/* Drag Icon & Tooltip Setup */}
    </div>
  );
};

export default FileItem;
