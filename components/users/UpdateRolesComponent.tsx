'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { useEffect, useState, useRef } from 'react';
import IconSave from '@/components/icon/icon-save';
import SectionHeader from '@/components/utils/SectionHeader';
import { GetUserDetails } from '@/services';

// Define the shape for permission options (for available permissions)
interface PermissionOption {
    value: number;
    label: string;
}

const UpdateRolesComponent = ({ roleId }: { roleId: number }) => {
    const formikRef = useRef<any>(null);
    const [initialValues, setInitialValues] = useState<{
        name: string;
        description: string;
        // Store selected permission IDs as strings for Field checkboxes
        permissions: string[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [availablePermissions, setAvailablePermissions] = useState<PermissionOption[]>([]);

    // Fetch all available permissions (assume up to 100)
    useEffect(() => {
        const fetchAvailablePermissions = async () => {
            try {
                const response = await GetUserDetails.getAllPermissions({ page: 1, limit: 100 });
                if (response && response.data) {
                    const options: PermissionOption[] = response.data.map((perm: any) => ({
                        value: perm.id,
                        label: perm.name,
                    }));
                    setAvailablePermissions(options);
                }
            } catch (error) {
                console.error('Error fetching available permissions:', error);
            }
        };
        fetchAvailablePermissions();
    }, []);

    // Fetch role details (including assigned permissions) on mount
    useEffect(() => {
        const fetchRoleDetails = async () => {
            setLoading(true);
            try {
                // Call our service method that hits /roles/getById?id=roleId
                const response = await GetUserDetails.getRoleById(roleId);

                console.log(response, "response");

                if (response && response.success && response.data) {
                    const roleData = response.data;
                    // Map existing permissions to an array of strings (permission IDs)
                    let assignedPermissionIds: string[] = [];
                    if (Array.isArray(roleData.permissions)) {
                        assignedPermissionIds = roleData.permissions.map((perm: any) =>
                            String(perm.id)
                        );
                    }
                    setInitialValues({
                        name: roleData.name,
                        description: roleData.description,
                        permissions: assignedPermissionIds,
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

    // Validation schema
    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required('Please fill the role name')
            .max(50, 'Role name cannot exceed 50 characters'),
        description: Yup.string()
            .required('Please fill the description')
            .max(250, 'Description cannot exceed 250 characters'),
        permissions: Yup.array().min(1, 'Please assign at least one permission'),
    });

    // Form submission handler
    const handleSubmit = async (
        values: { name: string; description: string; permissions: string[] },
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
            // 1. Update role name/description
            const updateRoleResponse = await GetUserDetails.updateRole({
                id: roleId,
                name: values.name,
                description: values.description,
            });
            if (!updateRoleResponse?.success) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: updateRoleResponse?.message || 'Failed to update role.',
                });
                setSubmitting(false);
                return;
            }
            // 2. Update assigned permissions: convert string IDs to numbers
            const permissionIds = values.permissions.map((idStr) => Number(idStr));
            const assignResponse = await GetUserDetails.assignPermissionsToRole({
                roleId,
                permissions: permissionIds,
            });
            if (!assignResponse?.success) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: assignResponse?.message || 'Failed to update permissions.',
                });
                setSubmitting(false);
                return;
            }
            Swal.fire({
                icon: 'success',
                title: 'Role Updated Successfully!',
            }).then(() => {
                window.location.href = '/users/roles/list';
            });
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
                        {({ values }) => (
                            <Form className="space-y-5">
                                <div>
                                    <label htmlFor="name" className="form-label">Role Name</label>
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
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <Field
                                        name="description"
                                        as="textarea"
                                        placeholder="Enter Role Description"
                                        className="form-input"
                                    />
                                    <ErrorMessage name="description" component="div" className="mt-1 text-danger" />
                                </div>
                                <div>
                                    <h2 className="form-label text-2xl font-bold mb-4">Permissions</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                        {availablePermissions.map((permission) => (
                                            <label key={permission.value} className="flex items-center gap-2">
                                                <Field
                                                    type="checkbox"
                                                    name="permissions"
                                                    value={String(permission.value)}
                                                    className="form-checkbox"
                                                // Note: With Field checkboxes, Formik automatically manages the array.
                                                />
                                                <span>{permission.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <ErrorMessage name="permissions" component="div" className="mt-1 text-danger" />
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
