"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Skeleton, RangeSlider, Collapse, Button } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import IconPlus from "@/components/icon/icon-plus";
import ImportComponent from "@/components/utils/ImportComponent";
import { formatCurrency } from "@/utils/formatCurrency";
import IconSearch from "@/components/icon/icon-search";
import IconTrash from "@/components/icon/icon-trash";
import IconPencil from "@/components/icon/icon-pencil";
import Swal from "sweetalert2";
import { AsyncPaginate, LoadOptions } from "react-select-async-paginate";
import Select, { MultiValue, SingleValue } from "react-select";

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
  setSpecFilter,
  setPriceRangeAED,
  setPriceRangeUSD,
  setSortBy,
  setOrder,
  setTagIds,
} from "@/store/filterOptionsSlice";
import { fetchCarList, resetCars, incrementPage } from "@/store/carSlice";

import { Car, SelectOption } from "@/types";
import CarService from "@/services/CarService";
import SectionHeader from "@/components/utils/SectionHeader";
import SpecificationService from "@/services/SpecificationService";
import FeatureService from "@/services/FeatureService";
import CarTagService from "@/services/CarTagService";
import IconX from "@/components/icon/icon-x";

/** Filter keys we want to handle (brandId, modelId, trimId, yearId). */
const FILTER_KEYS = ["brandId", "modelId", "trimId", "yearId"] as const;

/** Loader Component using Tailwind CSS **/
const Loader: React.FC = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
    <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
  </div>
);

interface Specification {
  id: number;
  name: string;
  key: string;
  mandatory: boolean;
  values: { value: string; label: string }[];
}

interface Feature {
  id: number;
  name: string;
  mandatory: boolean;
  values: { id: number; name: string }[];
}

interface SortOption {
  label: string;
  value: string; // e.g. "price_ASC"
}

// Single sorting dropdown
const sortOptions: SortOption[] = [
  { label: "Created At (Newest First)", value: "createdAt_DESC" },
  { label: "Created At (Oldest First)", value: "createdAt_ASC" },
  { label: "Price: Low to High", value: "price_ASC" },
  { label: "Price: High to Low", value: "price_DESC" },
  { label: "Year: Newest First", value: "year_DESC" },
  { label: "Year: Oldest First", value: "year_ASC" },
  { label: "Brand (A-Z)", value: "brandName_ASC" },
  { label: "Brand (Z-A)", value: "brandName_DESC" },
  { label: "Model (A-Z)", value: "modelName_ASC" },
  { label: "Model (Z-A)", value: "modelName_DESC" },
  { label: "Stock ID (Ascending)", value: "stockId_ASC" },
  { label: "Stock ID (Descending)", value: "stockId_DESC" },
];

const CarInventoryListing: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const filters = useSelector((state: IRootState) => state.filters);
  const { cars, totalCars, currentPage, hasMore, isLoading } = useSelector(
    (state: IRootState) => state.car
  );

  /** Local states for dropdown selections **/
  const [selectedBrands, setSelectedBrands] = useState<SelectOption[]>([]);
  const [selectedModels, setSelectedModels] = useState<SelectOption[]>([]);
  const [selectedTrims, setSelectedTrims] = useState<SelectOption[]>([]);
  const [selectedYears, setSelectedYears] = useState<SelectOption[]>([]);
  // Tag states
  const [selectedTags, setSelectedTags] = useState<SelectOption[]>([]);
  const [tagOptions, setTagOptions] = useState<SelectOption[]>([]);

  const [localPriceRangeAED, setLocalPriceRangeAED] = useState<[number, number]>([0, 200000]);
  const [localPriceRangeUSD, setLocalPriceRangeUSD] = useState<[number, number]>([0, 50000]);
  // Manual input states
  const [manualMinAED, setManualMinAED] = useState<string>("");
  const [manualMaxAED, setManualMaxAED] = useState<string>("");
  const [manualMinUSD, setManualMinUSD] = useState<string>("");
  const [manualMaxUSD, setManualMaxUSD] = useState<string>("");

  const [localSearch, setLocalSearch] = useState<string>("");
  const [selectedPriceCurrency, setSelectedPriceCurrency] = useState<"AED" | "USD">("AED");
  const [expanded, setExpanded] = useState(false);

  // 1) On mount, remove empty URL params for fixed filters.
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
  }, [searchParams, router]);

  // 2) Rehydrate filters from URL (including sorting and tags).
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const FIXED_KEYS = [
      "search",
      "brandId",
      "modelId",
      "trimId",
      "yearId",
      "minPriceAED",
      "maxPriceAED",
      "minPriceUSD",
      "maxPriceUSD",
      "sortBy",
      "order",
      "tags",
    ];
    // Search query
    const searchQuery = params.get("search") || "";
    dispatch(setSearchQuery(searchQuery));

    // brandId
    const brandIdParam = params.get("brandId");
    if (brandIdParam) {
      const brandIds = brandIdParam.split(",").filter(Boolean);
      dispatch(setBrandId(brandIds));
    }
    // modelId
    const modelIdParam = params.get("modelId");
    if (modelIdParam) {
      const modelIds = modelIdParam.split(",").filter(Boolean);
      dispatch(setModelId(modelIds));
    }
    // trimId
    const trimIdParam = params.get("trimId");
    if (trimIdParam) {
      const trimIds = trimIdParam.split(",").filter(Boolean);
      dispatch(setTrimId(trimIds));
    }
    // yearId
    const yearIdParam = params.get("yearId");
    if (yearIdParam) {
      const yearIds = yearIdParam.split(",").filter(Boolean);
      dispatch(setYearId(yearIds));
    }
    // tags
    const tagsParam = params.get("tags");
    if (tagsParam) {
      const tagIds = tagsParam.split(",").filter(Boolean);
      dispatch(setTagIds(tagIds));
    }
    // Sorting
    const sortByQuery = params.get("sortBy");
    if (sortByQuery) {
      dispatch(setSortBy(sortByQuery));
    }
    const orderQuery = params.get("order");
    if (orderQuery) {
      dispatch(setOrder(orderQuery as "ASC" | "DESC"));
    }
    // Dynamic spec filters
    params.forEach((value, key) => {
      if (!FIXED_KEYS.includes(key)) {
        const specKey = key.toLowerCase();
        const specValues = value.split(",").filter(Boolean);
        if (specValues.length > 0) {
          dispatch(setSpecFilter({ key: specKey, value: specValues }));
        }
      }
    });

    dispatch(resetCars());
    dispatch(fetchCarList({ page: 1 }));
  }, [searchParams, dispatch]);

  // 3) Rehydrate price ranges from URL.
  useEffect(() => {
    const urlMinAED = searchParams.get("minPriceAED");
    const urlMaxAED = searchParams.get("maxPriceAED");
    if (urlMinAED && urlMaxAED) {
      const parsedMinAED = Number(urlMinAED);
      const parsedMaxAED = Number(urlMaxAED);
      setLocalPriceRangeAED([parsedMinAED, parsedMaxAED]);
      setManualMinAED(urlMinAED);
      setManualMaxAED(urlMaxAED);
      dispatch(setPriceRangeAED({ minPrice: parsedMinAED, maxPrice: parsedMaxAED }));
      setSelectedPriceCurrency("AED");
    }
    const urlMinUSD = searchParams.get("minPriceUSD");
    const urlMaxUSD = searchParams.get("maxPriceUSD");
    if (urlMinUSD && urlMaxUSD) {
      const parsedMinUSD = Number(urlMinUSD);
      const parsedMaxUSD = Number(urlMaxUSD);
      setLocalPriceRangeUSD([parsedMinUSD, parsedMaxUSD]);
      setManualMinUSD(urlMinUSD);
      setManualMaxUSD(urlMaxUSD);
      dispatch(setPriceRangeUSD({ minPrice: parsedMinUSD, maxPrice: parsedMaxUSD }));
      setSelectedPriceCurrency("USD");
    }
  }, [searchParams, dispatch]);

  // 4) Update URL whenever filters change (including sorting and tags).
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.searchQuery.trim()) {
      params.set("search", filters.searchQuery.trim());
    }
    // brandId, modelId, trimId, yearId
    for (const key of FILTER_KEYS) {
      const arr = filters[key];
      if (arr && arr.length > 0) {
        params.set(key, arr.join(","));
      }
    }
    // specFilters
    if (filters.specFilters) {
      for (const key in filters.specFilters) {
        const values = filters.specFilters[key];
        if (values && values.length > 0) {
          params.set(key, values.join(","));
        }
      }
    }
    // Price filters
    if (selectedPriceCurrency === "AED") {
      if (filters.minPriceAED != null) params.set("minPriceAED", filters.minPriceAED.toString());
      if (filters.maxPriceAED != null) params.set("maxPriceAED", filters.maxPriceAED.toString());
    } else {
      if (filters.minPriceUSD != null) params.set("minPriceUSD", filters.minPriceUSD.toString());
      if (filters.maxPriceUSD != null) params.set("maxPriceUSD", filters.maxPriceUSD.toString());
    }
    // Sorting
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.order) params.set("order", filters.order);
    // Tag filters
    if (filters.tagIds && filters.tagIds.length > 0) {
      params.set("tags", filters.tagIds.join(","));
    }

    router.push(`?${params.toString()}`, { scroll: false });
    dispatch(resetCars());
    dispatch(fetchCarList({ page: 1 }));
  }, [filters, selectedPriceCurrency, router, dispatch]);

  // 5) Infinite scroll using intersection observer.
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

  // 6) Rehydrate filter dropdown selections (brands, models, trims, years)
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

  // NEW: Load tag options on mount & rehydrate
  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await CarTagService.listTags({ limit: 0, sortBy: "name", order: "asc" });
        const options: SelectOption[] = response.data.map((tag: any) => ({
          value: tag.id.toString(),
          label: tag.name,
        }));
        setTagOptions(options);
      } catch (error) {
        console.error("Error loading tags:", error);
      }
    };
    loadTags();
  }, []);

  // Rehydrate selected tags from Redux filters
  useEffect(() => {
    if (tagOptions.length > 0 && filters.tagIds.length > 0 && selectedTags.length === 0) {
      const selected = tagOptions.filter((opt) => filters.tagIds.includes(opt.value));
      setSelectedTags(selected);
    } else if (filters.tagIds.length === 0 && selectedTags.length > 0) {
      // If user cleared tags in Redux, also clear local
      setSelectedTags([]);
    }
  }, [tagOptions, filters.tagIds, selectedTags.length]);

  // 7) Build loadOptions for AsyncPaginate (brand, model, trim, year)
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

  // 8) onChange handlers
  const handleBrandsChange = (selected: SelectOption[] | null) => {
    const actual = selected ?? [];
    setSelectedBrands(actual);
    const brandId = actual.map((opt) => opt.value);
    dispatch(setBrandId(brandId));
    if (brandId.length === 0) {
      setSelectedModels([]);
      setSelectedTrims([]);
      dispatch(setModelId([]));
      dispatch(setTrimId([]));
    }
  };

  const handleModelsChange = (selected: SelectOption[] | null) => {
    const actual = selected ?? [];
    setSelectedModels(actual);
    const modelId = actual.map((opt) => opt.value);
    dispatch(setModelId(modelId));
    if (modelId.length === 0) {
      setSelectedTrims([]);
      dispatch(setTrimId([]));
    }
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

  // Tag change
  const handleTagsChange = (selected: MultiValue<SelectOption>) => {
    const actual = Array.from(selected); // Convert readonly to normal array
    setSelectedTags(actual);
    dispatch(setTagIds(actual.map((opt) => opt.value)));
  };

  // Search & Reset
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    // Auto-reset the search filter when input is cleared
    if (value.trim() === "") {
      dispatch(setSearchQuery(""));
      dispatch(resetCars());
      dispatch(fetchCarList({ page: 1 }));
    }
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    dispatch(setSearchQuery(""));
    dispatch(resetCars());
    dispatch(fetchCarList({ page: 1 }));
  };

  const handleSearch = () => {
    // When there is a non-empty value, add the search filter.
    if (localSearch.trim() !== "") {
      dispatch(setSearchQuery(localSearch));
      dispatch(resetCars());
      dispatch(fetchCarList({ page: 1 }));
    }
  };

  const handleResetFilters = () => {
    setSelectedBrands([]);
    setSelectedModels([]);
    setSelectedTrims([]);
    setSelectedYears([]);
    setSelectedTags([]);
    setLocalPriceRangeAED([0, 200000]);
    setLocalPriceRangeUSD([0, 50000]);
    setManualMinAED("");
    setManualMaxAED("");
    setManualMinUSD("");
    setManualMaxUSD("");
    setLocalSearch("");
    dispatch(resetFilters());
    dispatch(resetCars());
    router.push("?", { scroll: false });
  };

  // 10) Delete a Car
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

  // 11) CSV Import & Styles
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
      minHeight: "20px",
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
    menu: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetching specs
  useEffect(() => {
    const fetchSpecificationsWithValues = async () => {
      try {
        setLoading(true);
        const specsRes = await SpecificationService.listSpecifications({ limit: 0 });
        const specsData = specsRes.data;
        const specsWithValues = await Promise.all(
          specsData.map(async (spec: any) => {
            const valuesRes = await SpecificationService.listSpecificationValues({
              specificationId: spec.id,
              limit: 0,
            });
            const values = valuesRes.data.map((v: any) => ({
              value: v.id.toString(),
              label: v.name,
            }));
            return { ...spec, values };
          })
        );
        setSpecifications(specsWithValues);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching specifications:", error);
        setLoading(false);
      }
    };
    fetchSpecificationsWithValues();
  }, []);

  // Fetching features
  useEffect(() => {
    const fetchFeaturesWithValues = async () => {
      try {
        const featuresRes = await FeatureService.listFeatures({ limit: 0 });
        const featuresData = featuresRes.data;
        const featuresWithValues = await Promise.all(
          featuresData.map(async (feature: any) => {
            const valuesRes = await FeatureService.listFeatureValues({
              featureId: feature.id,
              limit: 0,
            });
            const values = valuesRes.data.map((v: any) => ({
              id: v.id,
              name: v.name,
              slug: v.slug,
            }));
            return { ...feature, values };
          })
        );
        setFeatures(featuresWithValues);
      } catch (error) {
        console.error("Error fetching features:", error);
      }
    };
    fetchFeaturesWithValues();
  }, []);

  return (
    <div className="relative">
      {isLoading && <Loader />}
      <div className="flex flex-col gap-2.5 xl:flex-row">
        <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0 ">
          <SectionHeader title="Car Inventory" />
          <div className="px-4 w-100">
            {/* Sticky Filters Container */}
            <div className="sticky top-14 z-10 px-2 py-2 bg-white border rounded-lg">
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
              </div>

              <div className="flex justify-center gap-4 ">
                <Button onClick={() => setExpanded((prev) => !prev)} variant="outline">
                  {expanded ? "Show Less Filters" : "Show More Filters"}
                </Button>
                <button onClick={handleResetFilters} className="btn btn-secondary">
                  Reset Filters
                </button>
              </div>
              <Collapse in={expanded}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 mt-6">
                  {/* Specification Filters */}
                  {specifications.map((spec) => (
                    <div key={spec.id}>
                      <label className="block font-medium mb-1">
                        {spec.name} {spec.mandatory && <span className="text-red-500">*</span>}
                      </label>
                      <div>
                        <Select
                          isMulti
                          options={spec.values}
                          placeholder={`Select ${spec.name}`}
                          value={
                            filters.specFilters[spec.key.toLowerCase()]
                              ? spec.values.filter((option) =>
                                filters.specFilters[spec.key.toLowerCase()].includes(option.value)
                              )
                              : []
                          }
                          onChange={(selectedOptions: MultiValue<SelectOption>) => {
                            const values = selectedOptions.map((option) => option.value);
                            dispatch(setSpecFilter({ key: spec.key.toLowerCase(), value: values }));
                          }}
                          isClearable
                          styles={customStyles}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPriceCurrency === "AED" ? (
                  <div>
                    <label className="block font-medium mb-1">
                      Price Range{" "}
                      <select
                        className="form-select w-24"
                        value={selectedPriceCurrency}
                        onChange={(e) => {
                          const currency = e.target.value as "AED" | "USD";
                          setSelectedPriceCurrency(currency);
                        }}
                      >
                        <option value="AED">AED</option>
                        <option value="USD">USD</option>
                      </select>
                    </label>
                    <RangeSlider
                      min={0}
                      max={500000}
                      step={1000}
                      value={localPriceRangeAED}
                      onChange={setLocalPriceRangeAED}
                      onChangeEnd={(value) => {
                        dispatch(setPriceRangeAED({ minPrice: value[0], maxPrice: value[1] }));
                      }}
                      className="mt-2 z-0"
                    />
                    <div className="mt-2 flex justify-between">
                      <span className="badge bg-primary rounded-full">
                        Min: {localPriceRangeAED[0]}
                      </span>
                      <span className="badge bg-primary rounded-full ml-2">
                        Max: {localPriceRangeAED[1]}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <input
                        type="number"
                        placeholder="From"
                        className="form-input"
                        value={manualMinAED}
                        onChange={(e) => setManualMinAED(e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="To"
                        className="form-input"
                        value={manualMaxAED}
                        onChange={(e) => setManualMaxAED(e.target.value)}
                      />
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          const fromVal = manualMinAED ? parseInt(manualMinAED, 10) : 0;
                          const toVal = manualMaxAED ? parseInt(manualMaxAED, 10) : 500000;
                          setLocalPriceRangeAED([fromVal, toVal]);
                          dispatch(setPriceRangeAED({ minPrice: fromVal, maxPrice: toVal }));
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block font-medium mb-1">
                      Price Range{" "}
                      <select
                        className="form-select w-24"
                        value={selectedPriceCurrency}
                        onChange={(e) => {
                          const currency = e.target.value as "AED" | "USD";
                          setSelectedPriceCurrency(currency);
                        }}
                      >
                        <option value="AED">AED</option>
                        <option value="USD">USD</option>
                      </select>
                    </label>
                    <RangeSlider
                      min={0}
                      max={100000}
                      step={500}
                      value={localPriceRangeUSD}
                      onChange={setLocalPriceRangeUSD}
                      onChangeEnd={(value) => {
                        dispatch(setPriceRangeUSD({ minPrice: value[0], maxPrice: value[1] }));
                      }}
                    />
                    <div className="mt-2 flex justify-between">
                      <span className="badge bg-primary rounded-full">
                        Min: {localPriceRangeUSD[0]}
                      </span>
                      <span className="badge bg-primary rounded-full ml-2">
                        Max: {localPriceRangeUSD[1]}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <input
                        type="number"
                        placeholder="From"
                        className="form-input"
                        value={manualMinUSD}
                        onChange={(e) => setManualMinUSD(e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="To"
                        className="form-input"
                        value={manualMaxUSD}
                        onChange={(e) => setManualMaxUSD(e.target.value)}
                      />
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          const fromVal = manualMinUSD ? parseInt(manualMinUSD, 10) : 0;
                          const toVal = manualMaxUSD ? parseInt(manualMaxUSD, 10) : 100000;
                          setLocalPriceRangeUSD([fromVal, toVal]);
                          dispatch(setPriceRangeUSD({ minPrice: fromVal, maxPrice: toVal }));
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </Collapse>
            </div>

            {/* Tag and Sorting Row */}
            <div className="mt-8 flex justify-end gap-3">
              {/* Tag Filter */}
              <div className="flex flex-col gap-2 b-4 relative w-[30%]">
                <label className="mb-0 text-left absolute -top-[19px]">Filter by Tags</label>
                <Select
                  isMulti
                  options={tagOptions}
                  value={selectedTags}
                  onChange={handleTagsChange}
                  placeholder="Select Tags"
                  styles={customStyles}
                />
              </div>
              {/* Single Sorting Dropdown */}
              <div className="flex flex-col gap-2 b-4 relative w-[30%]">
                <label className="mb-0 text-left absolute -top-[19px]">Sort By</label>
                <Select<SortOption>
                  options={sortOptions}
                  value={sortOptions.find(
                    (opt) => opt.value === `${filters.sortBy}_${filters.order}`
                  )}
                  onChange={(selectedOption: SingleValue<SortOption>) => {
                    if (!selectedOption) return;
                    const [sortField, sortOrder] = selectedOption.value.split("_");
                    dispatch(setSortBy(sortField));
                    dispatch(setOrder(sortOrder as "ASC" | "DESC"));
                  }}
                  className="w-100"
                  styles={customStyles}
                />
              </div>
            </div>

            {/* Top bar: total, import, search, and add new */}
            <div className="flex justify-between items-center mb-4 mt-4">
              <div className="flex flex-col md:flex-row gap-2 items-center">
                {/* <ImportComponent {...importComponentConfig} /> */}
                <Link href="/inventory/add" className="btn btn-primary">
                  <IconPlus /> Add New
                </Link>
              </div>
              <div className="flex gap-2 items-center ">
                <div className="relative flex items-center ">
                  <input
                    type="text"
                    value={localSearch}
                    onChange={handleSearchChange}
                    placeholder="Search by Stock ID, brand, model, or keyword..."
                    className="form-input w-[300px]"
                  />
                  {localSearch && (
                    <span onClick={handleClearSearch} className="absolute z-9 right-3 cursor-pointer" >
                      <IconX className="w-4 h-4 text-black" />
                    </span>
                  )}
                </div>
                <button onClick={handleSearch} className="btn btn-success flex gap-1">
                  <IconSearch /> Search
                </button>
              </div>

            </div>

            <div className="text-xl font-semibold mb-4">{totalCars} Total Cars</div>

            {/* Cars List */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cars.map((car: Car, index: number) => {
                const isLastCar = index === cars.length - 1;
                const exteriorCarImage = car.CarImages.find((img) => img.type === "exterior");
                const exteriorImage =
                  exteriorCarImage?.FileSystem?.thumbnailPath || exteriorCarImage?.FileSystem?.path;

                const firstCarImage = car.CarImages[0];
                const firstImage =
                  firstCarImage?.FileSystem?.thumbnailPath || firstCarImage?.FileSystem?.path;

                const imagePath = exteriorImage
                  ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${exteriorImage}`
                  : firstImage
                    ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${firstImage}`
                    : "/assets/car-placeholder.webp";


                const aedPriceObj = car.CarPrices.find((p) => p.currency === "AED");
                const aedPrice = aedPriceObj ? formatCurrency(aedPriceObj.price) : "-";
                const usdPriceObj = car.CarPrices.find((p) => p.currency === "USD");
                const usdPrice = usdPriceObj ? formatCurrency(usdPriceObj.price) : "-";
                const regionalSpecification = car?.SpecificationValues?.find(
                  (spec) => spec?.Specification?.key === "regional_specification"
                );
                const regionalSpecificationName = regionalSpecification?.name || "N/A";
                const SteeringSide = car?.SpecificationValues?.find(
                  (spec) => spec?.Specification?.key === "steering_side"
                );
                const SteeringSideName = SteeringSide?.name || "N/A";

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
                      className="rounded w-full h-[200px] object-cover"
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
                        {car.Year.year} {car.Brand.name} {car.CarModel.name} {car?.Trim?.name}
                      </h3>
                      <p className="text-gray-700 font-semibold"> {car?.additionalInfo}</p>
                      <div className="flex justify-between">
                        <div className="text-lg font-bold mt-1 text-green-600">
                          AED {aedPrice}
                        </div>
                        <div className="text-lg font-bold mt-1 text-green-600">
                          $ {usdPrice}
                        </div>
                      </div>
                      <div className="my-2 flex flex-wrap gap-0">
                        <span className="badge bg-primary rounded-full me-1">
                          Region: {regionalSpecificationName}
                        </span>
                        <span className="badge bg-primary rounded-full">
                          Steering Side: {SteeringSideName}
                        </span>
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
        </div>
      </div>
    </div>
  );
};

export default CarInventoryListing;
