'use client'; // This tells Next.js this component is client-side

import UpdateBlogTagComponent from '@/components/blog/tag/UpdateBlogTagComponent';
import Breadcrumb from '@/components/utils/Breadcrumbs';

import { useParams } from 'next/navigation'; // Import useParams from next/navigation

const EditBrandPage = () => {
    const { id } = useParams(); // Get the dynamic `id` from the URL parameters

    // Ensure the `id` is a single string and parse it as a number
    const tagId = typeof id === 'string' ? parseInt(id, 10) : NaN;

    // If `tagId ` is not a valid number, show an error
    if (isNaN(tagId)) {
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
            <UpdateBlogTagComponent tagId={tagId} /> {/* Pass the valid tagId  as a prop */}
        </div>
    );
};

export default EditBrandPage;
