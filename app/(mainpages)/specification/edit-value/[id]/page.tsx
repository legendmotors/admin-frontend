'use client'; // This tells Next.js this component is client-side

import UpdateFeatureValueComponent from '@/components/car/feature/UpdateFeatureValueComponent';
import UpdateCarModelComponent from '@/components/car/model/UpdateCarModelComponent';
import UpdateSpecificationValueComponent from '@/components/car/specification/UpdateSpecificationValueComponent';
import Breadcrumb from '@/components/utils/Breadcrumbs';

import { useParams } from 'next/navigation'; // Import useParams from next/navigation

const EditBrandPage = () => {
    const { id } = useParams(); // Get the dynamic `id` from the URL parameters

    // Ensure the `id` is a single string and parse it as a number
    const specificationValueId  = typeof id === 'string' ? parseInt(id, 10) : NaN;

    // If `specificationValueId ` is not a valid number, show an error
    if (isNaN(specificationValueId )) {
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
            <UpdateSpecificationValueComponent specificationValueId ={specificationValueId } /> {/* Pass the valid specificationValueId  as a prop */}
        </div>
    );
};

export default EditBrandPage;
