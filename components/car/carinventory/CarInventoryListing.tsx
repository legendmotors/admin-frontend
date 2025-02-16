"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import IconPlus from "@/components/icon/icon-plus";
import CarService from "@/services/CarService";
import ImportComponent from "@/components/utils/ImportComponent";

const CarInventoryListing: React.FC = () => {
    const [cars, setCars] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>(""); // Search input state
    const [currentPage, setCurrentPage] = useState<number>(1); // Pagination state
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Fetch car list based on current filters
    const fetchCarList = async () => {
        setIsLoading(true);

        try {
            const params: Record<string, any> = {
                page: currentPage,
            };

            // Only include the search parameter if it has a value
            if (searchQuery.trim()) {
                params.search = searchQuery.trim();
            }

            const response = await CarService.listCars(params);
            setCars(response);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    // Handle search action
    const handleSearch = () => {
        setCurrentPage(1); // Reset to first page when searching
        fetchCarList();
    };

    // Handle pagination
    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    // Handle delete car
    const handleDelete = async (id: number) => {
        const isDeleted = await CarService.deleteCar(id);
        if (isDeleted) {
            fetchCarList(); // Refresh the list after deletion
        }
    };

    const handleUpdate = (id: number) => {
        console.log("Update car:", id);
    };

    useEffect(() => {
        fetchCarList();
    }, [currentPage]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const importComponentConfig = {
        endpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL}/car/import`,
        socketEvent: 'progress',
        socketURL: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}`,
        title: 'Import Cars',
        description: 'Upload a CSV file to import Cars.',
        acceptedFileTypes: '.csv',
        onComplete: () => {
            console.log('Car import completed!');
            // Additional logic if needed
        },
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="text-xl font-semibold">{cars.pagination.totalItems} Total</div>

                <div className="flex gap-2 items-center">
                    <ImportComponent
                        endpoint={importComponentConfig.endpoint}
                        socketEvent={importComponentConfig.socketEvent}
                        socketURL={importComponentConfig.socketURL}
                        title={importComponentConfig.title}
                        description={importComponentConfig.description}
                        acceptedFileTypes={importComponentConfig.acceptedFileTypes}
                        onComplete={importComponentConfig.onComplete}
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search by Stock ID"
                        className="form-input w-auto"
                    />
                    <button
                        onClick={handleSearch}
                        className="btn btn-success"
                    >
                        Search
                    </button>
                    <Link href="/inventory/add" className="btn btn-primary">
                        <IconPlus /> Add New
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cars.data.map((car: any) => {
                    const exteriorImage = car.CarImages.find(
                        (image: any) => image.type === "exterior"
                    )?.FileSystem?.path;
                    const firstImage = car.CarImages[0]?.FileSystem?.path;
                    const imagePath = exteriorImage
                        ? `http://localhost:4000/uploads${exteriorImage}`
                        : firstImage
                            ? `http://localhost:4000/uploads${firstImage}`
                            : "/placeholder-image.jpg";

                    return (
                        <div
                            key={car.id}
                            className="border rounded-lg shadow-md p-4 flex flex-col bg-white relative"
                        >
                            {car.featured && (
                                <div className="absolute top-2 right-2 bg-yellow-300 px-2 py-1 text-sm font-bold rounded">
                                    Featured
                                </div>
                            )}
                            <img
                                src={imagePath}
                                alt={`${car.Brand.name} ${car.CarModel.name}`}
                                width={300}
                                height={200}
                                className="rounded w-[100%] h-[230px] object-contain"
                            />
                            <div className="mt-2 font-semibold text-lg">
                                {car.Brand.name} {car.CarModel.name}
                            </div>
                            <div className="text-sm text-gray-600">
                                {car.Year.year} {car.Trim.name}
                            </div>
                            <div className="text-lg font-bold mt-1">
                                {car.CarPrices.find(
                                    (price: any) => price.currency === "AED"
                                )?.price || "Price Not Available"}{" "}
                                AED
                            </div>
                            <div className="mt-2 flex gap-2">
                                <Link href={`/inventory/edit/${car.id}`}
                                    className="btn btn-success "
                                >
                                    Edit
                                </Link>
                                <button
                                    className="btn btn-danger "
                                    onClick={() => handleDelete(car.id)}
                                >
                                    Delete
                                </button>
                            </div>

                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4">
                <button
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                    className="bg-gray-300 text-gray-800 px-3 py-1 rounded mr-2"
                >
                    Prev
                </button>
                {[...Array(cars.pagination.totalPages)].map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToPage(index + 1)}
                        className={`px-3 py-1 rounded mx-1 ${currentPage === index + 1
                            ? "bg-blue-500 text-white"
                            : "bg-gray-300 text-gray-800"
                            }`}
                    >
                        {index + 1}
                    </button>
                ))}
                <button
                    disabled={currentPage === cars.pagination.totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                    className="bg-gray-300 text-gray-800 px-3 py-1 rounded ml-2"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default CarInventoryListing;
