'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import io from 'socket.io-client';
import SectionHeader from '@/components/utils/SectionHeader';
import IconSave from '@/components/icon/icon-save';
import BlogTypeService from '@/services/BlogTypeService';
import { useRouter } from 'next/navigation';

// Connect to your backend Socket.io server
const socket = io(`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}`);

interface BlogTypeFormValues {
    name: string;
}

const AddBlogTypeComponent: React.FC = () => {
    const formikRef = useRef<any>(null);
    const router = useRouter();
    const [progress, setProgress] = useState<number>(0);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const initialValues: BlogTypeFormValues = { name: '' };


    useEffect(() => {
        const progressHandler = (data: { progress: number; message: string; status: string }) => {
            if (data.progress) setProgress(data.progress);
            if (data.message) setStatusMessage(data.message);

            Swal.update({
                html: renderProgressHtml(data.progress, data.message),
            });

        };

        socket.on('progress', progressHandler);
        return () => {
            socket.off('progress', progressHandler);
        };
    }, [router]);


    const renderProgressHtml = (progress: number, message: string) => `
      <div class="mb-5 space-y-5">
        <div class="w-full h-4 bg-gray-200 rounded-full">
          <div class="bg-blue-500 h-4 rounded-full text-center text-white text-xs" style="width: ${progress}%;">
            ${progress}%
          </div>
        </div>
        <p class="text-center">${message}</p>
      </div>
    `;

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Type name is required.'),
    });


    const handleSubmit = async (
        values: BlogTypeFormValues,
        { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
    ) => {
        try {
            Swal.fire({
                title: 'Creating Type...',
                html: renderProgressHtml(0, 'Initializing...'),
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
            });

            const response = await BlogTypeService.addBlogType(values);
            setSubmitting(false);

            if (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Type Created Successfully!',
                    text: 'The type has been created successfully.',
                }).then(() => {
                    window.location.href = '/blogs/blog-type/list'
                });
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to create type.' });
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

    return (
        <div className="flex flex-col gap-6 xl:flex-row">
            <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0">
                <SectionHeader title="Add Blog Type" />
                <div className="px-4 w-full">
                    <Formik
                        innerRef={formikRef}
                        initialValues={initialValues ?? { name: '' }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form className="space-y-5">
                                <div>
                                    <label htmlFor="name">Type Name</label>
                                    <Field name="name" type="text" className="form-input" placeholder="Enter type name" />
                                    <ErrorMessage name="name" component="div" className="mt-1 text-danger" />
                                </div>
                                <button type="submit" className="btn btn-success w-full gap-2" disabled={isSubmitting}>
                                    <IconSave className="shrink-0" /> Save Type
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default AddBlogTypeComponent;
