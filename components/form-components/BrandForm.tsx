'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useRef } from 'react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import SectionHeader from '@/components/utils/SectionHeader';
import Swal from 'sweetalert2';
import { setSelectedFiles } from '@/store/fileSelectionSlice';
import ConfirmationModal from '../modal/MediaModal';
import { brandValidationSchema } from '@/validations/brandValidation';
import IconSave from '../icon/icon-save';

interface BrandFormProps {
    initialValues: any;
    onSubmit: (values: any, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => void;
    isEdit?: boolean;
}

const BrandForm: React.FC<BrandFormProps> = ({ initialValues, onSubmit, isEdit = false }) => {
    const dispatch = useDispatch();
    const formikRef = useRef<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [logo, setLogo] = useState<File | null>(null); // Add state to hold logo

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const selectedFiles = useSelector((state: any) => state.fileSelection.selectedFileIds);

    useEffect(() => {
        if (selectedFiles.length > 0) {
            const selectedFile = selectedFiles[0];
            setLogoPreview(selectedFile.thumbnailPath || selectedFile.path);
        }
    }, [selectedFiles]);

    const handleConfirmSelection = () => {
        setIsModalOpen(false);
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the click event from propagating
        setLogo(null); // Reset the logo file
        setLogoPreview(null); // Reset the preview
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'image/*': [] },
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file) {
                try {
                    const formData = new FormData();
                    formData.append('file', file);

                    Swal.fire({
                        title: 'Uploading...',
                        text: 'Please wait while the file is being uploaded.',
                        allowOutsideClick: false,
                        didOpen: () => Swal.showLoading(),
                    });

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/file-system/upload`, {
                        method: 'POST',
                        body: formData,
                    });

                    const data = await response.json();

                    if (response.ok) {
                        Swal.fire({ icon: 'success', title: 'Upload Successful!' });
                        setLogoPreview(data.thumbnailPath);
                        dispatch(setSelectedFiles([data]));
                    } else {
                        throw new Error(data.message || 'Failed to upload image.');
                    }
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'Upload Failed', text: error instanceof Error ? error.message : 'Something went wrong.' });
                }
            }
        },
    });

    return (
        <>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmSelection}
                title="Select Brand Image"
                description="Choose an image for the brand."
                allowFolders={false} // 🔹 Set based on parent component logic
                selectionMode="multi" // 🔹 Set based on parent component logic
            />
            <div className="flex flex-col gap-2.5 xl:flex-row">
                <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0 ">
                    <SectionHeader title={isEdit ? 'Edit Brand' : 'Add Brand'} />
                    <div className="px-4 w-100">
                        <Formik innerRef={formikRef} initialValues={initialValues} validationSchema={brandValidationSchema} onSubmit={onSubmit} enableReinitialize>
                            {({ values, setFieldValue, submitCount, errors, handleChange }) => (
                                <Form className="space-y-5">
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-1">
                                        <div className={submitCount ? (errors.name ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="name">Name</label>
                                            <Field
                                                name="name"
                                                type="text"
                                                id="name"
                                                placeholder="Enter Name"
                                                className="form-input"
                                            />
                                            <ErrorMessage name="name" component="div" className="mt-1 text-danger" />
                                        </div>



                                    </div>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-1">
                                        <div className={submitCount ? (errors.description ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="description">Description</label>
                                            <RichTextEditor
                                                initialValue={values.description}
                                                onChange={(newContent) => setFieldValue('description', newContent)}
                                            />
                                            {submitCount ? (
                                                errors.description ? (
                                                    <div className="mt-1 text-danger">{errors.description}</div>
                                                ) : (
                                                    <div className="mt-1 text-success">Looks Good!</div>
                                                )
                                            ) : (
                                                ''
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                        {/* File upload with react-dropzone */}
                                        <div
                                            {...getRootProps()}
                                            className="dropzone border-dashed border-2 border-gray-300 rounded-lg p-5 cursor-pointer text-center"
                                            onClick={() => setIsModalOpen(true)} // ✅ Clicking opens the modal instead of file input
                                        >
                                            <input {...getInputProps()} name="logo" id="logo" />
                                            {logoPreview ? (
                                                <div className="file-selected">
                                                    <p className="mb-2">Selected Image:</p>
                                                    <div className="flex justify-center">
                                                        <img src={process.env.NEXT_PUBLIC_IMAGE_BASE_URL + logoPreview} alt="Logo Preview" className="max-w-full max-h-48" />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveImage}
                                                        className="mt-2 text-red-500 underline"
                                                    >
                                                        Remove Image
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-gray-500">Drag & drop an image here, or click to select one</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>


                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <div className={submitCount ? (errors.metaTitle ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="metaTitle">Meta Title</label>
                                            <Field
                                                name="metaTitle"
                                                type="text"
                                                id="metaTitle"
                                                placeholder="Enter Meta Title"
                                                className="form-input"
                                            />
                                            <ErrorMessage name="metaTitle" component="div" className="mt-1 text-danger" />
                                        </div>

                                        <div className={submitCount ? (errors.metaDescription ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="metaDescription">Meta Description</label>
                                            <Field
                                                name="metaDescription"
                                                type="text"
                                                id="metaDescription"
                                                placeholder="Enter Meta Description"
                                                className="form-input"
                                            />
                                            <ErrorMessage name="metaDescription" component="div" className="mt-1 text-danger" />
                                        </div>

                                        <div className={submitCount ? (errors.metaKeywords ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="metaKeywords">Meta Keywords</label>
                                            <Field
                                                name="metaKeywords"
                                                type="text"
                                                id="metaKeywords"
                                                placeholder="Enter Meta Keywords"
                                                className="form-input"
                                            />
                                            <ErrorMessage name="metaKeywords" component="div" className="mt-1 text-danger" />
                                        </div>
                                    </div>


                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
                <div className="mt-6 w-full xl:mt-0 xl:w-96">
                    <div className="panel">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-1">
                            <button type="button" className="btn btn-success w-full gap-2" onClick={() => formikRef.current.submitForm()}>
                                <IconSave className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BrandForm;
