// components/AlertModal.tsx
import Swal from 'sweetalert2';

interface AlertModalProps {
    type: number;
    title: string;
    text: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
    type,
    title,
    text,
    confirmText,
    cancelText,
    onConfirm,
}) => {
    const showAlert = async () => {
        if (type === 10) {
            const result = await Swal.fire({
                icon: 'warning',
                title,
                text,
                showCancelButton: true,
                confirmButtonText: confirmText,
                cancelButtonText: cancelText,
                padding: '2em',
                customClass: {
                    popup: 'sweet-alerts', // Custom class for popup
                    cancelButton: 'cancel-button-class', // Optional: custom style for cancel button
                    confirmButton: 'confirm-button-class', // Optional: custom style for confirm button
                },
            });

            if (result.isConfirmed) {
                onConfirm();
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your file has been deleted.',
                    icon: 'success',
                    customClass: {
                        popup: 'sweet-alerts', // Custom class for popup here as well
                        // You can add more specific custom classes for success modal if needed
                    },
                });
            }
        }
    };


    return <button onClick={showAlert} className="btn btn-danger gap-2">Confirm</button>;
};

export default AlertModal;
