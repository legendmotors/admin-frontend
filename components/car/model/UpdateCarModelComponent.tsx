'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { AsyncPaginate } from 'react-select-async-paginate';
import CarModelService from '@/services/CarModelService';
import { GeBrandDetails } from '@/services';
import IconSave from '@/components/icon/icon-save';
import IconCircleCheck from '@/components/icon/icon-circle-check';
import SectionHeader from '@/components/utils/SectionHeader';

const socket = io('ws://localhost:4000');

interface CarModelFormValues {
    name: string;
    brandId: number | null;
    slug: string;
    status: 'draft' | 'published';
}

interface CarModel {
    id: number;
    name: string;
    slug: string;
    status: 'draft' | 'published';
    brand: {
        id: number;
        name: string;
    };
}

const UpdateCarModelComponent = ({ modelId }: { modelId: number }) => {
    const formikRef = useRef<any>(null);
    const [progress, setProgress] = useState<number>(0);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [initialValues, setInitialValues] = useState<CarModelFormValues | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<{ value: number; label: string } | null>(null);
    const [status, setStatus] = useState<'draft' | 'published'>('draft');

    useEffect(() => {
        const fetchCarModel = async () => {
            const response = await CarModelService.getCarModelById(modelId);
            if (response) {
                setInitialValues({
                    name: response.name,
                    brandId: response?.brand?.id,
                    slug: response.slug,
                    status: response.status,
                });
                setSelectedBrand({ value: response?.brand?.id, label: response?.brand?.name });
                setStatus(response.status);
            }
        };
        fetchCarModel();
    }, [modelId]);

    useEffect(() => {
        // ✅ Listen for real-time WebSocket progress updates
        const progressHandler = (data: { progress: number; message: string; status: string }) => {
            console.log("Progress Data:", data);

            if (data.progress) setProgress(data.progress);
            if (data.message) setStatusMessage(data.message);

            // ✅ Dynamically update SweetAlert UI
            Swal.update({
                html: renderProgressHtml(data.progress, data.message)
            });

            // ✅ Stop listening when progress reaches 100 (brand creation completed)
            if (data.progress === 100 && data.status === 'completed') {
                Swal.fire({
                    icon: 'success',
                    title: 'Brand Created Successfully!',
                    text: 'The brand has been added successfully.',
                }).then(() => {
                    window.location.href = '/model/list';
                });

                socket.off('progress', progressHandler); // 🛑 Stop listening for updates
                setTimeout(() => {
                    setProgress(0);
                    setStatusMessage('');
                }, 2000);
            }
        };

        socket.on('progress', progressHandler);

        return () => {
            socket.off('progress', progressHandler); // 🛑 Cleanup listener on unmount
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
        brandId: Yup.number().required('Please select a brand'),
    });

   // Function to fetch brands with search & pagination
   const fetchBrands = async (searchQuery = '', loadedOptions = [], additional = { page: 1 }) => {
    try {
        const params: Record<string, any> = {
            page: additional.page, // Pass the current page number
            limit: 10, // Limit results per page
            status: 'published',
        };

        if (searchQuery.trim()) {
            params.search = searchQuery;
        }

        const response = await GeBrandDetails.listBrand(params);

        if (!response || !response.data || !Array.isArray(response.data)) {
            return { options: [], hasMore: false };
        }

        // Map response data to options
        const newOptions = response.data.map((brand: any) => ({
            value: brand.id,
            label: brand.name,
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
        console.error("Error fetching brands:", error);
        return { options: [], hasMore: false };
    }
};


    const handleSubmit = async (values: CarModelFormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        Swal.fire({ title: 'Updating Car Model...', html: renderProgressHtml(0, 'Initializing...'), showConfirmButton: false });
        const response = await CarModelService.updateCarModel({ ...values, id: modelId });
        if (response) {
            Swal.fire({ icon: 'success', title: 'Car Model Updated Successfully!' }).then(() => {
                window.location.href = '/model/list';
            });
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update car model.' });
        }
        setSubmitting(false);
    };

    if (!initialValues) return <div>Loading...</div>;

    return (
        <div className="flex flex-col gap-2.5 xl:flex-row">
            <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0 ">
                <SectionHeader title="Edit Car Model" />
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
                                    <label htmlFor="name">Name</label>
                                    <Field name="name" type="text" className="form-input" />
                                    <ErrorMessage name="name" component="div" className="mt-1 text-danger" />
                                </div>
                                <div>
                                    <label htmlFor="brandId">Select Brand</label>
                                    <AsyncPaginate
                                        loadOptions={fetchBrands}
                                        debounceTimeout={300}
                                        additional={{ page: 1 }}
                                        value={selectedBrand}
                                        onChange={(option: { value: number; label: string } | null) => {
                                            setSelectedBrand(option);
                                            setFieldValue('brandId', option?.value || null);
                                        }}
                                    />
                                    <ErrorMessage name="brandId" component="div" className="mt-1 text-danger" />
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

export default UpdateCarModelComponent;
