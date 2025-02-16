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
import IconCircleCheck from '@/components/icon/icon-circle-check';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { getTranslation } from '@/i18n';
import SectionHeader from '@/components/utils/SectionHeader';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { setSelectedFiles } from '@/store/fileSelectionSlice';
import ConfirmationModal from '@/components/modal/MediaModal';
// Connect to the backend socket server
const socket = io('ws://localhost:4000'); // Make sure it matches your WebSocket server's URL

const UpdateBrandComponent = ({ brandId }: { brandId: number }) => {

    const { t, i18n } = getTranslation();
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [initialValues, setInitialValues] = useState<any>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null); // State for image preview
    const [logo, setLogo] = useState<File | null>(null); // State for file
    const [status, setStatus] = useState<string>('draft');
    const formikRef = useRef<any>(null);
    const [isChanged, setIsChanged] = useState(false);
    const [featured, setFeatured] = useState(false);
    // Get selected files from Redux
    const selectedFiles = useSelector((state: any) => state.fileSelection.selectedFileIds);
    console.log(selectedFiles, "selectedFiles");

    // Update logo preview when a new file is selected
    useEffect(() => {
        if (selectedFiles.length > 0) {
            // ✅ Get the first selected file and set preview
            const selectedFile = selectedFiles[0];
            setIsChanged(true);
            if (selectedFile) {
                setLogoPreview(
                    selectedFile.thumbnailPath
                        ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${selectedFile.thumbnailPath}`
                        : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/uploads${selectedFile.path}`
                );
            }
        }
    }, [selectedFiles]);




    const handleConfirmSelection = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        const fetchBrand = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/brand/getById?id=${brandId}&lang=${i18n.language}`);

                console.log(response, "my resposne");

                if (response.data.success) {
                    const brandData = response.data.data;
                    setStatus(brandData.status || 'draft');
                    setFeatured(brandData.featured || false);
                    setInitialValues({
                        name: brandData.name,
                        description: brandData.description,
                        slug: brandData.slug,
                        metaTitle: brandData.metaTitle,
                        metaDescription: brandData.metaDescription,
                        metaKeywords: brandData.metaKeywords,
                        logo: brandData.logo || [],
                        popularityScore: brandData.popularityScore,
                        viewCount: brandData.viewCount,
                        carCount: brandData.carCount,
                    });
                    if (brandData.logo && brandData.logo.length > 0) {
                        dispatch(setSelectedFiles(brandData.logo));

                        // ✅ Preload first logo image in preview
                        // const firstLogo = brandData.logo[0];
                        // if (firstLogo) {
                        //     setLogoPreview(
                        //         firstLogo.thumbnail
                        //             ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${firstLogo.thumbnail}`
                        //             : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${firstLogo.original}`
                        //     );
                        // }
                    }
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch brand data',
                });
            }
        };

        fetchBrand();
    }, [brandId, i18n.language]);

    const renderProgressHtml = (progress: number, message: string) => `
    <div class="mb-5 space-y-5">
        <div class="w-full h-4 bg-gray-200 rounded-full">
            <div class="bg-blue-500 h-4 rounded-full text-center text-white text-xs" style="width: ${progress}%;">${progress}%</div>
        </div>
        <p class="text-center">${message}</p>
    </div>
`;

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
    const submitForm4 = Yup.object().shape({
        name: Yup.string().required('Please fill the name').min(1, 'Name must be at least 1 characters long'),
    });

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLogo(null); // Reset the logo file
        setLogoPreview(null); // Reset the preview
        setIsChanged(true);
    };

    interface BrandFormValues {
        name: string;
        description: string;
        slug: string;
        metaTitle: string;
        metaDescription: string;
        metaKeywords: string;
        logo: any[];
    }
    const handleSubmit = async (values: BrandFormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        const payload = {
            id: brandId,
            name: values.name,
            slug: values.slug,
            description: values.description,
            metaTitle: values.metaTitle,
            metaDescription: values.metaDescription,
            metaKeywords: values.metaKeywords,
            logo: selectedFiles.map((file: any) => file.id),  // ✅ Send selectedFiles array
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

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/brand/update?lang=${i18n.language}`, {
                method: 'PUT',
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
                    text: error.message,
                });
            } else {
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

    const handleStatusChange = async (newStatus: string) => {
        try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/status/update-by-id`, {
                model: 'Brand',
                id: brandId,
                status: newStatus,
            });

            if (response.data.success) {
                setStatus(newStatus); // Update status in the component
                Swal.fire({
                    icon: 'success',
                    title: 'Status Updated',
                    text: `The brand status has been updated to ${newStatus}.`,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to update brand status.',
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while updating the status.',
            });
        }
    };

    // Detect changes in the form values
    useEffect(() => {
        if (initialValues && formikRef.current) {
            // Access the current values from Formik
            const formValues = formikRef.current.values;

            // Check if any field has changed by comparing form values to initial values
            const isFormChanged = JSON.stringify(initialValues) !== JSON.stringify(formValues);

            // Update the `isChanged` state
            setIsChanged(isFormChanged);
        }
    }, [initialValues, formikRef.current?.values]); // Trigger this effect when initialValues or formik values change


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

                        setLogoPreview(data.thumbnailPath || data.path); // ✅ Update preview
                        setIsChanged(true);
                        dispatch(setSelectedFiles([data])); // ✅ Update Redux state with new image
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



    if (!initialValues) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmSelection}
                title="Select Brand Image"
                description="Choose an image for the brand."
                allowFolders={false} // 🔹 Set based on parent component logic
                selectionMode="single" // 🔹 Set based on parent component logic
            />

            <div className="flex flex-col gap-2.5 xl:flex-row">
                <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0 ">
                    <SectionHeader title="Edit Brand" />
                    <div className="px-4 w-100">
                        <Formik
                            innerRef={formikRef}
                            initialValues={initialValues}
                            validationSchema={submitForm4}
                            onSubmit={handleSubmit}
                            enableReinitialize
                        >
                            {({ values, handleChange, handleBlur, errors, submitCount, touched, setFieldValue }) => (
                                <Form className="space-y-5">
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <div className={submitCount ? (errors.name ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="name">Name</label>
                                            <Field
                                                name="name"
                                                type="text"
                                                id="name"
                                                placeholder="Enter Name"
                                                className="form-input"
                                                onChange={(e: any) => {
                                                    handleChange(e);
                                                    setIsChanged(true); // Track changes to this field
                                                }}
                                            />
                                            <ErrorMessage name="name" component="div" className="mt-1 text-danger" />
                                        </div>

                                        <div className={submitCount ? (errors.slug ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="slug">Slug</label>
                                            <Field
                                                name="slug"
                                                type="text"
                                                id="slug"
                                                placeholder="Enter Slug"
                                                className="form-input"
                                                onChange={(e: any) => {
                                                    handleChange(e);
                                                    setIsChanged(true); // Track changes to this field
                                                }}
                                            />
                                            <ErrorMessage name="slug" component="div" className="mt-1 text-danger" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-1">
                                        <div className={submitCount ? (errors.description ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="description">Description</label>
                                            <RichTextEditor
                                                initialValue={values.description}
                                                onChange={(newContent) => {
                                                    setFieldValue('description', newContent);
                                                    setIsChanged(true); // Track changes to this field
                                                }}
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
                                                        <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-48" />
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
                                        {/* Featured Toggle Switch */}
                                        <div>
                                            <label htmlFor="featured">Featured</label>
                                            <label className="w-12 h-6 relative">
                                                <input
                                                    type="checkbox"
                                                    className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                                    checked={featured}
                                                    onChange={() => setFeatured((prev) => !prev)} // ✅ Update state locally
                                                />
                                                <span className="outline_checkbox bg-icon border-2 border-gray-300 dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-gray-300 dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full before:bg-[url('/assets/images/close.svg')] before:bg-no-repeat before:bg-center peer-checked:before:left-7 peer-checked:before:bg-[url('/assets/images/checked.svg')] peer-checked:border-primary peer-checked:before:bg-primary before:transition-all before:duration-300"></span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                        <div className={submitCount ? (errors.metaTitle ? 'has-error' : 'has-success') : ''}>
                                            <label htmlFor="metaTitle">Meta Title</label>
                                            <Field
                                                name="metaTitle"
                                                type="text"
                                                id="metaTitle"
                                                placeholder="Enter Meta Title"
                                                className="form-input"
                                                onChange={(e: any) => {
                                                    handleChange(e);
                                                    setIsChanged(true); // Track changes to this field
                                                }}
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
                                                onChange={(e: any) => {
                                                    handleChange(e);
                                                    setIsChanged(true); // Track changes to this field
                                                }}
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
                                                onChange={(e: any) => {
                                                    handleChange(e);
                                                    setIsChanged(true); // Track changes to this field
                                                }}
                                            />
                                            <ErrorMessage name="metaKeywords" component="div" className="mt-1 text-danger" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                        <div>
                                            <label htmlFor="popularityScore">Popularity Score</label>
                                            <Field
                                                name="popularityScore"
                                                type="text"
                                                id="popularityScore"
                                                className="form-input disabled:pointer-events-none disabled:bg-[#eee] dark:disabled:bg-[#1b2e4b] cursor-not-allowed"
                                                disabled
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="viewCount">View Count</label>
                                            <Field
                                                name="viewCount"
                                                type="text"
                                                id="viewCount"
                                                className="form-input disabled:pointer-events-none disabled:bg-[#eee] dark:disabled:bg-[#1b2e4b] cursor-not-allowed"
                                                disabled
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="carCount">Car Count</label>
                                            <Field
                                                name="carCount"
                                                type="text"
                                                id="carCount"
                                                className="form-input disabled:pointer-events-none disabled:bg-[#eee] dark:disabled:bg-[#1b2e4b] cursor-not-allowed"
                                                disabled
                                            />
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
                            <button type="button" className="btn btn-success w-full gap-2" onClick={() => formikRef.current.submitForm()} disabled={!isChanged}>
                                <IconSave className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                Save
                            </button>

                            {/* Publish/Unpublish Buttons */}
                            {status === 'draft' && (
                                <button type="button" className="btn btn-secondary w-full gap-2" onClick={() => handleStatusChange('published')} disabled={isChanged}>
                                    <IconCircleCheck className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                    Publish
                                </button>
                            )}

                            {status === 'published' && (
                                <button type="button" className="btn btn-warning w-full gap-2" onClick={() => handleStatusChange('draft')} disabled={isChanged}>
                                    <IconCircleCheck className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                    Unpublish
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>   </>
    );
};

export default UpdateBrandComponent;
