'use client';

import React, { useState, useEffect } from 'react';
import SectionHeader from '@/components/utils/SectionHeader';
import { useRouter } from 'next/navigation';
import ContactUsService from '@/services/ContactUsService';

interface ContactForm {
    id: number;
    name: string;
    phoneNumber?: string;
    emailAddress: string;
    subject: string;
    message: string;
    createdAt: string;
    updatedAt: string;
}

interface ViewContactFormComponentProps {
    enquiryId: number;
}

const ViewContactFormComponent: React.FC<ViewContactFormComponentProps> = ({ enquiryId }) => {
    const [enquiry, setEnquiry] = useState<ContactForm | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        const fetchEnquiry = async () => {
            const response = await ContactUsService.getContactById(enquiryId);
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
            <SectionHeader title="View Enquiry" />
            <div className="bg-white shadow rounded p-6 space-y-3">
                <p>
                    <strong>ID:</strong> {enquiry.id}
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
                    <strong>Subject:</strong> {enquiry.subject}
                </p>
                <p>
                    <strong>Message:</strong> {enquiry.message}
                </p>
                <p>
                    <strong>Submitted At:</strong> {new Date(enquiry.createdAt).toLocaleString()}
                </p>
                <button onClick={() => router.back()} className="btn btn-secondary mt-4">
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default ViewContactFormComponent;
