'use client';
import PanelCodeHighlight from '@/components/panel-code-highlight';
import React from 'react';
import Swal from 'sweetalert2';


const ComponentsNotificationsDuration = () => {
    

    const showMessage8 = () => {
        Swal.fire({
            title: 'Example notification text.',
            toast: true,
            position: 'bottom-start',
            showConfirmButton: false,
            timer: 5000,
            showCloseButton: true,
        });
    };

    return (
        <PanelCodeHighlight
            title="Duration"
            codeHighlight={`import Swal from 'sweetalert2';




const showMessage8 = () => {
    Swal.fire({
        title: 'Example notification text.',
        toast: true,
        position: 'bottom-start',
        showConfirmButton: false,
        timer: 5000,
        showCloseButton: true,
    });
};

<div className="mb-5">
    <div className="flex items-center justify-center">
        <button type="button" className="btn btn-dark" onClick={showMessage8}>
            Duration
        </button>
    </div>
</div>`}
        >
            <div className="mb-5">
                <div className="flex items-center justify-center">
                    <button type="button" className="btn btn-dark" onClick={showMessage8}>
                        Duration
                    </button>
                </div>
            </div>
        </PanelCodeHighlight>
    );
};

export default ComponentsNotificationsDuration;
