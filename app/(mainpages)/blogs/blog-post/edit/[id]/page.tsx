'use client'; // This tells Next.js this component is client-side

import UpdateBlogPostComponent from '@/components/blog/post/UpdateBlogPostComponent';
import UpdateFeatureComponent from '@/components/car/feature/UpdateFeatureComponent';
import UpdateCarModelComponent from '@/components/car/model/UpdateCarModelComponent';
import Breadcrumb from '@/components/utils/Breadcrumbs';

import { useParams } from 'next/navigation'; // Import useParams from next/navigation

const EditBrandPage = () => {
    const { id } = useParams(); // Get the dynamic `id` from the URL parameters

    // Ensure the `id` is a single string and parse it as a number
    const postId  = typeof id === 'string' ? parseInt(id, 10) : NaN;

    // If `postId ` is not a valid number, show an error
    if (isNaN(postId )) {
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
            <UpdateBlogPostComponent postId ={postId } /> {/* Pass the valid postId  as a prop */}
        </div>
    );
};

export default EditBrandPage;
