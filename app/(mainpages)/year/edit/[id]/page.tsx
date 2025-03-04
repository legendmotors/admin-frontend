'use client'; // This tells Next.js this component is client-side

import UpdateYearComponent from '@/components/car/year/UpdateYearComponent';
import Breadcrumb from '@/components/utils/Breadcrumbs';

import { useParams } from 'next/navigation'; // Import useParams from next/navigation

const EditBrandPage = () => {
    const { id } = useParams(); // Get the dynamic `id` from the URL parameters

    // Ensure the `id` is a single string and parse it as a number
    const yearId = typeof id === 'string' ? parseInt(id, 10) : NaN;

    // If `yearId ` is not a valid number, show an error
    if (isNaN(yearId)) {
        return <div>Invalid Year ID</div>; // Show error if `id` is invalid
    }

    const breadcrumbItems = [
        { label: 'Home', isHome: true, link: '/', isActive: false },
        { label: 'All Year', link: '/year/list', isActive: false },
        { label: 'Edit Year', link: '', isActive: true },
    ];

    return (
        <div>
            <Breadcrumb items={breadcrumbItems} />
            <UpdateYearComponent yearId={yearId} /> {/* Pass the valid yearId  as a prop */}
        </div>
    );
};

export default EditBrandPage;
