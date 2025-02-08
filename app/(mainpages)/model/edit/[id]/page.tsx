'use client'; // This tells Next.js this component is client-side

import UpdateCarModelComponent from '@/components/car/model/UpdateCarModelComponent';
import Breadcrumb from '@/components/utils/Breadcrumbs';

import { useParams } from 'next/navigation'; // Import useParams from next/navigation

const EditBrandPage = () => {
    const { id } = useParams(); // Get the dynamic `id` from the URL parameters

    // Ensure the `id` is a single string and parse it as a number
    const modelId = typeof id === 'string' ? parseInt(id, 10) : NaN;

    // If `modelId` is not a valid number, show an error
    if (isNaN(modelId)) {
        return <div>Invalid Brand ID</div>; // Show error if `id` is invalid
    }

    const breadcrumbItems = [
        { label: 'Home', isHome: true, link: '/', isActive: false },
        { label: 'All Brands', link: '/brand/list', isActive: false },
        { label: 'Edit Brand', link: '', isActive: true },
    ];

    return (
        <div>
            <Breadcrumb items={breadcrumbItems} />
            <UpdateCarModelComponent modelId={modelId} /> {/* Pass the valid modelId as a prop */}
        </div>
    );
};

export default EditBrandPage;
