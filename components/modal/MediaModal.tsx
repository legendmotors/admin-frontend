import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import FileManagerWrapper from '../FileManager/FileManagerWrapper';
import { useDispatch, useSelector } from 'react-redux';
import { setAllowFolders, setSelectionMode } from '@/store/fileSelectionSlice';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (selectedFileIds: string[]) => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    allowFolders: boolean;
    selectionMode: 'single' | 'multi';
};

const ConfirmationModal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm Selection',
    cancelText = 'Cancel',
    allowFolders,
    selectionMode
}) => {
    const dispatch = useDispatch();
    
    // Redux State Selectors
    const selectedFileIds = useSelector((state: any) => state.fileSelection.selectedFileIds);

    useEffect(() => {
        if (isOpen) {
            dispatch(setAllowFolders(allowFolders));
            dispatch(setSelectionMode(selectionMode));
        }
    }, [isOpen, allowFolders, selectionMode, dispatch]);

    const handleConfirm = () => {
        if (selectedFileIds.length > 0) {
            onConfirm(selectedFileIds);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" open={isOpen} onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-[black]/60 z-[999]" />
                </Transition.Child>
                <div className="fixed inset-0 flex items-center justify-center min-h-screen z-[1000]">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-[80%] my-8 text-black dark:text-white-dark">
                            <div className="p-5 text-center">
                                <h5 className="text-lg font-bold">{title}</h5>
                                <p>{description}</p>

                                {/* File Selection Component */}
                                <FileManagerWrapper />

                                {/* Action Buttons */}
                                <div className="flex justify-end mt-4">
                                    <button className="btn btn-outline-danger" onClick={onClose}>
                                        {cancelText}
                                    </button>
                                    {/* ✅ Show Confirm button only if selectedFileIds is NOT empty */}
                                    {selectedFileIds.length > 0 && (
                                        <button className="btn btn-primary ml-4" onClick={handleConfirm}>
                                            {confirmText}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ConfirmationModal;
