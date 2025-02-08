'use client';
import PanelCodeHighlight from '@/components/panel-code-highlight';
import React from 'react';
import Swal from 'sweetalert2';

const ComponentsSweetAlertsWarning = () => {
    const showAlert = async () => {
        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: {
                popup: 'sweet-alerts', // Apply custom class to the popup container
                cancelButton: 'cancel-button-class', // Optional: style cancel button if needed
                confirmButton: 'confirm-button-class', // Optional: style confirm button if needed
            },
        }).then((result) => {
            if (result.isConfirmed) { // Using 'isConfirmed' instead of 'value' for clarity
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your file has been deleted.',
                    icon: 'success',
                    customClass: {
                        popup: 'sweet-alerts', // Ensure same custom class is applied here too
                    },
                });
            }
        });
    };
    
    return (
        <PanelCodeHighlight
            title='Warning message, with "Confirm" button'
            codeHighlight={`import Swal from 'sweetalert2';

const showAlert = async () => {
    Swal.fire({
        icon: 'warning',
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        showCancelButton: true,
        confirmButtonText: 'Delete',
        padding: '2em',
         customClass: {
                popup: 'sweet-alerts', 
            },
    }).then((result) => {
        if (result.value) {
            Swal.fire({ title: 'Deleted!', text: 'Your file has been deleted.', icon: 'success', customClass: 'sweet-alerts' });
        }
    });
}

<div className="mb-5">
    <div className="flex items-center justify-center">
        <button type="button" className="btn btn-success" onClick={() => showAlert()}>
            Confirm
        </button>
    </div>
</div>`}
        >
            <div className="mb-5">
                <div className="flex items-center justify-center">
                    <button type="button" className="btn btn-success" onClick={() => showAlert()}>
                        Confirm
                    </button>
                </div>
            </div>
        </PanelCodeHighlight>
    );
};

export default ComponentsSweetAlertsWarning;
