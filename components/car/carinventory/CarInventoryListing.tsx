"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import IconPlus from "@/components/icon/icon-plus";
import ImportComponent from "@/components/utils/ImportComponent";
import { formatCurrency } from "@/utils/formatCurrency";
import IconSearch from "@/components/icon/icon-search";
import IconTrash from "@/components/icon/icon-trash";
import IconPencil from "@/components/icon/icon-pencil";
import Swal from "sweetalert2";
import { AsyncPaginate, LoadOptions } from "react-select-async-paginate";

import { GeBrandDetails, TrimService } from "@/services";
import CarModelService from "@/services/CarModelService";
import YearService from "@/services/YearService";
import { useSearchParams, useRouter } from "next/navigation";

// Redux imports
import { useSelector, useDispatch } from "react-redux";
import type { IRootState, AppDispatch } from "@/store";
import {
    setBrandId,
    setModelId,
    setTrimId,
    setYearId,
    setSearchQuery,
    resetFilters,
} from "@/store/filterOptionsSlice";
import { fetchCarList, resetCars, incrementPage } from "@/store/carSlice";

// Local or shared types
import { Car, SelectOption } from "@/types";
import CarService from "@/services/CarService";

/** Filter keys we want to handle (brandId, modelId, trimId, yearId). */
const FILTER_KEYS = ["brandId", "modelId", "trimId", "yearId"] as const;

const CarInventoryListing: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    // Read filters and car state from Redux
    const filters = useSelector((state: IRootState) => state.filters);
    const { cars, totalCars, currentPage, hasMore, isLoading } = useSelector(
        (state: IRootState) => state.car
    );

    /** Local state for dropdown selected options (rehydration) */
    const [selectedBrands, setSelectedBrands] = useState<SelectOption[]>([]);
    const [selectedModels, setSelectedModels] = useState<SelectOption[]>([]);
    const [selectedTrims, setSelectedTrims] = useState<SelectOption[]>([]);
    const [selectedYears, setSelectedYears] = useState<SelectOption[]>([]);

    // ---------------------------------------------------------
    // 1) On mount, remove empty params from URL
    // ---------------------------------------------------------
    useEffect(() => {
        let changed = false;
        const newParams = new URLSearchParams(searchParams.toString());
        for (const key of FILTER_KEYS) {
            if (newParams.get(key) === "") {
                newParams.delete(key);
                changed = true;
            }
        }
        if (changed) {
            router.replace(`?${newParams.toString()}`, { scroll: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---------------------------------------------------------
    // 2) Update URL whenever filters change (synchronization)
    // ---------------------------------------------------------
    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.searchQuery.trim()) {
            params.set("search", filters.searchQuery.trim());
        }
        for (const key of FILTER_KEYS) {
            const arr = filters[key];
            if (arr && arr.length > 0) {
                params.set(key, arr.join(","));
            }
        }
        router.push(`?${params.toString()}`, { scroll: false });
        // When filters change, reset the car list and fetch fresh data.
        dispatch(resetCars());
        dispatch(fetchCarList({ page: 1 }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    // ---------------------------------------------------------
    // 3) Infinite scroll using intersection observer.
    // ---------------------------------------------------------
    const lastCarRef = useRef<HTMLDivElement | null>(null);
    const { ref, entry } = useIntersection({
        root: lastCarRef.current,
        threshold: 1,
    });

    useEffect(() => {
        if (entry?.isIntersecting && hasMore && !isLoading) {
            dispatch(incrementPage());
            dispatch(fetchCarList({ page: currentPage + 1 }));
        }
    }, [entry, hasMore, isLoading, dispatch, currentPage]);

    // ---------------------------------------------------------
    // 4) Rehydrate filter dropdown selections (kept local)
    // ---------------------------------------------------------
    const rehydrateFilter = async (
        filterArray: string[],
        setSelected: React.Dispatch<React.SetStateAction<SelectOption[]>>,
        serviceFn: (params?: any) => Promise<any>,
        extraParams: Record<string, any> = {}
    ) => {
        if (filterArray.length === 0) {
            setSelected([]);
            return;
        }
        try {
            const resp = await serviceFn({ limit: 9999, sortBy: "name", order: "asc", ...extraParams });
            const options: SelectOption[] = resp.data.map((item: any) => ({
                value: item.id.toString(),
                label: item.name || item.year,
            }));
            const selected = options.filter((opt) => filterArray.includes(opt.value));
            setSelected(selected);
        } catch (err) {
            console.error("Error rehydrating filter:", err);
        }
    };

    useEffect(() => {
        if (filters.brandId.length > 0 && selectedBrands.length === 0) {
            rehydrateFilter(filters.brandId, setSelectedBrands, GeBrandDetails.listBrand, {
                hasModels: "true",
            });
        }
    }, [filters.brandId, selectedBrands.length]);

    useEffect(() => {
        if (filters.modelId.length > 0 && selectedModels.length === 0) {
            rehydrateFilter(filters.modelId, setSelectedModels, CarModelService.listCarModel, {
                brandId: filters.brandId.join(","),
            });
        }
    }, [filters.brandId, filters.modelId, selectedModels.length]);

    useEffect(() => {
        if (filters.trimId.length > 0 && selectedTrims.length === 0) {
            rehydrateFilter(filters.trimId, setSelectedTrims, TrimService.listTrim, {
                modelId: filters.modelId.join(","),
            });
        }
    }, [filters.modelId, filters.trimId, selectedTrims.length]);

    useEffect(() => {
        if (filters.yearId.length > 0 && selectedYears.length === 0) {
            rehydrateFilter(filters.yearId, setSelectedYears, YearService.listYear, {
                brandId: filters.brandId.join(","),
                modelId: filters.modelId.join(","),
                trimId: filters.trimId.join(","),
                sortBy: "year",
            });
        }
    }, [filters.brandId, filters.modelId, filters.trimId, filters.yearId, selectedYears.length]);

    // ---------------------------------------------------------
    // 5) Build loadOptions for AsyncPaginate
    // ---------------------------------------------------------
    // The LoadOptions type comes from react-select-async-paginate
    const createLoadOptions =
        (
            serviceFn: (params?: any) => Promise<any>,
            defaultParams: Record<string, any> = {}
        ): LoadOptions<SelectOption, any, { page?: number }> =>
            async (inputValue, _loadedOptions, additional) => {
                const page = additional?.page ?? 1;
                try {
                    const params: Record<string, any> = { page, limit: 10, ...defaultParams };
                    if (inputValue.trim()) {
                        params.search = inputValue.trim();
                    }
                    const resp = await serviceFn(params);
                    const options: SelectOption[] = resp.data.map((item: any) => ({
                        value: item.id.toString(),
                        label: item.name || item.year,
                    }));
                    return {
                        options,
                        hasMore: resp.pagination.currentPage < resp.pagination.totalPages,
                        additional: { page: page + 1 },
                    };
                } catch (error) {
                    console.error("Error loading options:", error);
                    return { options: [], hasMore: false, additional: { page } };
                }
            };

    const loadBrandOptions = createLoadOptions(GeBrandDetails.listBrand, {
        sortBy: "name",
        order: "asc",
        hasModels: "true",
    });
    const loadModelOptions = createLoadOptions(CarModelService.listCarModel, {
        sortBy: "name",
        order: "asc",
        brandId: filters.brandId.join(","),
    });
    const loadTrimOptions = createLoadOptions(TrimService.listTrim, {
        sortBy: "name",
        order: "asc",
        modelId: filters.modelId.join(","),
    });

    const getYearExtraParams = () => {
        const params: Record<string, any> = { sortBy: "year", order: "asc" };
        if (filters.brandId.length > 0) params.brandId = filters.brandId.join(",");
        if (filters.modelId.length > 0) params.modelId = filters.modelId.join(",");
        if (filters.trimId.length > 0) params.trimId = filters.trimId.join(",");
        return params;
    };
    const loadYearOptions = createLoadOptions(YearService.listYear, getYearExtraParams());

    // ---------------------------------------------------------
    // 6) onChange handlers for each dropdown
    // ---------------------------------------------------------
    const handleBrandsChange = (selected: SelectOption[] | null) => {
        const actual = selected ?? [];
        setSelectedBrands(actual);
        const brandId = actual.map((opt) => opt.value);
        dispatch(setBrandId(brandId));
    };

    const handleModelsChange = (selected: SelectOption[] | null) => {
        const actual = selected ?? [];
        setSelectedModels(actual);
        const modelId = actual.map((opt) => opt.value);
        dispatch(setModelId(modelId));
    };

    const handleTrimsChange = (selected: SelectOption[] | null) => {
        const actual = selected ?? [];
        setSelectedTrims(actual);
        const trimId = actual.map((opt) => opt.value);
        dispatch(setTrimId(trimId));
    };

    const handleYearsChange = (selected: SelectOption[] | null) => {
        const actual = selected ?? [];
        setSelectedYears(actual);
        const yearId = actual.map((opt) => opt.value);
        dispatch(setYearId(yearId));
    };

    // ---------------------------------------------------------
    // 7) Searching & Reset
    // ---------------------------------------------------------
    const handleSearch = () => {
        dispatch(resetCars());
        dispatch(fetchCarList({ page: 1 }));
    };

    const handleResetFilters = () => {
        setSelectedBrands([]);
        setSelectedModels([]);
        setSelectedTrims([]);
        setSelectedYears([]);
        dispatch(resetFilters());
        dispatch(resetCars());
        router.push("?", { scroll: false });
    };

    // ---------------------------------------------------------
    // 8) Delete a Car
    // ---------------------------------------------------------
    const handleDelete = (id: number | null) => {
        if (id === null) return;
        Swal.fire({
            icon: "warning",
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: "Delete",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Import CarService at top if not already
                    await CarService.deleteCar(id);
                    Swal.fire({
                        icon: "success",
                        title: "Deleted!",
                        text: "The car has been deleted successfully.",
                    });
                    dispatch(resetCars());
                    dispatch(fetchCarList({ page: 1 }));
                } catch (error) {
                    console.error("Error deleting car:", error);
                    Swal.fire({
                        icon: "error",
                        title: "Error!",
                        text: "Something went wrong while deleting.",
                    });
                }
            }
        });
    };

    // ---------------------------------------------------------
    // 9) CSV Import Config & Custom Styles
    // ---------------------------------------------------------
    const importComponentConfig = {
        endpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL}/car/import`,
        socketEvent: "progress",
        socketURL: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}`,
        title: "Import Cars",
        description: "Upload a CSV file to import Cars.",
        acceptedFileTypes: ".csv",
        onComplete: () => {
            console.log("Car import completed!");
        },
    };

    const customStyles = {
        valueContainer: (base: any) => ({
            ...base,
            flexWrap: "nowrap",
            overflowX: "auto",
            minHeight: "40px",
        }),
        multiValue: (base: any) => ({
            ...base,
            margin: "2px 4px",
        }),
        multiValueLabel: (base: any) => ({
            ...base,
            whiteSpace: "nowrap",
        }),
        multiValueRemove: (base: any) => ({
            ...base,
            cursor: "pointer",
        }),
    };

    // ---------------------------------------------------------
    // 10) RENDER
    // ---------------------------------------------------------
    return (
        <div className="container mx-auto p-4">
            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <AsyncPaginate
                    isMulti
                    loadOptions={loadBrandOptions}
                    debounceTimeout={300}
                    additional={{ page: 1 }}
                    value={selectedBrands}
                    onChange={handleBrandsChange}
                    placeholder="Select Brand(s)"
                    styles={customStyles}
                />
                <AsyncPaginate
                    isMulti
                    loadOptions={loadModelOptions}
                    cacheUniqs={[filters.brandId.join(",")]}
                    debounceTimeout={300}
                    additional={{ page: 1 }}
                    value={selectedModels}
                    onChange={handleModelsChange}
                    placeholder="Select Model(s)"
                    isDisabled={!filters.brandId.length}
                    styles={customStyles}
                />
                <AsyncPaginate
                    isMulti
                    loadOptions={loadTrimOptions}
                    cacheUniqs={[filters.modelId.join(",")]}
                    debounceTimeout={300}
                    additional={{ page: 1 }}
                    value={selectedTrims}
                    onChange={handleTrimsChange}
                    placeholder="Select Trim(s)"
                    isDisabled={!filters.modelId.length}
                    styles={customStyles}
                />
                <AsyncPaginate
                    isMulti
                    loadOptions={loadYearOptions}
                    cacheUniqs={[
                        filters.brandId.join(","),
                        filters.modelId.join(","),
                        filters.trimId.join(","),
                    ]}
                    debounceTimeout={300}
                    additional={{ page: 1 }}
                    value={selectedYears}
                    onChange={handleYearsChange}
                    placeholder="Select Year(s)"
                    styles={customStyles}
                />
                <button onClick={handleResetFilters} className="btn btn-secondary w-full">
                    Reset Filters
                </button>
            </div>

            {/* Top bar: total, import, search, add new */}
            <div className="flex justify-between items-center mb-4">
                <div className="text-xl font-semibold">{totalCars} Total</div>
                <div className="flex gap-2 items-center">
                    <ImportComponent {...importComponentConfig} />
                    <input
                        type="text"
                        value={filters.searchQuery}
                        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                        placeholder="Search by Stock ID"
                        className="form-input w-auto"
                    />
                    <button onClick={handleSearch} className="btn btn-success flex gap-1">
                        <IconSearch /> Search
                    </button>
                    <Link href="/inventory/add" className="btn btn-primary">
                        <IconPlus /> Add New
                    </Link>
                </div>
            </div>

            {/* Cars List */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cars.map((car: Car, index: number) => {
                    const isLastCar = index === cars.length - 1;
                    const exteriorImage = car.CarImages.find(
                        (img) => img.type === "exterior"
                    )?.FileSystem?.path;
                    const firstImage = car.CarImages[0]?.FileSystem?.path;
                    const imagePath = exteriorImage
                        ? `http://localhost:4000/uploads${exteriorImage}`
                        : firstImage
                            ? `http://localhost:4000/uploads${firstImage}`
                            : "/placeholder-image.jpg";

                    const aedPriceObj = car.CarPrices.find((p) => p.currency === "AED");
                    const aedPrice = aedPriceObj ? formatCurrency(aedPriceObj.price) : "-";
                    const usdPriceObj = car.CarPrices.find((p) => p.currency === "USD");
                    const usdPrice = usdPriceObj ? formatCurrency(usdPriceObj.price) : "-";

                    return (
                        <div
                            key={car.id}
                            ref={isLastCar ? ref : null}
                            className="border rounded-lg shadow-md flex flex-col bg-white relative"
                        >
                            <img
                                src={imagePath}
                                alt={`${car.Brand.name} ${car.CarModel.name}`}
                                width={300}
                                height={200}
                                className="rounded w-full h-[200px] object-contain"
                            />
                            <div className="p-4">
                                <h5 className="mt-2 font-bold text-xs">
                                    <span className="badge bg-dark">ID : {car.stockId}</span>
                                </h5>
                                {car.Tags.length > 0 && (
                                    <div className="mt-3 flex gap-2">
                                        {car.Tags.map((tag) => (
                                            <span key={tag.id} className="badge badge-outline-info">
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <h3 className="mt-2 font-bold text-lg">
                                    {car.Year.year} {car.Brand.name} {car.CarModel.name} {car.Trim.name}
                                </h3>
                                <div className="flex justify-between">
                                    <div className="text-lg font-bold mt-1 text-green-600">
                                        AED {aedPrice}
                                    </div>
                                    <div className="text-lg font-bold mt-1 text-green-600">
                                        $ {usdPrice}
                                    </div>
                                </div>
                                <div className="mt-2 flex gap-2">
                                    <Link
                                        href={`/inventory/edit/${car.id}`}
                                        className="btn btn-info flex items-center gap-1"
                                    >
                                        <IconPencil /> Edit
                                    </Link>
                                    <button
                                        className="btn btn-danger flex items-center gap-1"
                                        onClick={() => handleDelete(car.id)}
                                    >
                                        <IconTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {isLoading &&
                    Array.from({ length: 4 }).map((_, idx) => (
                        <Skeleton key={idx} height={210} width="100%" />
                    ))}
            </div>
        </div>
    );
};

export default CarInventoryListing;
