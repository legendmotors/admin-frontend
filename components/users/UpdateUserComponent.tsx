'use client';

import { useEffect, useState, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import SectionHeader from '@/components/utils/SectionHeader';
import IconSave from '@/components/icon/icon-save';
import { GetUserDetails } from '@/services';

const UpdateUserComponent = ({ userId }: { userId: number }) => {
    const [initialValues, setInitialValues] = useState<any>(null);
    const [isChanged, setIsChanged] = useState(false);
    const formikRef = useRef<any>(null);

    // ✅ Fetch User Data
    useEffect(() => {
        const fetchUser = async () => {
            const userData = await GetUserDetails.getUserById(userId);
            if (userData) {
                setInitialValues({
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    role: userData.role || 'admin',
                    verify: userData.verify || false,
                });
            }
        };

        fetchUser();
    }, [userId]);

    // ✅ Form Validation Schema
    const validationSchema = Yup.object().shape({
        firstName: Yup.string().required('First name is required'),
        lastName: Yup.string().required('Last name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        phone: Yup.string().required('Phone is required'),
        role: Yup.string().required('Role is required'),
    });

    // ✅ Handle Submit
    const handleSubmit = async (values: any, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        const response = await GetUserDetails.updateUser(userId, values);
        if (response.success) {
            Swal.fire({
                icon: 'success',
                title: 'User Updated',
                text: 'User has been updated successfully.',
            }).then(() => {
                window.location.href = '/users/list';
            });
        }
        setSubmitting(false);
    };

    // ✅ Detect Form Changes
    useEffect(() => {
        if (initialValues && formikRef.current) {
            const formValues = formikRef.current.values;
            setIsChanged(JSON.stringify(initialValues) !== JSON.stringify(formValues));
        }
    }, [initialValues, formikRef.current?.values]);

    if (!initialValues) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col gap-2.5 xl:flex-row">
            <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0 ">
                <SectionHeader title="Edit User" />
                <div className="px-4 w-100">
                    <Formik
                        innerRef={formikRef}
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({ values, handleChange }) => (
                            <Form className="space-y-5">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="firstName">First Name</label>
                                        <Field
                                            name="firstName"
                                            type="text"
                                            id="firstName"
                                            className="form-input"
                                            onChange={(e: any) => {
                                                handleChange(e);
                                                setIsChanged(true);
                                            }}
                                        />
                                        <ErrorMessage name="firstName" component="div" className="mt-1 text-danger" />
                                    </div>

                                    <div>
                                        <label htmlFor="lastName">Last Name</label>
                                        <Field
                                            name="lastName"
                                            type="text"
                                            id="lastName"
                                            className="form-input"
                                            onChange={(e: any) => {
                                                handleChange(e);
                                                setIsChanged(true);
                                            }}
                                        />
                                        <ErrorMessage name="lastName" component="div" className="mt-1 text-danger" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="email">Email</label>
                                        <Field
                                            name="email"
                                            type="email"
                                            id="email"
                                            className="form-input"
                                            onChange={(e: any) => {
                                                handleChange(e);
                                                setIsChanged(true);
                                            }}
                                        />
                                        <ErrorMessage name="email" component="div" className="mt-1 text-danger" />
                                    </div>

                                    <div>
                                        <label htmlFor="phone">Phone</label>
                                        <Field
                                            name="phone"
                                            type="text"
                                            id="phone"
                                            className="form-input"
                                            onChange={(e: any) => {
                                                handleChange(e);
                                                setIsChanged(true);
                                            }}
                                        />
                                        <ErrorMessage name="phone" component="div" className="mt-1 text-danger" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="role">Role</label>
                                        <Field
                                            as="select"
                                            name="role"
                                            id="role"
                                            className="form-input"
                                            onChange={(e: any) => {
                                                handleChange(e);
                                                setIsChanged(true);
                                            }}
                                        >
                                            <option value="super_admin">Super Admin</option>
                                            <option value="admin">Admin</option>
                                            <option value="moderator">Moderator</option>
                                            <option value="editor">Editor</option>
                                            <option value="support">Support</option>
                                            <option value="sales_manager">Sales Manager</option>
                                            <option value="accountant">Accountant</option>
                                            <option value="inventory_manager">Inventory Manager</option>
                                            <option value="hr_manager">HR Manager</option>
                                            <option value="marketing_manager">Marketing Manager</option>
                                            <option value="developer">Developer</option>
                                            <option value="client">Client</option>

                                        </Field>
                                        <ErrorMessage name="role" component="div" className="mt-1 text-danger" />
                                    </div>

                                    <div>
                                        <label htmlFor="verify">Verified</label>
                                        <Field
                                            as="select"
                                            name="verify"
                                            id="verify"
                                            className="form-input"
                                            onChange={(e: any) => {
                                                handleChange(e);
                                                setIsChanged(true);
                                            }}
                                        >
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </Field>
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

                        </div>
                    </div>
                </div>
        </div>
    );
};

export default UpdateUserComponent;
