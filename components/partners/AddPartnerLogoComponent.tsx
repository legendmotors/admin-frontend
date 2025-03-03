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
import PartnerService from '@/services/PartnerService';
import { setSelectedFiles } from '@/store/fileSelectionSlice';

interface PartnerLogoFormValues {
  name: string;
  media: string; // Media file reference (UUID)
  link: string;
  order: number;
}

const AddPartnerLogoComponent: React.FC = () => {
  const dispatch = useDispatch();
  const formikRef = useRef<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  // Get selected files from Redux (assumes an array with file objects)
  const selectedFiles = useSelector((state: any) => state.fileSelection.selectedFileIds);

  // Update media preview and Formik "media" field when selected files change
  useEffect(() => {
    if (selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      const preview = selectedFile.thumbnailPath || selectedFile.path;
      setMediaPreview(preview);
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
    dispatch(setSelectedFiles([]));
    if (formikRef.current) {
      formikRef.current.setFieldValue('media', '');
    }
  };

  const initialValues: PartnerLogoFormValues = {
    name: '',
    media: '', // to be populated via Redux
    link: '',
    order: 0,
  };

  const PartnerLogoSchema = Yup.object().shape({
    name: Yup.string().required('Name is required.'),
    media: Yup.string().required('Media is required.'),
    link: Yup.string().url('Link must be a valid URL.'),
    order: Yup.number().min(0, 'Order must be 0 or greater.'),
  });

  const handleSubmit = async (
    values: PartnerLogoFormValues,
    { setSubmitting }: FormikHelpers<PartnerLogoFormValues>
  ) => {
    console.log('Submitting payload:', values);
    try {
      Swal.fire({
        title: 'Creating Partner Logo...',
        text: 'Please wait.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = { ...values };
      const response = await PartnerService.addPartnerLogo(payload);
      if (response?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Partner Logo Created!',
          text: 'Your partner logo has been created.',
        }).then(() => {
          window.location.href = '/partners/list';
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
        title="Select Partner Logo Media"
        description="Choose a media file for the partner logo."
        allowFolders={false}
        selectionMode="single"
      />
      <div className="flex flex-col gap-2.5 xl:flex-row">
        <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0">
          <SectionHeader title="Add New Partner Logo" />
          <div className="px-4 w-100">
            <Formik
              innerRef={formikRef}
              initialValues={initialValues}
              validationSchema={PartnerLogoSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block font-medium">
                      Name
                    </label>
                    <Field name="name" type="text" placeholder="Enter partner name" className="form-input" />
                    <ErrorMessage name="name" component="div" className="text-red-500" />
                  </div>
                  {/* Link */}
                  <div>
                    <label htmlFor="link" className="block font-medium">
                      Link (optional)
                    </label>
                    <Field name="link" type="text" placeholder="Enter partner website URL" className="form-input" />
                    <ErrorMessage name="link" component="div" className="text-red-500" />
                  </div>
                  {/* Order */}
                  <div>
                    <label htmlFor="order" className="block font-medium">
                      Order
                    </label>
                    <Field name="order" type="number" placeholder="Enter display order" className="form-input" />
                    <ErrorMessage name="order" component="div" className="text-red-500" />
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
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                    <IconSave className="shrink-0" /> Create Partner Logo
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

export default AddPartnerLogoComponent;
