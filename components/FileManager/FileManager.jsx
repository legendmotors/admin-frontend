import Loader from "./components/Loader/Loader";
import Toolbar from "./Toolbar/Toolbar";
import NavigationPane from "./NavigationPane/NavigationPane";
import BreadCrumb from "./BreadCrumb/BreadCrumb";
import FileList from "./FileList/FileList";
import Actions from "./Actions/Actions";
import { FilesProvider } from "./contexts/FilesContext";
import { FileNavigationProvider } from "./contexts/FileNavigationContext";
import { SelectionProvider } from "./contexts/SelectionContext";
import { ClipBoardProvider } from "./contexts/ClipboardContext";
import { LayoutProvider } from "./contexts/LayoutContext";
import { useTriggerAction } from "./hooks/useTriggerAction";
import { useColumnResize } from "./hooks/useColumnResize";
import PropTypes from "prop-types";
import { dateStringValidator, urlValidator } from "./validators/propValidators";
import "./FileManager.scss";
import { useState, useEffect } from "react";
import IconSearch from "../icon/icon-search";
import IconX from "../icon/icon-x";

const FileManager = ({
  onSearch,
  searchQuery,
  onPageChange,
  currentPage,
  totalPages,
  files,
  fileUploadConfig,
  isLoading,
  onCreateFolder,
  onFileUploading = () => { },
  onFileUploaded = () => { },
  onCut,
  onCopy,
  onPaste,
  onRename,
  onDownload,
  onDelete = () => null,
  onLayoutChange = () => { },
  onRefresh,
  onFileOpen = () => { },
  onError = () => { },
  layout = "grid",
  enableFilePreview = true,
  maxFileSize,
  filePreviewPath,
  acceptedFileTypes,
  height = "600px",
  width = "100%",
  initialPath = "",
  filePreviewComponent,
  primaryColor = "#6155b4",
  fontFamily = "Nunito Sans, sans-serif",
}) => {
  const [query, setQuery] = useState(searchQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // Debounce delay (300ms)

    return () => clearTimeout(timer); // Cleanup on query change
  }, [query]);

  const handleSearch = () => {
    if (debouncedQuery !== searchQuery) {
      onSearch(debouncedQuery);
    }
  };

  const triggerAction = useTriggerAction();
  const { containerRef, colSizes, isDragging, handleMouseMove, handleMouseUp, handleMouseDown } =
    useColumnResize(20, 80);
  const customStyles = {
    "--file-manager-font-family": fontFamily,
    "--file-manager-primary-color": primaryColor,
    height,
    width,
  };


  if (!Array.isArray(files)) {
    console.error("FileManager received invalid `files` data:", files);
    return <p>Error loading files</p>;
  }

  return (
    <main className="file-explorer" onContextMenu={(e) => e.preventDefault()} style={customStyles}>
      <Loader loading={isLoading} />
      <FilesProvider filesData={files} onError={onError}>
        <FileNavigationProvider initialPath={initialPath}>
          <SelectionProvider onDownload={onDownload}>
            <ClipBoardProvider onPaste={onPaste} onCut={onCut} onCopy={onCopy}>
              <LayoutProvider layout={layout}>
                <Toolbar
                  allowCreateFolder
                  allowUploadFile
                  onLayoutChange={onLayoutChange}
                  onRefresh={onRefresh}
                  triggerAction={triggerAction}
                />
                <section
                  ref={containerRef}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="files-container"
                >
                  <div className="navigation-pane" style={{ width: colSizes.col1 + "%" }}>
                    <NavigationPane />
                    <div
                      className={`sidebar-resize ${isDragging ? "sidebar-dragging" : ""}`}
                      onMouseDown={handleMouseDown}
                    />
                  </div>


                  <div className="folders-preview" style={{ width: colSizes.col2 + "%" }}>
                    <div className="mb-5 flex gap-4 w-full mt-3 px-4">
                      <div className="flex  w-full">
                        <div className="flex items-center justify-center border border-white-light bg-[#eee] px-3 font-semibold ltr:rounded-l-md ltr:border-r-0 rtl:rounded-r-md rtl:border-l-0 dark:border-[#17263c] dark:bg-[#1b2e4b]">
                          <IconSearch className="text-white-dark" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search files..."
                          id="iconLeft"
                          className="form-input ltr:rounded-l-none rtl:rounded-r-none"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                        {/* Clear button */}
                        {query && (
                          <button
                            type="button"
                            onClick={() => {
                              setQuery(""); // Reset query
                              onSearch(""); // Trigger a search with an empty query
                            }}
                            className="flex items-center justify-center border border-white-light btn btn-danger px-3 font-semibold ltr:rounded-r-md ltr:border-r-0 rtl:rounded-r-md rtl:border-l-0 dark:border-[#17263c] dark:bg-[#1b2e4b]"
                          >
                            <IconX />
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        className="btn btn-success gap-2"
                        onClick={handleSearch}
                      >
                        Search
                      </button>
                    </div>
                    <BreadCrumb />
                    <FileList
                      onCreateFolder={onCreateFolder}
                      onRename={onRename}
                      onFileOpen={onFileOpen}
                      onRefresh={onRefresh}
                      enableFilePreview={enableFilePreview}
                      triggerAction={triggerAction}
                      onPageChange={onPageChange}
                      currentPage={currentPage}
                      totalPages={totalPages}
                    />
                  </div>

                </section>

                <Actions
                  fileUploadConfig={fileUploadConfig}
                  onFileUploading={onFileUploading}
                  onFileUploaded={onFileUploaded}
                  onDelete={onDelete}
                  onRefresh={onRefresh}
                  maxFileSize={maxFileSize}
                  filePreviewPath={filePreviewPath}
                  filePreviewComponent={filePreviewComponent}
                  acceptedFileTypes={acceptedFileTypes}
                  triggerAction={triggerAction}
                />
              </LayoutProvider>
              <div className="mb-5 mt-5">
                <div className="flex w-full flex-col justify-center">
                  <ul className="m-auto inline-flex items-center space-x-1 rtl:space-x-reverse">
                    <li>
                      <button
                        type="button"
                        className="flex justify-center rounded bg-white-light px-3.5 py-2 font-semibold text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary"
                        disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}
                      >
                        Prev
                      </button>
                    </li>
                    {/* Display pages dynamically */}
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <li key={pageNumber}>
                          <button
                            type="button"
                            className={`flex justify-center rounded px-3.5 py-2 font-semibold text-dark transition ${pageNumber === currentPage
                              ? "bg-primary text-white dark:bg-primary dark:text-white-light"
                              : "bg-white-light hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary"
                              }`}
                            onClick={() => onPageChange(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        </li>
                      );
                    })}
                    <li>
                      <button
                        type="button"
                        className="flex justify-center rounded bg-white-light px-3.5 py-2 font-semibold text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary"
                        disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </ClipBoardProvider>
          </SelectionProvider>
        </FileNavigationProvider>
      </FilesProvider>
    </main>
  );
};

FileManager.displayName = "FileManager";

FileManager.propTypes = {
  files: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      isDirectory: PropTypes.bool.isRequired,
      path: PropTypes.string.isRequired,
      updatedAt: dateStringValidator,
      size: PropTypes.number,
    })
  ).isRequired,
  fileUploadConfig: PropTypes.shape({
    url: urlValidator,
    headers: PropTypes.objectOf(PropTypes.string),
  }),
  isLoading: PropTypes.bool,
  onCreateFolder: PropTypes.func,
  onFileUploading: PropTypes.func,
  onFileUploaded: PropTypes.func,
  onRename: PropTypes.func,
  onDelete: PropTypes.func,
  onCut: PropTypes.func,
  onCopy: PropTypes.func,
  onPaste: PropTypes.func,
  onDownload: PropTypes.func,
  onLayoutChange: PropTypes.func,
  onRefresh: PropTypes.func,
  onFileOpen: PropTypes.func,
  onError: PropTypes.func,
  layout: PropTypes.oneOf(["grid", "list"]),
  maxFileSize: PropTypes.number,
  enableFilePreview: PropTypes.bool,
  filePreviewPath: urlValidator,
  acceptedFileTypes: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  initialPath: PropTypes.string,
  filePreviewComponent: PropTypes.func,
  primaryColor: PropTypes.string,
  fontFamily: PropTypes.string,
};

export default FileManager;
