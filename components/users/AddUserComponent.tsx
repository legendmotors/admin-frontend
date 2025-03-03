'use client';

import { useState, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import SectionHeader from '@/components/utils/SectionHeader';
import IconSave from '@/components/icon/icon-save';
import { GetUserDetails, GetUserLogin } from '@/services';
import { AsyncPaginate } from 'react-select-async-paginate';

const AddAdminUserComponent = () => {
  const [selectedRole, setSelectedRole] = useState<{ value: number; label: string } | null>(null);
  const formikRef = useRef<any>(null);

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    roleId: null,
  };

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

  // Validation schema using Yup
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm Password is required'),
    roleId: Yup.number().required('Role is required'),
  });

  // Handle form submission
  const handleSubmit = async (
    values: any,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    // Prepare payload omitting confirmPassword field
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      password: values.password,
      roleId: values.roleId,
    };

    // Call the addAdminUser service to add a new admin user
    const response = await GetUserLogin.addAdminUser(payload);
    if (response && response.success) {
      Swal.fire({
        icon: 'success',
        title: 'Admin User Added',
        text: 'Admin user has been added successfully.',
      }).then(() => {
        window.location.href = '/users/list';
      });
    }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-2.5 xl:flex-row">
      <div className="panel flex-1 px-0 pb-6 pt-0">
        <SectionHeader title="Add New Admin User" />
        <div className="px-4 w-100">
          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, setFieldValue, dirty }) => (
              <Form className="space-y-5">
                {/* First & Last Name */}
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
                {/* Email & Phone */}
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
                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="password">Password</label>
                    <Field name="password" type="password" id="password" className="form-input" onChange={handleChange} />
                    <ErrorMessage name="password" component="div" className="mt-1 text-danger" />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <Field name="confirmPassword" type="password" id="confirmPassword" className="form-input" onChange={handleChange} />
                    <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-danger" />
                  </div>
                </div>
                {/* Role Selection */}
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
                </div>
                {/* Submit Button */}
                <div className="mt-4">
                  <button type="submit" className="btn btn-success w-full gap-2" disabled={!dirty}>
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

export default AddAdminUserComponent;
