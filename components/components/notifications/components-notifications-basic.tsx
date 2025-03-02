'use client';
import PanelCodeHighlight from '@/components/panel-code-highlight';
import React from 'react';
import Swal from 'sweetalert2';


const ComponentsNotificationsBasic = () => {
    

    const showMessage = () => {
        Swal.fire({
            title: 'Hello, world! This is a toast message.',
            toast: true,
            position: 'bottom-start',
            showConfirmButton: false,
            timer: 3000,
            showCloseButton: true,
        });
    };

    return (
        <PanelCodeHighlight
            title="Basic"
            codeHighlight={`import Swal from 'sweetalert2';




const showMessage = () => {
    Swal.fire({
        title: 'Hello, world! This is a toast message.',
        toast: true,
        position: 'bottom-start',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
    });
};
<div className="mb-5">
    <div className="flex items-center justify-center">
        <button type="button" className="btn btn-primary" onClick={showMessage}>
            Open Toast
        </button>
    </div>
</div>`}
        >
            <div className="mb-5">
                <div className="flex items-center justify-center">
                    <button type="button" className="btn btn-primary" onClick={showMessage}>
                        Open Toast
                    </button>
                </div>
            </div>
        </PanelCodeHighlight>
    );
};

export default ComponentsNotificationsBasic;
