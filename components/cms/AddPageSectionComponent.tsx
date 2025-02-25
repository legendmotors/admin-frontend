'use client';

import React, { useRef } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import RichTextEditor from '@/components/editor/RichTextEditor';
import PageSectionService from '@/services/PageSectionService';

const MySwal = withReactContent(Swal);

/** Props passed to this component. */
interface AddPageSectionProps {
    /** The page ID you want to attach this section to. */
    pageId?: number;
}

/** The form's field structure (excluding pageId). */
interface PageSectionFormValues {
    sectionKey: string;
    content: string;
}

const AddPageSectionComponent: React.FC<AddPageSectionProps> = ({ pageId }) => {
    const formikRef = useRef<any>(null);

    // Initial form values (no pageId here)
    const initialValues: PageSectionFormValues = {
        sectionKey: '',
        content: '',
    };

    // Validation schema for sectionKey and content
    const PageSectionSchema = Yup.object().shape({
        sectionKey: Yup.string().required('Section key is required.'),
        content: Yup.string().required('Content is required.'),
    });

    // Submit handler
    const handleSubmit = async (
        values: PageSectionFormValues,
        { setSubmitting }: FormikHelpers<PageSectionFormValues>
    ) => {
        try {
            // Optional: You can handle a missing pageId however you like
            if (!pageId) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No page ID was provided.',
                });
                return;
            }

            Swal.fire({
                title: 'Creating Page Section...',
                text: 'Please wait.',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            // Merge the pageId with the other form values
            const payload = { pageId, ...values };

            // Call your service to create the section
            const response = await PageSectionService.addPageSection(payload);
            if (response?.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Page Section Created!',
                    text: 'Your page section has been created.',
                }).then(() => {
                    window.location.href = `/page-section/list/${pageId}`;
                });
            } else {
                throw new Error(response?.msg || 'Failed to create page section.');
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
            <h2 className="mb-4 text-2xl font-bold">Add New Page Section</h2>
            <Formik
                innerRef={formikRef}
                initialValues={initialValues}
                validationSchema={PageSectionSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, setFieldValue, values }) => (
                    <Form className="space-y-4">
                        {/* Section Key */}
                        <div>
                            <label htmlFor="sectionKey" className="block font-medium">
                                Section Key
                            </label>
                            <Field
                                name="sectionKey"
                                type="text"
                                placeholder="Enter section key"
                                className="form-input"
                            />
                            <ErrorMessage name="sectionKey" component="div" className="text-red-500" />
                        </div>

                        {/* Default Content (English) */}
                        <div>
                            <label htmlFor="content" className="block font-medium">
                                Content (Default English)
                            </label>
                            <RichTextEditor
                                initialValue={values.content}
                                onChange={(content: string) => setFieldValue('content', content)}
                            />
                            <ErrorMessage name="content" component="div" className="text-red-500" />
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                            Create Page Section
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddPageSectionComponent;
