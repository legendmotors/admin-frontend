'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';

import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import ConfirmationModal from '@/components/modal/MediaModal';
import SectionHeader from '@/components/utils/SectionHeader';
import IconSave from '@/components/icon/icon-save';
import BannerService from '@/services/BannerService';
import { setSelectedFiles } from '@/store/fileSelectionSlice';

interface BannerFormValues {
  identifier: string;
  title: string;
  description: string;
  media: string; // Media file reference (UUID)
  link: string;
  featured: boolean;
  status: 'draft' | 'published';
  buttontext: string; // New field for banner button text
}

const AddBannerComponent: React.FC = () => {
  const dispatch = useDispatch();
  const formikRef = useRef<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  // Get selected files from Redux (should be an array with file objects)
  const selectedFiles = useSelector((state: any) => state.fileSelection.selectedFileIds);

  // When selectedFiles change, update mediaPreview and Formik field "media"
  useEffect(() => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      const preview = selectedFile.thumbnailPath || selectedFile.path;
      setMediaPreview(preview);
      // Update Formik field if form is mounted
      if (formikRef.current) {
        formikRef.current.setFieldValue('media', selectedFile.id);
      }
    }
  }, [selectedFiles]);

  const handleConfirmSelection = () => {
    setIsModalOpen(false);
  };

  const handleRemoveMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMediaPreview(null);
    // Clear Redux store for selected files and update Formik field
    dispatch(setSelectedFiles([]));
    if (formikRef.current) {
      formikRef.current.setFieldValue('media', '');
    }
  };

  const initialValues: BannerFormValues = {
    identifier: '',
    title: '',
    description: '',
    media: '', // will be populated via Redux (set to file ID)
    link: '',
    featured: false,
    status: 'draft',
    buttontext: '', // New initial value for banner button text
  };

  const BannerSchema = Yup.object().shape({
    identifier: Yup.string().required('Identifier is required.'),
    title: Yup.string(), // Title is now optional
    description: Yup.string(),
    media: Yup.string().required('Media is required.'), // must be a non-empty string (file ID)
    link: Yup.string().url('Link must be a valid URL.'),
    featured: Yup.boolean(),
    status: Yup.string().oneOf(['draft', 'published']).required('Status is required.'),
    buttontext: Yup.string(), // buttontext is optional
  });

  const handleSubmit = async (
    values: BannerFormValues,
    { setSubmitting }: FormikHelpers<BannerFormValues>
  ) => {
    // Log payload for debugging
    console.log('Submitting payload:', values);
    try {
      Swal.fire({
        title: 'Creating Banner...',
        text: 'Please wait.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = { ...values };
      const response = await BannerService.addBanner(payload);
      if (response?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Banner Created!',
          text: 'Your banner has been created.',
        }).then(() => {
          window.location.href = '/banners/list';
        });
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
            // Update preview and Redux store with file data
            setMediaPreview(data.thumbnailPath || data.path);
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
        <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0 ">
          <SectionHeader title="Add New Banner" />
          <div className="px-4 w-100">
            <Formik
              innerRef={formikRef}
              initialValues={initialValues}
              validationSchema={BannerSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  {/* Identifier */}
                  <div>
                    <label htmlFor="identifier" className="block font-medium">
                      Identifier
                    </label>
                    <Field name="identifier" type="text" placeholder="Enter banner identifier" className="form-input" />
                    <ErrorMessage name="identifier" component="div" className="text-red-500" />
                  </div>
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block font-medium">
                      Title
                    </label>
                    <Field name="title" type="text" placeholder="Enter banner title (optional)" className="form-input" />
                    <ErrorMessage name="title" component="div" className="text-red-500" />
                  </div>
                  {/* Button Text */}
                  <div>
                    <label htmlFor="buttontext" className="block font-medium">
                      Button Text
                    </label>
                    <Field name="buttontext" type="text" placeholder="Enter banner button text" className="form-input" />
                    <ErrorMessage name="buttontext" component="div" className="text-red-500" />
                  </div>
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block font-medium">
                      Description
                    </label>
                    <Field as="textarea" name="description" placeholder="Enter banner description" className="form-textarea" />
                    <ErrorMessage name="description" component="div" className="text-red-500" />
                  </div>
                  {/* Media Selection */}
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
                            <img
                              src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${mediaPreview}`}
                              alt="Media Preview"
                              className="max-w-full max-h-48"
                            />
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
                      <label htmlFor="link" className="block font-medium">
                        Link (optional)
                      </label>
                      <Field name="link" type="text" placeholder="Enter link URL" className="form-input" />
                      <ErrorMessage name="link" component="div" className="text-red-500" />
                    </div>
                  </div>
                  {/* Featured */}
                  <div>
                    <label htmlFor="featured" className="block font-medium">
                      Featured
                    </label>
                    <Field name="featured" type="checkbox" className="form-checkbox" />
                    <ErrorMessage name="featured" component="div" className="text-red-500" />
                  </div>
                  {/* Status */}
                  <div>
                    <label htmlFor="status" className="block font-medium">
                      Status
                    </label>
                    <Field as="select" name="status" className="form-select">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </Field>
                    <ErrorMessage name="status" component="div" className="text-red-500" />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                    <IconSave className="shrink-0" /> Create Banner
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

export default AddBannerComponent;
