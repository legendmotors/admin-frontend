'use client';

import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import IconSave from '@/components/icon/icon-save';
import SectionHeader from '@/components/utils/SectionHeader';
import { AsyncPaginate } from 'react-select-async-paginate';
import FeatureService from '@/services/FeatureService';

const socket = io('ws://localhost:4000');

// Types for form values
interface FeatureValueFormValues {
    name: string;
    featureId: number | null;
    status: 'draft' | 'published';
}

// Type for fetched feature options
interface FeatureOption {
    value: number;
    label: string;
}

// Component
const AddFeatureValueComponent: React.FC = () => {
    const formikRef = useRef<any>(null);
    const [progress, setProgress] = useState<number>(0);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [selectedFeature, setSelectedFeature] = useState<FeatureOption | null>(null);

    useEffect(() => {
        const progressHandler = (data: { progress: number; message: string; status: string }) => {
            if (data.progress) setProgress(data.progress);
            if (data.message) setStatusMessage(data.message);

            Swal.update({
                html: renderProgressHtml(data.progress, data.message),
            });

            if (data.progress === 100 && data.status === 'completed') {
                Swal.fire({
                    icon: 'success',
                    title: 'Feature Value Created Successfully!',
                    text: 'The feature value has been added successfully.',
                }).then(() => {
                    window.location.href = '/feature/list-value';
                });

                socket.off('progress', progressHandler);
                setTimeout(() => {
                    setProgress(0);
                    setStatusMessage('');
                }, 2000);
            }
        };

        socket.on('progress', progressHandler);
        return () => {
            socket.off('progress', progressHandler);
        };
    }, []);

    const renderProgressHtml = (progress: number, message: string): string => `
        <div class="mb-5 space-y-5">
            <div class="w-full h-4 bg-gray-200 rounded-full">
                <div class="bg-blue-500 h-4 rounded-full text-center text-white text-xs" style="width: ${progress}%;">${progress}%</div>
            </div>
            <p class="text-center">${message}</p>
        </div>
    `;

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Please fill the name'),
        featureId: Yup.number().required('Please select a feature'),
        status: Yup.string().oneOf(['draft', 'published']).required('Please select a status'),
    });

    const fetchFeatures = async (searchQuery = '', loadedOptions = [], additional = { page: 1 }) => {
        try {
            const params: Record<string, any> = {
                page: additional.page,
                limit: 10,
                status: 'published',
            };

            if (searchQuery.trim()) {
                params.search = searchQuery;
            }

            const response = await FeatureService.listFeatures(params);

            if (!response || !response.data || !Array.isArray(response.data)) {
                return { options: [], hasMore: false };
            }

            const newOptions = response.data.map((feature: any) => ({
                value: feature.id,
                label: feature.name,
            }));

            return {
                options: newOptions,
                hasMore: response.pagination.currentPage < response.pagination.totalPages,
                additional: {
                    page: additional.page + 1,
                },
            };
        } catch (error) {
            console.error('Error fetching features:', error);
            return { options: [], hasMore: false };
        }
    };

    const handleSubmit = async (
        values: FeatureValueFormValues,
        { setSubmitting }: FormikHelpers<FeatureValueFormValues>
    ) => {
        try {
            Swal.fire({
                title: 'Creating Feature Value...',
                html: renderProgressHtml(0, 'Initializing...'),
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
            });

            const payload = {
                name: values.name,
                featureId: values.featureId,
                status: values.status,
            };

            const response = await FeatureService.addFeatureValue(payload);

            if (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Feature Value Created Successfully!',
                    text: 'The feature value has been added successfully.',
                }).then(() => {
                    window.location.href = '/feature/list-value';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to add feature value.',
                });
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'An unexpected error occurred.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-2.5 xl:flex-row">
            <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0 ">
                <SectionHeader title="Add Feature Value" />
                <div className="px-4 w-100">
                    <Formik
                        innerRef={formikRef}
                        initialValues={{ name: '', featureId: null, status: 'draft' }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ setFieldValue }) => (
                            <Form className="space-y-5">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-1">
                                    <div>
                                        <label htmlFor="name">Name</label>
                                        <Field
                                            name="name"
                                            type="text"
                                            placeholder="Enter Feature Value Name"
                                            className="form-input"
                                        />
                                        <ErrorMessage name="name" component="div" className="mt-1 text-danger" />
                                    </div>
                                    <div>
                                        <label htmlFor="featureId">Select Feature</label>
                                        <AsyncPaginate
                                            loadOptions={fetchFeatures}
                                            debounceTimeout={300}
                                            additional={{ page: 1 }}
                                            value={selectedFeature}
                                            onChange={(option: FeatureOption | null) => {
                                                setSelectedFeature(option);
                                                setFieldValue('featureId', option?.value || null);
                                            }}
                                            placeholder="Search and select a feature"
                                        />
                                        <ErrorMessage name="featureId" component="div" className="mt-1 text-danger" />
                                    </div>
                                    <div>
                                        <label htmlFor="status">Status</label>
                                        <Field as="select" name="status" className="form-select">
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </Field>
                                        <ErrorMessage name="status" component="div" className="mt-1 text-danger" />
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
                            onClick={() => formikRef.current?.submitForm()}
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

export default AddFeatureValueComponent;
