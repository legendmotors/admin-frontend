'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { AsyncPaginate } from 'react-select-async-paginate';
import CarModelService from '@/services/CarModelService';
import TrimService from '@/services/TrimService';
import IconSave from '@/components/icon/icon-save';
import IconCircleCheck from '@/components/icon/icon-circle-check';
import SectionHeader from '@/components/utils/SectionHeader';

const socket = io('ws://localhost:4000');

interface TrimFormValues {
    name: string;
    modelId: number | null;
    status: 'draft' | 'published';
}

interface Trim {
    id: number;
    name: string;
    slug: string;
    status: 'draft' | 'published';
    model: {
        id: number;
        name: string;
    };
}

const UpdateTrimComponent = ({ trimId }: { trimId: number }) => {
    const formikRef = useRef<any>(null);
    const [progress, setProgress] = useState<number>(0);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [initialValues, setInitialValues] = useState<TrimFormValues | null>(null);
    const [selectedModel, setSelectedModel] = useState<{ value: number; label: string } | null>(null);
    const [status, setStatus] = useState<'draft' | 'published'>('draft');

    useEffect(() => {
        const fetchTrim = async () => {
            const response = await TrimService.getTrimById(trimId);
            if (response) {
                setInitialValues({
                    name: response.name,
                    modelId: response.model.id,
                    status: response.status,
                });
                setSelectedModel({ value: response.model.id, label: response.model.name });
                setStatus(response.status);
            }
        };
        fetchTrim();
    }, [trimId]);

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
                    title: 'Trim Updated Successfully!',
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
        name: Yup.string().required('Please fill the name'),
        modelId: Yup.number().required('Please select a model'),
    });

    const fetchModels = async (searchQuery = '', loadedOptions = [], page = 1) => {
        try {
            const params: Record<string, any> = {
                page,
                limit: 10,
                status: 'published',
            };

            if (searchQuery.trim()) params.search = searchQuery;

            const response = await CarModelService.listCarModel(params);

            if (!response || !response.data || !Array.isArray(response.data)) {
                return { options: [], hasMore: false };
            }

            const newOptions = response.data.map((model: any) => ({
                value: model.id,
                label: model.name,
            }));

            return {
                options: newOptions,
                hasMore: response.pagination?.currentPage < response.pagination?.totalPages,
            };
        } catch (error) {
            console.error("Error fetching models:", error);
            return { options: [], hasMore: false };
        }
    };

    const handleSubmit = async (values: TrimFormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        Swal.fire({ title: 'Updating Trim...', html: renderProgressHtml(0, 'Initializing...'), showConfirmButton: false });

        const response = await TrimService.updateTrim({ ...values, id: trimId });

        if (response) {
            Swal.fire({ icon: 'success', title: 'Trim Updated Successfully!' }).then(() => {
                window.location.href = '/trim/list';
            });
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update trim.' });
        }
        setSubmitting(false);
    };

    if (!initialValues) return <div>Loading...</div>;

    return (
        <div className="flex flex-col gap-2.5 xl:flex-row">
            <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0 ">
                <SectionHeader title="Edit Trim" />
                <div className="px-4 w-100">
                    <Formik
                        innerRef={formikRef}
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({ setFieldValue }) => (
                            <Form className="space-y-5">
                                <div>
                                    <label htmlFor="name">Trim Name</label>
                                    <Field name="name" type="text" className="form-input" />
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
                                    />
                                    <ErrorMessage name="modelId" component="div" className="mt-1 text-danger" />
                                </div>
                                <button type="submit" className="btn btn-success w-full gap-2">
                                    <IconSave className="shrink-0" /> Save
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
            <div className="mt-6 w-full xl:mt-0 xl:w-96">
                <div className="panel">
                    <div className="grid grid-cols-1 gap-4">
                        {status === 'draft' && (
                            <button type="button" className="btn btn-secondary w-full" onClick={() => setStatus('published')}>
                                <IconCircleCheck className="shrink-0" /> Publish
                            </button>
                        )}
                        {status === 'published' && (
                            <button type="button" className="btn btn-warning w-full" onClick={() => setStatus('draft')}>
                                <IconCircleCheck className="shrink-0" /> Unpublish
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateTrimComponent;
