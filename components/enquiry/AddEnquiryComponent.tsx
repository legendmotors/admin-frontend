'use client';

import React, { useRef } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';

import SectionHeader from '@/components/utils/SectionHeader';
import CarEnquiryService from '@/services/CarEnquiryService';



interface EnquiryFormValues {
    stockId: string;
    year: number;
    brand: string;
    model: string;
    trim: string;
    name: string;
    phoneNumber?: string;
    emailAddress: string;
}

const AddEnquiryComponent: React.FC = () => {
    const formikRef = useRef<any>(null);

    const initialValues: EnquiryFormValues = {
        stockId: '',
        year: new Date().getFullYear(),
        brand: '',
        model: '',
        trim: '',
        name: '',
        phoneNumber: '',
        emailAddress: '',
    };

    const EnquirySchema = Yup.object().shape({
        stockId: Yup.string().required('Stock ID is required.'),
        year: Yup.number().required('Year is required.'),
        brand: Yup.string().required('Brand is required.'),
        model: Yup.string().required('Model is required.'),
        trim: Yup.string().required('Trim is required.'),
        name: Yup.string().required('Your name is required.'),
        emailAddress: Yup.string().email('Please enter a valid email address.').required('Email is required.'),
        phoneNumber: Yup.string(),
    });

    const handleSubmit = async (
        values: EnquiryFormValues,
        { setSubmitting }: FormikHelpers<EnquiryFormValues>
    ) => {
        try {
            Swal.fire({
                title: 'Submitting Enquiry...',
                text: 'Please wait.',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const response = await CarEnquiryService.addCarEnquiry(values);
            if (response?.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Enquiry Submitted!',
                    text: 'Thank you for your enquiry.',
                }).then(() => {
                    window.location.href = '/enquiry/list';
                });
            } else {
                throw new Error(response?.msg || 'Failed to submit enquiry.');
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
            <SectionHeader title="Submit a Car Enquiry" />
            <Formik
                innerRef={formikRef}
                initialValues={initialValues}
                validationSchema={EnquirySchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4">
                        <div>
                            <label htmlFor="stockId" className="block font-medium">Stock ID</label>
                            <Field name="stockId" type="text" placeholder="Enter stock ID" className="form-input" />
                            <ErrorMessage name="stockId" component="div" className="text-red-500" />
                        </div>
                        <div>
                            <label htmlFor="year" className="block font-medium">Year</label>
                            <Field name="year" type="number" placeholder="Enter year" className="form-input" />
                            <ErrorMessage name="year" component="div" className="text-red-500" />
                        </div>
                        <div>
                            <label htmlFor="brand" className="block font-medium">Brand</label>
                            <Field name="brand" type="text" placeholder="Enter brand" className="form-input" />
                            <ErrorMessage name="brand" component="div" className="text-red-500" />
                        </div>
                        <div>
                            <label htmlFor="model" className="block font-medium">Model</label>
                            <Field name="model" type="text" placeholder="Enter model" className="form-input" />
                            <ErrorMessage name="model" component="div" className="text-red-500" />
                        </div>
                        <div>
                            <label htmlFor="trim" className="block font-medium">Trim</label>
                            <Field name="trim" type="text" placeholder="Enter trim" className="form-input" />
                            <ErrorMessage name="trim" component="div" className="text-red-500" />
                        </div>
                        <div>
                            <label htmlFor="name" className="block font-medium">Your Name</label>
                            <Field name="name" type="text" placeholder="Enter your name" className="form-input" />
                            <ErrorMessage name="name" component="div" className="text-red-500" />
                        </div>
                        <div>
                            <label htmlFor="emailAddress" className="block font-medium">Email Address</label>
                            <Field name="emailAddress" type="email" placeholder="Enter your email" className="form-input" />
                            <ErrorMessage name="emailAddress" component="div" className="text-red-500" />
                        </div>
                        <div>
                            <label htmlFor="phoneNumber" className="block font-medium">Phone Number (optional)</label>
                            <Field name="phoneNumber" type="text" placeholder="Enter your phone number" className="form-input" />
                            <ErrorMessage name="phoneNumber" component="div" className="text-red-500" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                            Submit Enquiry
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddEnquiryComponent;
