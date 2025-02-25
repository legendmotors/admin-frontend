'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { useEffect, useState, useRef } from 'react';
import IconSave from '@/components/icon/icon-save';
import SectionHeader from '@/components/utils/SectionHeader';
import { GetUserDetails } from '@/services';

// Define the shape for permission options
interface PermissionOption {
  value: number;
  label: string;
}

const AddRolesComponent = () => {
  const formikRef = useRef<any>(null);
  // Initial values: for a new role, name and description are empty,
  // and permissions is an empty array (as strings).
  const initialFormValues = {
    name: '',
    description: '',
    permissions: [] as string[],
  };

  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    Swal.fire({
      title: 'Creating Role...',
      html: 'Please wait while the role is being created.',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      // Create the role (without permissions)
      const roleResponse = await GetUserDetails.createRole({
        name: values.name,
        description: values.description,
      });
      console.log("Role creation response:", roleResponse);
      if (roleResponse && roleResponse.id) {
        const newRoleId = roleResponse.id;
        // Convert the selected permission IDs (stored as strings) to numbers
        const permissionIds = values.permissions.map((idStr) => Number(idStr));
        // Assign permissions to the newly created role
        const assignResponse = await GetUserDetails.assignPermissionsToRole({
          roleId: newRoleId,
          permissions: permissionIds,
        });
        if (!assignResponse?.success) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: assignResponse?.message || 'Failed to assign permissions.',
          });
          setSubmitting(false);
          return;
        }
        Swal.fire({
          icon: 'success',
          title: 'Role Created Successfully!',
          text: 'The role has been added successfully with assigned permissions.',
        }).then(() => {
          window.location.href = '/users/roles/list';
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Role creation failed. Please check the API response.',
        });
      }
    } catch (error: any) {
      console.error('Error creating role:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.response?.data?.message || 'An unexpected error occurred.',
      });
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 xl:flex-row">
      <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0">
        <SectionHeader title="Add Role" />
        <div className="px-4 w-100">
          <Formik
            innerRef={formikRef}
            initialValues={initialFormValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue }) => (
              <Form className="space-y-5">
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label htmlFor="name" className="form-label">
                      Role Name
                    </label>
                    <Field
                      name="name"
                      type="text"
                      placeholder="Enter Role Name"
                      className="form-input"
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
                  <div>
                    <h2 className="form-label text-2xl font-bold mb-4">Permissions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      {availablePermissions.map((permission) => {
                        // Check if this permission is already selected
                        const isChecked = values.permissions.includes(String(permission.value));
                        return (
                          <label key={permission.value} className="flex items-center gap-2">
                            <Field
                              type="checkbox"
                              name="permissions"
                              value={String(permission.value)}
                              className="form-checkbox"
                            />
                            <span>{permission.label}</span>
                          </label>
                        );
                      })}
                    </div>
                    <ErrorMessage name="permissions" component="div" className="mt-1 text-danger" />
                  </div>
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

export default AddRolesComponent;
