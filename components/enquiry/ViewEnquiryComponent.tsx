'use client';

import React, { useState, useEffect } from 'react';
import SectionHeader from '@/components/utils/SectionHeader';
import CarEnquiryService from '@/services/CarEnquiryService';
import { useRouter } from 'next/navigation';

interface Enquiry {
    id: number;
    stockId: string;
    year: number;
    brand: string;
    model: string;
    trim: string;
    name: string;
    phoneNumber?: string;
    emailAddress: string;
    createdAt: string;
    updatedAt: string;
}

interface ViewEnquiryComponentProps {
    enquiryId: number;
}

const ViewEnquiryComponent: React.FC<ViewEnquiryComponentProps> = ({ enquiryId }) => {
    const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        const fetchEnquiry = async () => {
            const response = await CarEnquiryService.getCarEnquiryById(enquiryId);
            if (response && response.success) {
                setEnquiry(response.data);
            }
            setLoading(false);
        };
        fetchEnquiry();
    }, [enquiryId]);

    if (loading) return <div>Loading...</div>;
    if (!enquiry) return <div>Enquiry not found.</div>;

    return (
        <div className="p-4">
            <SectionHeader title="Enquiry Details" />
            <div className="bg-white shadow rounded p-6 space-y-3">
                <p>
                    <strong>ID:</strong> {enquiry.id}
                </p>
                <p>
                    <strong>Stock ID:</strong> {enquiry.stockId}
                </p>
                <p>
                    <strong>Year:</strong> {enquiry.year}
                </p>
                <p>
                    <strong>Brand:</strong> {enquiry.brand}
                </p>
                <p>
                    <strong>Model:</strong> {enquiry.model}
                </p>
                <p>
                    <strong>Trim:</strong> {enquiry.trim}
                </p>
                <p>
                    <strong>Name:</strong> {enquiry.name}
                </p>
                <p>
                    <strong>Email Address:</strong> {enquiry.emailAddress}
                </p>
                {enquiry.phoneNumber && (
                    <p>
                        <strong>Phone Number:</strong> {enquiry.phoneNumber}
                    </p>
                )}
                <p>
                    <strong>Subscribed At:</strong>{' '}
                    {new Date(enquiry.createdAt).toLocaleString()}
                </p>
                <button onClick={() => router.back()} className="btn btn-secondary mt-4">
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default ViewEnquiryComponent;
