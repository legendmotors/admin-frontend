'use client';

import React, { useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';

import PagesService from '@/services/PagesService';



const AddPageComponent: React.FC = () => {
    const formikRef = useRef<any>(null);

    // Validation schema for adding a page
    const PageSchema = Yup.object().shape({
        title: Yup.string().required('Title is required.'),
    });

    const handleSubmit = async (
        values: { title: string },
        { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
    ) => {
        try {
            Swal.fire({
                title: 'Creating Page...',
                text: 'Please wait.',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const response = await PagesService.addPage(values);
            if (response?.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Page Created!',
                    text: 'Your page has been created.',
                }).then(() => {
                    window.location.href = '/page/list';
                });
            } else {
                throw new Error(response?.msg || 'Failed to create page.');
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

    return (
        <div className="p-4">
            <h2 className="mb-4 text-2xl font-bold">Add New Page</h2>
            <Formik
                innerRef={formikRef}
                initialValues={{ title: '' }}
                validationSchema={PageSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block font-medium">
                                Title
                            </label>
                            <Field
                                name="title"
                                type="text"
                                placeholder="Enter page title"
                                className="form-input"
                            />
                            <ErrorMessage name="title" component="div" className="text-red-500" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                            Create Page
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddPageComponent;
