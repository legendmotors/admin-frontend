'use client'; // This tells Next.js this component is client-side

import UpdateTrimComponent from '@/components/car/trim/UpdateTrimComponent';
import Breadcrumb from '@/components/utils/Breadcrumbs';

import { useParams } from 'next/navigation'; // Import useParams from next/navigation

const EditTrimPage = () => {
    const { id } = useParams(); // Get the dynamic `id` from the URL parameters

    // Ensure the `id` is a single string and parse it as a number
    const trimId = typeof id === 'string' ? parseInt(id, 10) : NaN;

    // If `trimId` is not a valid number, show an error
    if (isNaN(trimId)) {
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
            <UpdateTrimComponent trimId={trimId} /> {/* Pass the valid trimId as a prop */}
        </div>
    );
};

export default EditTrimPage;
