'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { useEffect, useState, useRef } from 'react';
import IconSave from '@/components/icon/icon-save';
import SectionHeader from '@/components/utils/SectionHeader';
import { GetUserDetails } from '@/services';

const UpdateRolesComponent = ({ roleId }: { roleId: number }) => {
    const formikRef = useRef<any>(null);
    const [initialValues, setInitialValues] = useState<{ name: string; description: string } | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch role details
    useEffect(() => {
        const fetchRoleDetails = async () => {
            setLoading(true);
            try {
                const response = await GetUserDetails.getRoleById(roleId); // Use the correct method to fetch role details
                if (response) {
                    setInitialValues({
                        name: response.name,
                        description: response.description,
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to fetch role details.',
                    });
                }
            } catch (error) {
                console.error('Error fetching role details:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred while fetching role details. Please try again.',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchRoleDetails();
    }, [roleId]);

    // Form validation schema
    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required('Please fill the role name')
            .max(50, 'Role name cannot exceed 50 characters'),
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
            title: 'Updating Role...',
            html: 'Please wait while the role is being updated.',
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            // Combine roleId with values into a single object
            const response = await GetUserDetails.updateRole({ id: roleId, ...values });
            console.log(response, "response");

            if (response?.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Role Updated Successfully!',
                }).then(() => {
                    window.location.href = '/users/roles/list'; // Redirect to roles list page
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response?.message || 'Failed to update role.',
                });
            }
        } catch (error: any) {
            console.error('Error updating role:', error);
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
        return <div className="text-center text-danger">Failed to load role details.</div>;
    }

    return (
        <div className="flex flex-col gap-2.5 xl:flex-row">
            <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0">
                <SectionHeader title="Edit Role" />
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
                                        Role Name
                                    </label>
                                    <Field
                                        name="name"
                                        type="text"
                                        placeholder="Enter Role Name"
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
                                        placeholder="Enter Role Description"
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

export default UpdateRolesComponent;
