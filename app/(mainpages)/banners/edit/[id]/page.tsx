'use client'; // This tells Next.js this component is client-side

import UpdateBannerComponent from '@/components/banner/UpdateBannerComponent';
import PageUpdateComponent from '@/components/cms/PageUpdateComponent';
import Breadcrumb from '@/components/utils/Breadcrumbs';

import { useParams } from 'next/navigation'; // Import useParams from next/navigation

const EditBanner = () => {
    const { id } = useParams(); // Get the dynamic `id` from the URL parameters

    // Ensure the `id` is a single string and parse it as a number
    const bannerId  = typeof id === 'string' ? parseInt(id, 10) : NaN;

    // If `bannerId ` is not a valid number, show an error
    if (isNaN(bannerId )) {
        return <div>Invalid Brand ID</div>; // Show error if `id` is invalid
    }

    const breadcrumbItems = [
        { label: 'Home', isHome: true, link: '/', isActive: false },
        { label: 'All Banner', link: '/banners/list', isActive: false },
        { label: 'Edit Banner', link: '', isActive: true },
    ];

    return (
        <div>
            <Breadcrumb items={breadcrumbItems} />
            <UpdateBannerComponent bannerId ={bannerId } /> {/* Pass the valid bannerId  as a prop */}
        </div>
    );
};

export default EditBanner;
