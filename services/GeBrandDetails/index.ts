import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '@/utils/ApiConfig';
import { eraseCookie, getCookie, setCookie } from '@/utils/cookieFunction';
import { Apis } from '@/utils/apiUrls';

const MySwal = withReactContent(Swal);

// Show notification
const showTopCenterNotification = (message: string) => {
    MySwal.fire({
        title: message,
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
    });
};

const listBrand = async (params: Record<string, any>) => {
    try {
        const response = await api.get(Apis.GetBrandList, { params });

        if (!response || response.data.success === false || !response.data.data?.length) {
            showTopCenterNotification('No brands found.');
            return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching brands:', error);
        showTopCenterNotification('An error occurred while fetching brands.');
        return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
    }
};


export default {
    listBrand
};
