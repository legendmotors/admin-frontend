'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import ConfirmationModal from '@/components/modal/MediaModal';
import SectionHeader from '@/components/utils/SectionHeader';
import IconSave from '@/components/icon/icon-save';
import BannerService from '@/services/BannerService';
import { setSelectedFiles } from '@/store/fileSelectionSlice';

const MySwal = withReactContent(Swal);

interface BannerFormValues {
    title: string;
    description: string;
    media: string; // This will be a UUID (media file ID)
    link: string;
    featured: boolean;
    status: 'draft' | 'published';
}

interface UpdateBannerComponentProps {
    bannerId: number;
}

const UpdateBannerComponent: React.FC<UpdateBannerComponentProps> = ({ bannerId }) => {
    const dispatch = useDispatch();
    const formikRef = useRef<any>(null);
    const [initialValues, setInitialValues] = useState<BannerFormValues | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Get selected files from Redux
    const selectedFiles = useSelector((state: any) => state.fileSelection.selectedFileIds);

    // Fetch banner data on mount
    useEffect(() => {
        const fetchBanner = async () => {
            const response = await BannerService.getBannerById(bannerId);
            if (response) {
                const data = response.data;
                setInitialValues({
                    title: data.title,
                    description: data.description || '',
                    media: data.media || '',
                    link: data.link || '',
                    featured: data.featured || false,
                    status: data.status,
                });
                if (data.media) {
                    setMediaPreview(`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${data.media}`);
                }
                // Populate Redux with the current media so that dropzone updates work correctly
                dispatch(setSelectedFiles([data.media]));
            }
        };
        fetchBanner();
    }, [bannerId, dispatch]);

    // Update media preview when Redux store changes
    useEffect(() => {
        if (selectedFiles && selectedFiles.length > 0) {
            const selectedFile = selectedFiles[0];
            // Use thumbnailPath if available; otherwise, use file path
            const preview = selectedFile.thumbnailPath || selectedFile.path;
            setMediaPreview(preview);
            // Update Formik field "media" if form is mounted
            if (formikRef.current) {
                formikRef.current.setFieldValue('media', selectedFile.id);
            }
        }
    }, [selectedFiles]);

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

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}file-system/upload`, {
                        method: 'POST',
                        body: formData,
                    });
                    const data = await response.json();
                    if (response.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Upload Successful!',
                            text: 'The media has been uploaded.',
                        });
                        // Use thumbnailPath if available, else use path
                        const preview = data.thumbnailPath || data.path;
                        setMediaPreview(preview);
                        dispatch(setSelectedFiles([data]));
                    } else {
                        throw new Error(data.message || 'Failed to upload media.');
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

    const handleConfirmSelection = () => {
        setIsModalOpen(false);
    };

    const handleRemoveMedia = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMediaPreview(null);
        dispatch(setSelectedFiles([]));
        if (formikRef.current) {
            formikRef.current.setFieldValue('media', '');
        }
    };

    const BannerSchema = Yup.object().shape({
        title: Yup.string().required('Title is required.'),
        description: Yup.string(),
        media: Yup.string().required('Media is required.'),
        link: Yup.string().url('Link must be a valid URL.'),
        featured: Yup.boolean(),
        status: Yup.string().oneOf(['draft', 'published']).required('Status is required.'),
    });

    const handleSubmit = async (
        values: BannerFormValues,
        { setSubmitting }: FormikHelpers<BannerFormValues>
    ) => {
        // Merge the media from Redux (if any) into payload
        const payload = {
            ...values,
            media: selectedFiles.length > 0 ? selectedFiles[0].id : values.media,
            id: bannerId,
        };

        try {
            Swal.fire({
                title: 'Updating Banner...',
                text: 'Please wait.',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const response = await BannerService.updateBanner(payload);
            if (response?.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Banner Updated!',
                    text: 'Your banner has been updated.',
                }).then(() => {
                    window.location.href = '/banners/list';
                });
            } else {
                throw new Error(response?.msg || 'Failed to update banner.');
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An error occurred.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (!initialValues) return <div>Loading...</div>;

    return (
        <>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmSelection}
                title="Select Banner Media"
                description="Choose a media file for the banner."
                allowFolders={false}
                selectionMode="single"
            />
            <div className="flex flex-col gap-2.5 xl:flex-row">
                <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0">
                    <SectionHeader title="Edit Banner" />
                    <div className="px-4 w-full">
                        <Formik
                            innerRef={formikRef}
                            initialValues={initialValues}
                            validationSchema={BannerSchema}
                            onSubmit={handleSubmit}
                            enableReinitialize
                        >
                            {({ isSubmitting, setFieldValue, values }) => (
                                <Form className="space-y-4">
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <div>
                                            <label htmlFor="title" className="block font-medium">Title</label>
                                            <Field name="title" type="text" placeholder="Enter banner title" className="form-input" />
                                            <ErrorMessage name="title" component="div" className="text-red-500" />
                                        </div>
                                        <div>
                                            <label htmlFor="slug" className="block font-medium">Slug</label>
                                            <Field name="slug" type="text" disabled className="form-input" />
                                            <ErrorMessage name="slug" component="div" className="text-red-500" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5">
                                        <div>
                                            <label htmlFor="description" className="block font-medium">Description</label>
                                            <Field as="textarea" name="description" placeholder="Enter banner description" className="form-textarea" />
                                            <ErrorMessage name="description" component="div" className="text-red-500" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <div
                                            {...getRootProps()}
                                            className="dropzone border-dashed border-2 border-gray-300 rounded-lg p-5 cursor-pointer text-center"
                                            onClick={() => setIsModalOpen(true)}
                                        >
                                            <input {...getInputProps()} name="media" id="media" />
                                            {mediaPreview ? (
                                                <div className="file-selected">
                                                    <p className="mb-2">Selected Media:</p>
                                                    <div className="flex justify-center">
                                                        <img src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${mediaPreview}`} alt="Media Preview" className="max-w-full max-h-48" />
                                                    </div>
                                                    <button type="button" onClick={handleRemoveMedia} className="mt-2 text-red-500 underline">
                                                        Remove Media
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-gray-500">Drag & drop a media file here, or click to select one</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="link" className="block font-medium">Link (optional)</label>
                                            <Field name="link" type="text" placeholder="Enter link URL" className="form-input" />
                                            <ErrorMessage name="link" component="div" className="text-red-500" />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="featured" className="block font-medium">Featured</label>
                                        <Field name="featured" type="checkbox" className="form-checkbox" />
                                        <ErrorMessage name="featured" component="div" className="text-red-500" />
                                    </div>

                                    <div>
                                        <label htmlFor="status" className="block font-medium">Status</label>
                                        <Field as="select" name="status" className="form-select">
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </Field>
                                        <ErrorMessage name="status" component="div" className="text-red-500" />
                                    </div>

                                    <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                                        <IconSave className="shrink-0" /> Save
                                    </button>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UpdateBannerComponent;
