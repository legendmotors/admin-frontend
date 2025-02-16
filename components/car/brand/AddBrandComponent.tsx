'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Link from 'next/link';
import IconSave from '@/components/icon/icon-save';
import IconEye from '@/components/icon/icon-eye';
import IconDownload from '@/components/icon/icon-download';
import IconCircleCheck from '@/components/icon/icon-circle-check';
import { useDropzone } from 'react-dropzone';
import SectionHeader from '@/components/utils/SectionHeader';
import ConfirmationModal from '@/components/modal/MediaModal';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setSelectedFiles } from '@/store/fileSelectionSlice';

// Connect to the backend socket server
const socket = io('ws://localhost:4000'); // Make sure it matches your WebSocket server's URL

const AddBrandComponent = () => {
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [progress, setProgress] = useState(0); // Track the progress
    const [statusMessage, setStatusMessage] = useState(""); // To show status messages
    const [logo, setLogo] = useState<File | null>(null); // Add state to hold logo
    const [logoPreview, setLogoPreview] = useState<string | null>(null); // State for image preview

    // Get selected files from Redux
    const selectedFiles = useSelector((state: any) => state.fileSelection.selectedFileIds);
    console.log(statusMessage, "statusMessage");

    // Update logo preview when a new file is selected
    useEffect(() => {
        if (selectedFiles.length > 0) {
            const selectedFile = selectedFiles[0]; // Get the first selected file
            setLogoPreview(selectedFile.thumbnailPath || selectedFile.path); // Use thumbnailPath if available
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

    useEffect(() => {
        // ✅ Listen for real-time WebSocket progress updates
        const progressHandler = (data: { progress: number; message: string; status: string }) => {
            console.log("Progress Data:", data);

            if (data.progress) setProgress(data.progress);
            if (data.message) setStatusMessage(data.message);

            // ✅ Dynamically update SweetAlert UI
            Swal.update({
                html: renderProgressHtml(data.progress, data.message)
            });

            // ✅ Stop listening when progress reaches 100 (brand creation completed)
            if (data.progress === 100 && data.status === 'completed') {
                Swal.fire({
                    icon: 'success',
                    title: 'Brand Created Successfully!',
                    text: 'The brand has been added successfully.',
                }).then(() => {
                    window.location.href = '/brand/list';
                });

                socket.off('progress', progressHandler); // 🛑 Stop listening for updates
                setTimeout(() => {
                    setProgress(0);
                    setStatusMessage('');
                }, 2000);
            }
        };

        socket.on('progress', progressHandler);

        return () => {
            socket.off('progress', progressHandler); // 🛑 Cleanup listener on unmount
        };
    }, []);



    // ✅ Helper function to render the SweetAlert progress UI
    const renderProgressHtml = (progress: number, message: string) => `
        <div class="mb-5 space-y-5">
            <div class="w-full h-4 bg-gray-200 rounded-full">
                <div class="bg-blue-500 h-4 rounded-full text-center text-white text-xs" style="width: ${progress}%;">${progress}%</div>
            </div>
            <p class="text-center">${message}</p>
        </div>
    `;

    const submitForm4 = Yup.object().shape({
        name: Yup.string()
            .required('Please fill the name')
            .min(1, 'Name must be at least 1 characters long'), description: Yup.string().required('Please fill the description'),
    });

    interface BrandFormValues {
        name: string;
        description: string;
        slug: string;
        metaTitle: string;
        metaDescription: string;
        metaKeywords: string;
        logo: any[];
    }

    const handleSubmit = async (values: BrandFormValues,
        { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        const payload = {
            name: values.name,
            description: values.description,
            metaTitle: values.metaTitle,
            metaDescription: values.metaDescription,
            metaKeywords: values.metaKeywords,
            logo: selectedFiles.map((file: any) => file.id), // ✅ Send selectedFiles as JSON array
        };


        try {
            // ✅ Show SweetAlert with dynamic UI updates
            Swal.fire({
                title: 'Creating Brand...',
                html: renderProgressHtml(0, "Initializing..."),
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
            });


            // Send the request to create the brand
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/brand/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                // ✅ Immediately show success message when the backend confirms completion
                Swal.fire({
                    icon: 'success',
                    title: 'Brand Created Successfully!',
                    text: 'The brand has been added successfully.',
                }).then(() => {
                    window.location.href = '/brand/list';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.msg,
                });
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message, // Access message safely
                });
            } else {
                // If it's not an instance of Error, show a generic error message
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An unexpected error occurred.',
                });
            }
        } finally {
            setSubmitting(false);
        }
    };


    const formikRef = useRef<any>(null);


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
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/file-system/upload`, {
                        method: 'POST',
                        body: formData,
                    });

                    const data = await response.json();

                    if (response.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Upload Successful!',
                            text: 'The image has been uploaded to the file manager.',
                        });

                        // Set preview from response
                        setLogoPreview(data.thumbnailPath);

                        // Update Redux store with uploaded image
                        dispatch(setSelectedFiles([data]));
                    } else {
                        throw new Error(data.message || 'Failed to upload image.');
                    }
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Upload Failed',
                        text: error instanceof Error ? error.message : 'Something went wrong.',
                    });
                }
            }
        },
    });

    return (
        <div>
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
                    <SectionHeader title="Add Brand" />

                    <div className="px-4 w-100">
                        <Formik
                            innerRef={formikRef}
                            initialValues={{
                                name: '',
                                description: '',
                                slug: '',
                                metaTitle: '',
                                metaDescription: '',
                                metaKeywords: '',
                                logo: [], // Add logo field to handle the file
                            }}
                            validationSchema={submitForm4}
                            onSubmit={handleSubmit}
                        >
                            {({ values, handleChange, handleBlur, errors, submitCount, touched, setFieldValue, handleSubmit }) => (
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
                                                typeof errors.description === 'string' ? (
                                                    <div className="mt-1 text-danger">{errors.description}</div>
                                                ) : (
                                                    <div className="mt-1 text-success">Looks Good!</div>
                                                )
                                            ) : null}

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
        </div>

    );
};

export default AddBrandComponent;