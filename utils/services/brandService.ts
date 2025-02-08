import Swal from 'sweetalert2';

interface BrandFormValues {
    name: string;
    description: string;
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    logo: any[];
}

export const handleBrandSubmit = async (
    values: BrandFormValues,
    selectedFiles: any[],
    brandId?: number,
    isEdit: boolean = false,
    lang?: string
) => {
    const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/brand/update${lang ? `?lang=${lang}` : ''}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/brand/create`;

    const payload = {
        id: brandId,
        name: values.name,
        slug: values.slug,
        description: values.description,
        metaTitle: values.metaTitle,
        metaDescription: values.metaDescription,
        metaKeywords: values.metaKeywords,
        logo: selectedFiles, // ✅ Send selectedFiles array
    };

    try {
        const progressBarHtml = `
            <div class="mb-5 space-y-5">
                <div class="w-full h-4 bg-[#ebedf2] dark:bg-dark/40 rounded-full">
                    <div id="progress-bar" class="bg-info h-4 rounded-full text-center text-white text-xs" style="width: 0%;">0%</div>
                </div>
                <p id="status-message">Initializing...</p>
            </div>
        `;

        Swal.fire({
            title: isEdit ? 'Updating Brand...' : 'Creating Brand...',
            html: progressBarHtml,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                const progressBar = document.getElementById('progress-bar');
                if (progressBar) progressBar.style.width = '0%';

                const statusMessage = document.getElementById('status-message');
                if (statusMessage) statusMessage.textContent = 'Starting the process...';
            },
        });

        const response = await fetch(url, {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.success) {
            let currentProgress = 0;
            const progressBar = document.getElementById('progress-bar');
            const statusMessageElement = document.getElementById('status-message');

            const interval = setInterval(() => {
                if (currentProgress < 100) {
                    currentProgress += 10;

                    if (progressBar) {
                        progressBar.style.width = `${currentProgress}%`;
                        progressBar.textContent = `${currentProgress}%`;
                    }

                    if (statusMessageElement) statusMessageElement.textContent = 'Processing...';
                } else {
                    clearInterval(interval);
                    if (statusMessageElement) statusMessageElement.textContent = 'Brand Successfully Processed!';

                    Swal.fire({
                        icon: 'success',
                        title: isEdit ? 'Updated Successfully!' : 'Created Successfully!',
                        text: `The brand has been ${isEdit ? 'updated' : 'created'}.`,
                    }).then(() => {
                        window.location.href = '/brand/list'; // ✅ Redirect after success
                    });
                }
            }, 1000);
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: data.msg });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error instanceof Error ? error.message : 'An unexpected error occurred.',
        });
    }
};
