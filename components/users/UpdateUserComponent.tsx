'use client';

import { useEffect, useState, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import SectionHeader from '@/components/utils/SectionHeader';
import IconSave from '@/components/icon/icon-save';
import { GetUserDetails } from '@/services';
import { AsyncPaginate } from 'react-select-async-paginate';

const UpdateUserComponent = ({ userId }: { userId: number }) => {
  const [initialValues, setInitialValues] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<{ value: number; label: string } | null>(null);
  const formikRef = useRef<any>(null);

  // Fetch user data and pre-populate form values
  useEffect(() => {
    const fetchUser = async () => {
      const response = await GetUserDetails.getUserById(userId);
      // Assuming the response structure is { success: true, data: { ... } }
      const userData = response?.data || response;
      if (userData) {
        setInitialValues({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          roleId: userData.roleId || null, // Role identifier
          verify: userData.verify || false,
        });
        // Pre-fill selectedRole using the associated role details if available
        if (userData.role) {
          setSelectedRole({ value: userData.role.id, label: userData.role.name });
        }
      }
    };

    fetchUser();
  }, [userId]);

  // Define loadOptions function for AsyncPaginate to load roles with pagination
  const fetchRoles = async (
    search: string,
    loadedOptions: any,
    { page }: { page: number }
  ) => {
    const params = { search, page, limit: 10 };
    const response = await GetUserDetails.listRoles(params);
    if (response && response.data) {
      const options = response.data.map((role: any) => ({
        value: role.id,
        label: role.name,
      }));
      const hasMore = page < response.pagination.totalPages;
      return {
        options,
        hasMore,
        additional: { page: page + 1 },
      };
    }
    return { options: [], hasMore: false, additional: { page: 1 } };
  };

  // Form validation schema
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().required('Phone is required'),
    roleId: Yup.number().required('Role is required'),
  });

  // Handle form submission
  const handleSubmit = async (
    values: any,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
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

  if (!initialValues) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-2.5 xl:flex-row">
      <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0">
        <SectionHeader title="Edit User" />
        <div className="px-4 w-100">
          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ handleChange, setFieldValue, dirty }) => (
              <Form className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="firstName">First Name</label>
                    <Field name="firstName" type="text" id="firstName" className="form-input" onChange={handleChange} />
                    <ErrorMessage name="firstName" component="div" className="mt-1 text-danger" />
                  </div>
                  <div>
                    <label htmlFor="lastName">Last Name</label>
                    <Field name="lastName" type="text" id="lastName" className="form-input" onChange={handleChange} />
                    <ErrorMessage name="lastName" component="div" className="mt-1 text-danger" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="email">Email</label>
                    <Field name="email" type="email" id="email" className="form-input" onChange={handleChange} />
                    <ErrorMessage name="email" component="div" className="mt-1 text-danger" />
                  </div>
                  <div>
                    <label htmlFor="phone">Phone</label>
                    <Field name="phone" type="text" id="phone" className="form-input" onChange={handleChange} />
                    <ErrorMessage name="phone" component="div" className="mt-1 text-danger" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="roleId">Role</label>
                    <AsyncPaginate
                      name="roleId"
                      loadOptions={fetchRoles}
                      debounceTimeout={300}
                      additional={{ page: 1 }}
                      value={selectedRole}
                      onChange={(option: { value: number; label: string } | null) => {
                        setSelectedRole(option);
                        setFieldValue('roleId', option?.value || null);
                      }}
                    />
                    <ErrorMessage name="roleId" component="div" className="mt-1 text-danger" />
                  </div>
                  <div>
                    <label htmlFor="verify">Verified</label>
                    <Field as="select" name="verify" id="verify" className="form-input" onChange={handleChange}>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </Field>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="btn btn-success w-full gap-2"
                    onClick={() => formikRef.current.submitForm()}
                    disabled={!dirty}
                  >
                    <IconSave className="shrink-0 ltr:mr-2 rtl:ml-2" />
                    Save
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default UpdateUserComponent;
