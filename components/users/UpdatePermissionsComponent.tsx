'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { useEffect, useState, useRef } from 'react';
import IconSave from '@/components/icon/icon-save';
import SectionHeader from '@/components/utils/SectionHeader';
import { GetUserDetails } from '@/services';

const UpdatePermissionsComponent = ({ permissionId }: { permissionId: number }) => {
    const formikRef = useRef<any>(null);
    const [initialValues, setInitialValues] = useState<{ name: string; description: string } | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch permission details
    useEffect(() => {
        const fetchPermissionDetails = async () => {
            setLoading(true);
            try {
                const response = await GetUserDetails.getPermissionById(permissionId); // Use the correct method to fetch permission details
                if (response) {
                    setInitialValues({
                        name: response.name,
                        description: response.description,
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to fetch permission details.',
                    });
                }
            } catch (error) {
                console.error('Error fetching permission details:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred while fetching permission details. Please try again.',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPermissionDetails();
    }, [permissionId]);

    // Form validation schema
    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required('Please fill the permission name')
            .max(50, 'Permission name cannot exceed 50 characters'),
        description: Yup.string()
            .required('Please fill the description')
            .max(250, 'Description cannot exceed 250 characters'),
    });

    // Handle form submission
    const handleSubmit = async (
        values: { name: string; description: string },
        { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
    ) => {
        Swal.fire({
            title: 'Updating Permission...',
            html: 'Please wait while the permission is being updated.',
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            // Combine permissionId with values into a single object
            const response = await GetUserDetails.updatePermission({ id: permissionId, ...values });

            if (response?.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Permission Updated Successfully!',
                }).then(() => {
                    window.location.href = '/users/permissions/list'; // Redirect to permissions list page
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response?.message || 'Failed to update permission.',
                });
            }
        } catch (error: any) {
            console.error('Error updating permission:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error?.response?.data?.message || 'An unexpected error occurred.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (!initialValues) {
        return <div className="text-center text-danger">Failed to load permission details.</div>;
    }

    return (
        <div className="flex flex-col gap-2.5 xl:flex-row">
            <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0">
                <SectionHeader title="Edit Permission" />
                <div className="px-4 w-100">
                    <Formik
                        innerRef={formikRef}
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {() => (
                            <Form className="space-y-5">
                                <div>
                                    <label htmlFor="name" className="form-label">
                                        Permission Name
                                    </label>
                                    <Field
                                        name="name"
                                        type="text"
                                        placeholder="Enter Permission Name"
                                        className="form-input bg-gray-300"
                                        disabled
                                    />
                                    <ErrorMessage name="name" component="div" className="mt-1 text-danger" />
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
                                    <ErrorMessage name="description" component="div" className="mt-1 text-danger" />
                                </div>
                                <button type="submit" className="btn btn-success w-full gap-2">
                                    <IconSave className="shrink-0" /> Save
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default UpdatePermissionsComponent;
