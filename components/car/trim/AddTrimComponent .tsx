'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import SectionHeader from '@/components/utils/SectionHeader';
import { AsyncPaginate } from 'react-select-async-paginate';
import CarModelService from '@/services/CarModelService';
import TrimService from '@/services/TrimService';
import IconSave from '@/components/icon/icon-save';

// Connect to WebSocket server
const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`);

const AddTrimComponent = () => {
    const formikRef = useRef<any>(null);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState("");
    const [selectedModel, setSelectedModel] = useState<{ value: number; label: string } | null>(null);

    // Fetch models for dropdown
    const fetchModels = async (searchQuery = '', loadedOptions = [], additional = { page: 1 }) => {
        try {
            const params: Record<string, any> = {
                page: additional.page, // Pass the current page number
                limit: 10, // Limit results per page
                status: 'published',
            };

            if (searchQuery.trim()) {
                params.search = searchQuery;
            }

            const response = await CarModelService.listCarModel(params);

            if (!response || !response.data || !Array.isArray(response.data)) {
                return { options: [], hasMore: false };
            }

            const newOptions = response.data.map((model: any) => ({
                value: model.id,
                label: model.name,
            }));

            // Determine if more pages are available
            const hasMore = response.pagination.currentPage < response.pagination.totalPages;

            return {
                options: newOptions,
                hasMore,
                additional: {
                    page: additional.page + 1, // Increment page for the next call
                },
            };
        } catch (error) {
            console.error("Error fetching models:", error);
            return { options: [], hasMore: false };
        }
    };
    useEffect(() => {
        const progressHandler = (data: { progress: number; message: string; status: string }) => {
            console.log("Progress Data:", data);

            if (data.progress) setProgress(data.progress);
            if (data.message) setStatusMessage(data.message);

            Swal.update({
                html: renderProgressHtml(data.progress, data.message),
            });

            if (data.progress === 100 && data.status === 'completed') {
                Swal.fire({
                    icon: 'success',
                    title: 'Trim Created Successfully!',
                    text: 'The trim has been added successfully.',
                }).then(() => {
                    window.location.href = '/trim/list';
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

    const renderProgressHtml = (progress: number, message: string) => `
        <div class="mb-5 space-y-5">
            <div class="w-full h-4 bg-gray-200 rounded-full">
                <div class="bg-blue-500 h-4 rounded-full text-center text-white text-xs" style="width: ${progress}%;">${progress}%</div>
            </div>
            <p class="text-center">${message}</p>
        </div>
    `;

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Please enter trim name'),
        modelId: Yup.number().required('Please select a model'),
    });

    interface TrimFormValues {
        name: string;
        modelId: number | null;
        status: 'draft' | 'published';
    }

    const handleSubmit = async (values: TrimFormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        const payload = {
            name: values.name,
            modelId: values.modelId,
            status: values.status,
        };

        try {
            Swal.fire({
                title: 'Creating Trim...',
                html: renderProgressHtml(0, "Initializing..."),
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
            });

            const response = await TrimService.addTrim(payload);

            if (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Trim Created Successfully!',
                    text: 'The trim has been added successfully.',
                }).then(() => {
                    window.location.href = '/trim/list';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to add trim.',
                });
            }
        } catch (error: unknown) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error instanceof Error ? error.message : 'An unexpected error occurred.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-2.5 xl:flex-row">
            <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0">
                <SectionHeader title="Add Trim" />
                <div className="px-4 w-100">
                    <Formik
                        innerRef={formikRef}
                        initialValues={{ name: '', modelId: null, status: 'draft' }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ setFieldValue }) => (
                            <Form className="space-y-5">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-1">
                                    <div>
                                        <label htmlFor="name">Trim Name</label>
                                        <Field name="name" type="text" placeholder="Enter Trim Name" className="form-input" />
                                        <ErrorMessage name="name" component="div" className="mt-1 text-danger" />
                                    </div>

                                    <div>
                                        <label htmlFor="modelId">Select Model</label>
                                        <AsyncPaginate
                                            loadOptions={fetchModels}
                                            debounceTimeout={300}
                                            additional={{ page: 1 }}
                                            value={selectedModel}
                                            onChange={(option: { value: number; label: string } | null) => {
                                                setSelectedModel(option);
                                                setFieldValue('modelId', option?.value || null);
                                            }}
                                            placeholder="Search and select a model"
                                        />
                                        <ErrorMessage name="modelId" component="div" className="mt-1 text-danger" />
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
                        <button type="button" className="btn btn-success w-full gap-2" onClick={() => formikRef.current.submitForm()}>
                            <IconSave className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddTrimComponent;
