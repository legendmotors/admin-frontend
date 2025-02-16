'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { useRef } from 'react';
import SectionHeader from '@/components/utils/SectionHeader';
import IconSave from '@/components/icon/icon-save';
import { GetUserDetails } from '@/services';

const AddPermissionsComponent = () => {
    const formikRef = useRef<any>(null);

    // Validation schema for the form
    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required('Please fill the permission name')
            .max(50, 'Permission name cannot exceed 50 characters'),
        description: Yup.string()
            .required('Please fill the description')
            .max(250, 'Description cannot exceed 250 characters'),
    });

    // Form submission handler
    const handleSubmit = async (
        values: { name: string; description: string },
        { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
    ) => {
        try {
            Swal.fire({
                title: 'Creating Permission...',
                html: 'Please wait while the permission is being created.',
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            // Call the API
            const response = await GetUserDetails.createPermission(values);

            // Handle success
            if (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Permission Created Successfully!',
                    text: 'The permission has been added successfully.',
                }).then(() => {
                    window.location.href = '/users/permissions/list'; // Redirect to permissions list page
                });
            }
        } catch (error: any) {
            // Extract error message and display it
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred.';

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage, // Display the error message
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-2.5 xl:flex-row">
            <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0">
                <SectionHeader title="Add Permission" />
                <div className="px-4 w-100">
                    <Formik
                        innerRef={formikRef}
                        initialValues={{ name: '', description: '' }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {() => (
                            <Form className="space-y-5">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-1">
                                    <div>
                                        <label htmlFor="name" className="form-label">
                                            Permission Name
                                        </label>
                                        <Field
                                            name="name"
                                            type="text"
                                            placeholder="Enter Permission Name"
                                            className="form-input"
                                        />
                                        <ErrorMessage
                                            name="name"
                                            component="div"
                                            className="mt-1 text-danger"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="form-label">
                                            Description
                                        </label>
                                        <Field
                                            name="description"
                                            as="textarea"
                                            placeholder="Enter Permission Description"
                                            className="form-input"
                                        />
                                        <ErrorMessage
                                            name="description"
                                            component="div"
                                            className="mt-1 text-danger"
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
                        <button
                            type="button"
                            className="btn btn-success w-full gap-2"
                            onClick={() => formikRef.current.submitForm()}
                        >
                            <IconSave className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddPermissionsComponent;
