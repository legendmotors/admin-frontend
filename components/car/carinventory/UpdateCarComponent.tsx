'use client';

import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { setStep, setFormData, setImages } from '@/store/formSlice'; // Adjust paths
import { IRootState, AppDispatch } from '@/store/index';
import IconThumbUp from '@/components/icon/icon-thumb-up';
import IconUser from '@/components/icon/icon-user';
import SectionHeader from '@/components/utils/SectionHeader';
import IconMenuForms from '@/components/icon/menu/icon-menu-forms';
import IconGallery from '@/components/icon/icon-gallery';
import { useEffect, useState } from 'react';
import SpecificationService from '@/services/SpecificationService';
import Select, { SingleValue } from 'react-select';
import FeatureService from '@/services/FeatureService';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { GeBrandDetails, TrimService } from '@/services';
import CarModelService from '@/services/CarModelService';
import YearService from '@/services/YearService';
import { AsyncPaginate } from 'react-select-async-paginate';
import CarService from '@/services/CarService';
import ComponentsDragndropGrid from './ComponentsDragndropGrid.jsx';

interface Specification {
    id: number;
    name: string;
    key: string;
    values: { value: string; label: string }[];
}

interface Feature {
    id: number;
    name: string;
    key: string;
    values: { id: number; name: string; slug: string }[];
}

interface Image {
    fileId: string;
    type: string;
    order: number;
}


const UpdateCarComponent = ({ carId }: { carId: number }) => {
    const dispatch: AppDispatch = useDispatch();
    const currentStep = useSelector((state: IRootState) => state.form.currentStep);
    const formData = useSelector((state: IRootState) => state.form.formData);

    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<{ value: number; label: string } | null>(null);
    const [selectedModel, setSelectedModel] = useState<{ value: number; label: string } | null>(null);
    const [selectedTrim, setSelectedTrim] = useState<{ value: number; label: string } | null>(null);
    const [selectedYear, setSelectedYear] = useState<{ value: number; label: string } | null>(null);
    const images = useSelector((state: IRootState) => state.form.images); // Fetch images from Redux
    console.log(selectedBrand, "selectedBrand");


    const preloadCarData = async (carId: number) => {
        try {
            const response = await CarService.getCarById(carId);
            console.log('Raw response:', response); // Debugging

            if (response) {
                const data = response;
                console.log('Response data:', data); // Debugging

                const transformedData = {
                    stockId: data.stockId || '',
                    description: data.description || '',
                    status: data.status || 'draft',
                    featured: data.featured || false,
                    premium: data.premium || false,
                    engineSize: data.engineSize || null,
                    horsepower: data.horsepower || null,
                    price: data.CarPrices[0]?.price,
                    exportPrice: data.CarPrices[1]?.price,
                    features: data.FeatureValues?.map((feature: { id: number }) => ({
                        featureValueId: feature.id,
                    })) || [],
                    
                    images: data.CarImages?.map((image: { fileId: string; type: string; order: number }) => ({
                        fileId: image.fileId,
                        type: image.type,
                        order: image.order,
                    })) || [],
                    
                };

                console.log('Transformed Data:', transformedData);

                // Dispatch to Redux
                dispatch(setFormData(transformedData));

                // Push CarImages data into Redux `images` state
                const transformedImages = data.CarImages?.map((image: { fileId: string; type: string; order: number; id?: number; FileSystem?: { thumbnailPath?: string; path?: string } }) => ({
                    fileId: image.fileId,
                    type: image.type,
                    order: image.order,
                    id: image.id, // Include ID if needed
                    thumbnailPath: image.FileSystem?.thumbnailPath || image.FileSystem?.path, // Add thumbnail or path
                })) || [];
                

                dispatch(setImages(transformedImages)); // Push to Redux

                // Set the dropdown states
                setSelectedSpecificationValues(
                    response.SpecificationValues?.reduce(
                        (acc: Record<string, string>, spec: { Specification: { key: string }; id: string }) => {
                            acc[spec.Specification.key] = spec.id; // Use key from Specification and id as string
                            return acc;
                        },
                        {} as Record<string, string> // Initialize the accumulator as a Record<string, string>
                    )
                );
                
                setSelectedFeatureValues(
                    response.FeatureValues?.reduce(
                        (acc: Record<number, number[]>, featureValue: { Feature: { id: number }; id: number }) => {
                            const featureId = featureValue.Feature.id; // Get the Feature ID
                            if (!acc[featureId]) {
                                acc[featureId] = []; // Initialize an array for this Feature ID
                            }
                            acc[featureId].push(featureValue.id); // Add the feature value ID to the array
                            return acc;
                        },
                        {} as Record<number, number[]> // Initialize the accumulator as a Record<number, number[]>
                    )
                );
                


                setSelectedBrand({
                    value: response.Brand.id,
                    label: response.Brand.name,
                });


                setSelectedModel({
                    value: response.CarModel.id,
                    label: response.CarModel.name,
                });


                setSelectedTrim({
                    value: response.Trim.id,
                    label: response.Trim.name,
                });

                setSelectedYear({
                    value: response.Year.id,
                    label: response.Year.year,
                });
            }
        } catch (error) {
            console.error('Error fetching car data:', error);
        }
    };


    useEffect(() => {
        console.log('Redux formData:', formData); // Debug formData
    }, [formData]);


    useEffect(() => {
        if (carId) {
            console.log('Calling preloadCarData with carId:', carId);
            preloadCarData(carId);
        } else {
            console.log('carId is not provided or is null');
        }
    }, [carId]);




    const handleImagesUpdate = (updatedImages: Image[]) => {
        if (JSON.stringify(images) !== JSON.stringify(updatedImages)) {
            dispatch(setImages(updatedImages)); // Update Redux with the new images only if they change
        }
    };




    const fetchData = async (
        serviceFunction: (params: Record<string, any>) => Promise<any>,
        searchQuery = '',
        loadedOptions = [],
        additional = { page: 1 },
        additionalParams: Record<string, any> = {}
    ) => {
        try {
            const params: Record<string, any> = {
                page: additional.page,
                limit: 10,
                status: 'published',
                ...additionalParams,
            };

            if (searchQuery.trim()) {
                params.search = searchQuery;
            }

            const response = await serviceFunction(params);

            const newOptions = response.data.map((item: any) => ({
                value: item.id || item.year,
                label: item.name || item.year,
            }));

            const hasMore = response.pagination.currentPage < response.pagination.totalPages;

            return {
                options: newOptions,
                hasMore,
                additional: {
                    page: additional.page + 1,
                },
            };
        } catch (error) {
            console.error('Error fetching data:', error);
            return { options: [], hasMore: false };
        }
    };

    // Fetch brands with additional parameter
    const fetchBrands = async (searchQuery = '', loadedOptions = [], additional = { page: 1 }) => {
        return fetchData(GeBrandDetails.listBrand, searchQuery, loadedOptions, additional, { hasModels: true });
    };

    // Fetch models with additional parameter
    const fetchModels = async (searchQuery = '', loadedOptions = [], additional = { page: 1 }) => {
        return fetchData(
            CarModelService.listCarModel,
            searchQuery,
            loadedOptions,
            additional,
            { brandId: selectedBrand?.value || undefined } // Use `undefined` if `selectedBrand` is null
        );
    };


    // Fetch trims with additional parameter
    const fetchTrims = async (searchQuery = '', loadedOptions = [], additional = { page: 1 }) => {
        return fetchData(TrimService.listTrim, searchQuery, loadedOptions, additional, { modelId: selectedModel?.value });
    };

    // Fetch years without additional parameters
    const fetchYears = async (searchQuery = '', loadedOptions = [], additional = { page: 1 }) => {
        return fetchData(YearService.listYear, searchQuery, loadedOptions, additional);
    };



    console.log('Current Step:', currentStep); // Log the current step
    console.log('Form Data:', formData); // Log the form data


    useEffect(() => {
        // Fetch the current exchange rate of AED to USD
        const fetchExchangeRate = async () => {
            try {
                const response = await fetch('https://api.exchangerate-api.com/v4/latest/AED');
                const data = await response.json();
                setExchangeRate(data.rates.USD); // Extract the USD rate
            } catch (error) {
                console.error('Error fetching exchange rate:', error);
            }
        };

        fetchExchangeRate();
    }, []);


    // Default values for the fields
    const defaultValues = {
        stockId: '',
        make: '',
        model: '',
        trim: '',
        year: '',
        price: '',
        exportPrice: '',
        description: '',
        engineSize: '',
        horsepower: '',
        featured: false,
        premium: false,

    };

    // Validation schema for the first step
    const validationSchema = Yup.object({
        // stockId: Yup.string(), // Optional field
        // make: Yup.string().required('The Make field is required'),
        // model: Yup.string().required('The Model field is required'),
        // trim: Yup.string().required('The Trim field is required'),
        // year: Yup.string().required('The Year field is required'),
        price: Yup.number()
            .min(1000, 'Local price cannot be less than 1000')
            .required('The Price field is required'),
        exportPrice: Yup.number(), // Optional field
        // description: Yup.string().required('The Description field is required'),
        // engineSize: Yup.string().required('The Engine Size field is required'),
        // horsepower: Yup.string().required('The Horsepower field is required'),
        // featured: Yup.boolean(),
        // premium: Yup.boolean(),
    });



    const constructStep1Payload = (values: any) => {
        return {
            stockId: values.stockId || null,
            description: values.description || "",
            status: "published",
            featured: values.featured || false, // Use toggle value
            premium: values.premium || false, // Use toggle value
            brandId: selectedBrand?.value || null,
            modelId: selectedModel?.value || null,
            trimId: selectedTrim?.value || null,
            yearId: selectedYear?.value || null,
            engineSize: parseFloat(values.engineSize) || null,
            horsepower: parseInt(values.horsepower) || null,
            prices: [
                {
                    currency: "AED",
                    amount: parseFloat(values.price),
                },
                {
                    currency: "USD",
                    amount: parseFloat(values.exportPrice),
                },
            ],
            specifications: specifications
                .map((spec) => ({
                    specificationValueId: selectedSpecificationValues[spec.key],
                }))
                .filter((spec) => spec.specificationValueId),
            features: Object.entries(selectedFeatureValues).flatMap(([featureId, valueIds]) =>
                valueIds.map((valueId) => ({
                    featureValueId: valueId,
                }))
            ),
            images: images.map((img) => ({
                fileId: img.fileId,
                type: img.type,
                order: img.order,
            })),
        };
    };




    const handleNext = (values: any) => {
        const payload = constructStep1Payload(values);

        // Log the payload
        console.log("Step Payload:", payload);

        // Save the payload to Redux
        dispatch(setFormData(payload));

        // Move to the next step
        dispatch(setStep(currentStep + 1));

        // Log the next step
        console.log(`Moved to Step: ${currentStep + 1}`);
    };


    const handleBack = () => {
        if (currentStep > 1) {
            dispatch(setStep(currentStep - 1)); // Move to the previous step
            console.log('Moved Back to Step:', currentStep - 1); // Log the new step after moving back
        }
    };
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [selectedSpecificationValues, setSelectedSpecificationValues] = useState<Record<string, string | null>>({}); const [loading, setLoading] = useState<boolean>(false);
    console.log(selectedSpecificationValues, "selectedSpecificationValues");

    useEffect(() => {
        const fetchSpecificationsWithValues = async () => {
            try {
                setLoading(true);

                // Fetch all specifications
                const specificationsResponse = await SpecificationService.listSpecifications({});
                const specifications = specificationsResponse.data;

                console.log(specifications, "specifications");


                // Fetch values for each specification individually
                const specificationsWithValues = await Promise.all(
                    specifications.map(async (spec: any) => {
                        const response = await SpecificationService.listSpecificationValues({
                            specificationId: spec.id,
                        }); // Fetch values for this specification
                        const values = response.data.map((value: any) => ({
                            value: value.id,
                            label: value.name,
                        }));

                        return {
                            ...spec,
                            values, // Only values related to this specification
                        };
                    })
                );

                setSpecifications(specificationsWithValues);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching specifications and values:", error);
                setLoading(false);
            }
        };

        fetchSpecificationsWithValues();
    }, []);

    const handleSpecificationChange = (key: string, value: any) => {
        setSelectedSpecificationValues((prevValues) => ({
            ...prevValues,
            [key]: value?.value || null,
        }));
    };


    const [features, setFeatures] = useState<Feature[]>([]);
    const [selectedFeatureValues, setSelectedFeatureValues] = useState<Record<number, number[]>>({});
    console.log(selectedFeatureValues, "selectedFeatureValues");

    useEffect(() => {
        const fetchFeaturesWithValues = async () => {
            try {
                // Fetch all features
                const featureResponse = await FeatureService.listFeatures({ limit: 0 }); // Fetch all features
                const features = featureResponse.data;

                // Fetch feature values for each feature
                const featuresWithValues = await Promise.all(
                    features.map(async (feature: any) => {
                        const valuesResponse = await FeatureService.listFeatureValues({ featureId: feature.id, limit: 0 }); // Fetch all values
                        const values = valuesResponse.data.map((value: any) => ({
                            id: value.id,
                            name: value.name,
                            slug: value.slug,
                        }));
                        return { ...feature, values };
                    })
                );

                setFeatures(featuresWithValues);
            } catch (error) {
                console.error("Error fetching features and values:", error);
            }
        };

        fetchFeaturesWithValues();
    }, []);


    const handleFeatureCheckboxChange = (featureId: number, valueId: number) => {
        setSelectedFeatureValues((prevSelected) => {
            const currentValues = prevSelected[featureId] || [];
            const isSelected = currentValues.includes(valueId);

            return {
                ...prevSelected,
                [featureId]: isSelected
                    ? currentValues.filter((id) => id !== valueId) // Remove if already selected
                    : [...currentValues, valueId], // Add if not selected
            };
        });
    };

    const handlePublish = async () => {
        try {
            console.log('Publishing Payload:', formData); // Debug the final payload

            // Call the `addCar` service directly with formData
            const response = await CarService.addCar(formData);

            if (response) {
                console.log('Car added successfully:', response);
                alert('Car added successfully!');

                // Clear the formData in Redux
                dispatch(setFormData({})); // Reset the formData to an empty object or default values
                dispatch(setStep(1)); // Reset to the first step or redirect the user
            } else {
                console.error('Failed to add car.');
                alert('Failed to add the car. Please try again.');
            }
        } catch (error) {
            console.error('Error publishing car:', error);
            alert('An error occurred while publishing the car.');
        }
    };



    const handleUpdate = async () => {
        try {
            console.log('Updating Payload:', formData); // Debug the final payload
    
            // Convert formData object to FormData instance
            const formDataToSend = new FormData();
    
            // Add all key-value pairs from formData to formDataToSend
            Object.entries(formData).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    // For arrays (like images or specifications), add each item individually
                    value.forEach((item, index) => {
                        formDataToSend.append(`${key}[${index}]`, typeof item === 'object' ? JSON.stringify(item) : item);
                    });
                } else if (typeof value === 'object' && value !== null) {
                    // For objects, stringify them
                    formDataToSend.append(key, JSON.stringify(value));
                } else {
                    // For other primitive values, add them directly
                    formDataToSend.append(key, value as string);
                }
            });
    
            // Call the `updateCar` service
            const response = await CarService.updateCar(formDataToSend);
    
            if (response) {
                console.log('Car updated successfully:', response);
                alert('Car updated successfully!');
            } else {
                console.error('Failed to update car.');
                alert('Failed to update the car. Please try again.');
            }
        } catch (error) {
            console.error('Error updating car:', error);
            alert('An error occurred while updating the car.');
        }
    };
    
    

    if (loading) {
        return <p>Loading specifications...</p>;
    }



    return (
        <div className="flex flex-col gap-2.5 xl:flex-row">
            <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0 ">
                <SectionHeader title="Add Car Details" />
                <div className="mb-5">
                    <div className="inline-block w-full">
                        {/* Tab Indicators */}
                        <div className="relative z-[1]">
                            <div
                                className={`${currentStep === 1
                                    ? 'w-[15%]'
                                    : currentStep === 2
                                        ? 'w-[48%]'
                                        : currentStep === 3
                                            ? 'w-[81%]'
                                            : ''
                                    } absolute top-[30px] -z-[1] m-auto h-1 w-[15%] bg-primary transition-[width] ltr:left-0 rtl:right-0`}
                            ></div>
                            <ul className="mb-5 grid grid-cols-3">
                                {/* Step 1 Button */}
                                <li className="mx-auto">
                                    <button
                                        type="button"
                                        onClick={() => dispatch(setStep(1))} // Update the step to 1
                                        className={`${currentStep === 1 ? '!border-primary !bg-primary text-white' : ''
                                            } flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f3f2ee] bg-white dark:border-[#1b2e4b] dark:bg-[#253b5c]`}
                                    >
                                        <IconMenuForms className="h-7 w-7" />
                                    </button>
                                    <span
                                        className={`${currentStep === 1 ? 'text-primary ' : ''}text-center mt-2 block`}
                                    >
                                        Car Details
                                    </span>
                                </li>

                                {/* Step 2 Button */}
                                <li className="mx-auto">
                                    <button
                                        type="button"
                                        onClick={() => dispatch(setStep(2))} // Update the step to 2
                                        className={`${currentStep === 2 ? '!border-primary !bg-primary text-white' : ''
                                            } flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f3f2ee] bg-white dark:border-[#1b2e4b] dark:bg-[#253b5c]`}
                                    >
                                        <IconGallery className="h-7 w-7" />
                                    </button>
                                    <span
                                        className={`${currentStep === 2 ? 'text-primary ' : ''}text-center mt-2 block`}
                                    >
                                        Photos
                                    </span>
                                </li>

                                {/* Step 3 Button */}
                                <li className="mx-auto">
                                    <button
                                        type="button"
                                        onClick={() => dispatch(setStep(3))} // Update the step to 3
                                        className={`${currentStep === 3 ? '!border-primary !bg-primary text-white' : ''
                                            } flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f3f2ee] bg-white dark:border-[#1b2e4b] dark:bg-[#253b5c]`}
                                    >
                                        <IconThumbUp className="h-7 w-7" />
                                    </button>
                                    <span
                                        className={`${currentStep === 3 ? 'text-primary ' : ''}text-center mt-2 block`}
                                    >
                                        Publish
                                    </span>
                                </li>
                            </ul>
                        </div>


                        {/* Form */}
                        <div className="px-4 w-100">

                            {currentStep === 1 && (<Formik
                                initialValues={{
                                    ...formData, // Use preloaded data from Redux
                                }}
                                validationSchema={validationSchema}
                                onSubmit={(values) => handleNext(values)}
                                enableReinitialize={true}
                            >
                                {({ values, setFieldValue, isValid, dirty, errors, submitCount, }) => (
                                    <Form className="space-y-8 mt-2">
                                        <div className="flex gap-4 border rounded-[15px] p-4">
                                            {/* Featured Toggle */}
                                            <div>
                                                <label className="inline-flex ">
                                                    <Field
                                                        type="checkbox"
                                                        name="featured"
                                                        className="form-checkbox"
                                                    />
                                                    <span className='mt-[2px]'> Featured</span>
                                                </label>
                                                <ErrorMessage
                                                    name="featured"
                                                    component="div"
                                                    className="absolute text-red-500 text-sm mt-1"
                                                />
                                            </div>
                                            <div>
                                                <label className="inline-flex ">
                                                    <Field
                                                        type="checkbox"
                                                        name="premium"
                                                        className="form-checkbox"
                                                    />
                                                    <span className='mt-[2px]'> Premium</span>
                                                </label>
                                                <ErrorMessage
                                                    name="premium"
                                                    component="div"
                                                    className="absolute text-red-500 text-sm mt-1"
                                                />
                                            </div>

                                        </div>

                                        <div className='border rounded-[15px] p-5 relative space-y-6 '>
                                            <h2 className='text-lg font-bold absolute top-[-14px] bg-white px-1'>GENERAL CAR DETAILS</h2>
                                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                {/* Individual Fields */}
                                                <div>
                                                    <label className="block font-medium mb-0">Stock ID (Optional)</label>
                                                    <Field
                                                        type="text"
                                                        name="stockId"
                                                        placeholder="Add your own ID"
                                                        className="border border-gray-300 rounded px-3 py-2 w-full"
                                                    />
                                                    <ErrorMessage
                                                        name="stockId"
                                                        component="div"
                                                        className="absolute text-red-500 text-sm mt-1"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="brandId">Select Brand</label>
                                                    <AsyncPaginate
                                                        loadOptions={fetchBrands}
                                                        debounceTimeout={300}
                                                        additional={{ page: 1 }}
                                                        value={selectedBrand}
                                                        onChange={(option: SingleValue<{ value: number; label: string }>) => {
                                                            setSelectedBrand(option);
                                                            setFieldValue('brandId', option?.value || null);
                                                            setSelectedModel(null); // Reset dependent fields
                                                            setSelectedTrim(null);
                                                            setSelectedYear(null);
                                                        }}
                                                        placeholder="Search and select a brand"
                                                    />
                                                    <ErrorMessage name="brandId" component="div" className="mt-1 text-danger" />
                                                </div>


                                            </div>
                                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                                {/* Model */}
                                                <div>
                                                    <label htmlFor="modelId">Select Model</label>
                                                    <AsyncPaginate
                                                        loadOptions={fetchModels}
                                                        debounceTimeout={300}
                                                        additional={{ page: 1 }}
                                                        value={selectedModel}
                                                        onChange={(option: SingleValue<{ value: number; label: string }>) => {
                                                            setSelectedModel(option);
                                                            setFieldValue('modelId', option?.value || null);
                                                            setSelectedTrim(null); // Reset dependent fields
                                                            setSelectedYear(null);
                                                        }}
                                                        placeholder="Search and select a model"
                                                        isDisabled={!selectedBrand}
                                                    />
                                                    <ErrorMessage name="modelId" component="div" className="mt-1 text-danger" />
                                                </div>

                                                <div>
                                                    <label htmlFor="trimId">Select Trim</label>
                                                    <AsyncPaginate
                                                        loadOptions={fetchTrims}
                                                        debounceTimeout={300}
                                                        additional={{ page: 1 }}
                                                        value={selectedTrim}
                                                        onChange={(option: SingleValue<{ value: number; label: string }>) => {
                                                            setSelectedTrim(option);
                                                            setFieldValue('trimId', option?.value || null);
                                                            setSelectedYear(null); // Reset dependent fields
                                                        }}
                                                        placeholder="Search and select a trim"
                                                        isDisabled={!selectedModel}
                                                    />
                                                    <ErrorMessage name="trimId" component="div" className="mt-1 text-danger" />

                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                                {/* Year */}
                                                <div>
                                                    <label htmlFor="year">Select Year</label>
                                                    <AsyncPaginate
                                                        loadOptions={fetchYears}
                                                        debounceTimeout={300}
                                                        additional={{ page: 1 }}
                                                        value={selectedYear}
                                                        onChange={(option: SingleValue<{ value: number; label: string }>) => {
                                                            setSelectedYear(option);
                                                            setFieldValue('year', option?.value || null);
                                                        }}
                                                        placeholder="Search and select a year"
                                                    />
                                                    <ErrorMessage name="year" component="div" className="mt-1 text-danger" />
                                                </div>


                                            </div>
                                        </div>

                                        <div className='border rounded-[15px] p-5 relative '>
                                            <h2 className='text-lg font-bold absolute top-[-14px] bg-white px-1'>CAR PRICE</h2>

                                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                <div>
                                                    <label className="block font-medium mb-0">Price in AED</label>
                                                    <Field
                                                        type="number"
                                                        name="price"
                                                        placeholder="Enter price"
                                                        className="border border-gray-300 rounded px-3 py-2 w-full"
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                            const priceInAed = parseFloat(e.target.value);
                                                            setFieldValue('price', priceInAed);
                                                            if (exchangeRate) {
                                                                setFieldValue('exportPrice', (priceInAed * exchangeRate).toFixed(2));
                                                            }
                                                        }}
                                                    />
                                                    <ErrorMessage
                                                        name="price"
                                                        component="div"
                                                        className="absolute text-red-500 text-sm mt-1"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block font-medium mb-0">Price in USD</label>
                                                    <Field
                                                        type="number"
                                                        name="exportPrice"
                                                        placeholder="Calculated price in USD"
                                                        className="border border-gray-300 rounded px-3 py-2 w-full"
                                                        disabled
                                                    />
                                                    <ErrorMessage
                                                        name="exportPrice"
                                                        component="div"
                                                        className="absolute text-red-500 text-sm mt-1"
                                                    />
                                                </div>
                                            </div>


                                        </div>
                                        <div className='border rounded-[15px] p-5 relative '>
                                            <h2 className='text-lg font-bold absolute top-[-14px] bg-white px-1'>SPECIFICATIONS</h2>

                                            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                                {specifications.map((spec) => (
                                                    <div key={spec.id}>
                                                        <label className="block font-medium mb-1">{spec.name}</label>
                                                        <Select
                                                            options={spec.values}
                                                            placeholder={`Select ${spec.name}`}
                                                            onChange={(value: { value: string; label: string } | null) => handleSpecificationChange(spec.key, value)}
                                                            value={spec.values.find((option) => option.value === selectedSpecificationValues[spec.key]) || null}
                                                            isClearable
                                                            className="border border-gray-300 rounded"
                                                        />

                                                    </div>
                                                ))}
                                                <div>
                                                    <label className="block font-medium mb-1">Engine Size (Liters)</label>
                                                    <Field
                                                        type="text"
                                                        name="engineSize"
                                                        placeholder="Enter engine size"
                                                        className="border border-gray-300 rounded px-3 py-2 w-full"
                                                    />
                                                    <ErrorMessage
                                                        name="engineSize"
                                                        component="div"
                                                        className="absolute text-red-500 text-sm mt-1"
                                                    />
                                                </div>

                                                {/* Horsepower */}
                                                <div>
                                                    <label className="block font-medium mb-1">Horsepower</label>
                                                    <Field
                                                        type="text"
                                                        name="horsepower"
                                                        placeholder="Enter horsepower"
                                                        className="border border-gray-300 rounded px-3 py-2 w-full"
                                                    />
                                                    <ErrorMessage
                                                        name="horsepower"
                                                        component="div"
                                                        className="absolute text-red-500 text-sm mt-1"
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                        <div className='border rounded-[15px] p-5 relative '>
                                            <h2 className='text-lg font-bold absolute top-[-14px] bg-white px-1'>DESCRIPTION</h2>

                                            <div className="grid grid-cols-1 gap-5 md:grid-cols-1">
                                                <div className={submitCount ? (errors.description ? 'has-error' : 'has-success') : ''}>

                                                    <RichTextEditor
                                                        initialValue={values.description}
                                                        onChange={(newContent) => setFieldValue('description', newContent)}
                                                    />
                                                    {submitCount ? (
                                                        typeof errors.description === 'string' ? (
                                                            <div className="mt-1 text-danger">{errors.description}</div>
                                                        ) : (
                                                            <div className="mt-1 text-success">Looks Good!</div>
                                                        )
                                                    ) : null}

                                                </div>
                                            </div>


                                        </div>

                                        {features.map((feature) => (
                                            <div key={feature.id} className="mb-5">
                                                <div className='border rounded-[15px] p-5 relative '>
                                                    <h2 className='text-lg font-bold absolute top-[-14px] bg-white px-1'>{feature.name}</h2>

                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                        {feature.values.map((value) => (
                                                            <div key={value.id} className="flex items-center">

                                                                <label className="inline-flex">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`feature-${feature.id}-value-${value.id}`}
                                                                        className="form-checkbox"
                                                                        checked={selectedFeatureValues[feature.id]?.includes(value.id) || false}
                                                                        onChange={() => handleFeatureCheckboxChange(feature.id, value.id)} />
                                                                    <span> {value.name}</span>
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


                                        </div>
                                        {/* Navigation Buttons */}
                                        <div className="flex justify-between">
                                            <button
                                                type="button"
                                                className={`btn btn-primary ${currentStep === 1 ? 'hidden' : ''}`}
                                                onClick={handleBack}
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary ltr:ml-auto rtl:mr-auto"
                                            // disabled={!isValid || !dirty}
                                            >
                                                {currentStep === 1 ? 'Next' : 'Finish'}
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>)}

                            {/* Image Upload Step */}
                            {currentStep === 2 && (
                                <div>
                                    <h2 className="text-lg font-bold mb-4">Upload Car Images</h2>
                                    {/* Image Upload Component */}
                                    <ComponentsDragndropGrid
                                        onImagesUpdate={handleImagesUpdate}
                                        initialImages={images} // Pass initial images from Redux
                                    />


                                    <div className="flex justify-between mt-4">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={handleBack}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => {
                                                console.log("Step 2 Images before transformation:", images); // Debug images before transformation

                                                // Transform images to include only fileId, type, and order
                                                const transformedImages = images.map((img) => ({
                                                    fileId: img.fileId,
                                                    type: img.type,
                                                    order: img.order,
                                                }));

                                                const payload = {
                                                    ...formData,
                                                    id:carId,
                                                    images: transformedImages, // Include transformed images in the form data
                                                };

                                                console.log("Payload with transformed images:", payload); // Debug final payload

                                                dispatch(setFormData(payload)); // Update Redux with the transformed images
                                                dispatch(setStep(currentStep + 1)); // Move to Step 3

                                                console.log(`Moved to Step: ${currentStep + 1}`);
                                            }}
                                        >
                                            Next
                                        </button>



                                    </div>
                                </div>
                            )}

                            {/* Publish Step */}
                            {currentStep === 3 && (
                                <div>
                                    <h2 className="text-lg font-bold mb-4">Review & Publish</h2>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleUpdate}
                                    >
                                        Update
                                    </button>
                                </div>

                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div >
    );
};

export default UpdateCarComponent;
