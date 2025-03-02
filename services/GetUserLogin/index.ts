import Swal from 'sweetalert2';

import api from '@/utils/ApiConfig';
import { eraseCookie, getCookie, setCookie } from '@/utils/cookieFunction';
import { Apis } from '@/utils/apiUrls';
import { jwtDecode } from 'jwt-decode';



// Show notification
const showTopCenterNotification = (message: string) => {
    Swal.fire({
        title: message,
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
    });
};

// 🔹 Request OTP before registration
const requestOtp = async (data: { email: string }) => {
    try {
        const result = await api.post(Apis.RequestOtp, data);
        if (result.data.error) {
            showTopCenterNotification(result.data.error);
            return null;
        }
        return result.data;
    } catch (error) {
        console.error(error);
        showTopCenterNotification('Error sending OTP. Please try again.');
        return null;
    }
};

// 🔹 Verify OTP before allowing registration
const verifyOtp = async (data: { email: string; otp: string }) => {
    try {
        const result = await api.post(Apis.VerifyOtp, data);
        if (result.data.error) {
            showTopCenterNotification(result.data.error);
            return null;
        }
        return result.data;
    } catch (error) {
        console.error(error);
        showTopCenterNotification('Invalid OTP. Please try again.');
        return null;
    }
};

// 🔹 Resend OTP (if expired or user didn't receive it)
const resendOtp = async (data: { email: string }) => {
    try {
        const result = await api.post(Apis.ResendOtp, data);
        if (result.data.error) {
            showTopCenterNotification(result.data.error);
            return null;
        }
        return result.data;
    } catch (error) {
        console.error(error);
        showTopCenterNotification('Error resending OTP. Please try again.');
        return null;
    }
};

// 🔹 User Login
const getUserLogin = async (data: any) => {
    try {
        const result = await api.post(Apis.GetUserLogin, data, {
            withCredentials: true,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        });
        if (result.data.error) {
            showTopCenterNotification(result.data.error);
            return null;
        }
        return result.data;
    } catch (error) {
        console.error(error);
        showTopCenterNotification('An error occurred while logging in.');
        return null;
    }
};

// 🔹 Register User (only after OTP verification)
const getUserRegister = async (data: any) => {
    try {
        const result = await api.post(Apis.GetUserRegister, data);
        if (result.data.error) {
            showTopCenterNotification(result.data.error);
            return null;
        }
        return result.data;
    } catch (error) {
        console.error(error);
        showTopCenterNotification('An error occurred while registering the user.');
        return null;
    }
};

// 🔹 Get All Users
const getAllUserList = async () => {
    try {
        const result = await api.get(Apis.GetAllUserList);
        if (result.data.error) {
            showTopCenterNotification(result.data.error);
            return null;
        }
        return result.data;
    } catch (error) {
        console.error(error);
        showTopCenterNotification('An error occurred while fetching the user list.');
        return null;
    }
};

// 🔹 Update User Info
const getUserUpdate = async (data: any) => {
    try {
        const result = await api.post(Apis.GetUserUpdate, data);
        if (result.data.error) {
            showTopCenterNotification(result.data.error);
            return null;
        }
        return result.data;
    } catch (error) {
        console.error(error);
        showTopCenterNotification('An error occurred while updating the user.');
        return null;
    }
};

// 🔹 Delete User
const getDeleteUserList = async (id: string) => {
    try {
        const result = await api.post(Apis.GetDeleteUserList, { id });
        if (result.data.error) {
            showTopCenterNotification(result.data.error);
            return null;
        }
        return result.data;
    } catch (error) {
        console.error(error);
        showTopCenterNotification('An error occurred while deleting the user.');
        return null;
    }
};

// 🔹 Authenticate User (Set Cookies)
const authenticate = (user: { token: string }, next: () => void) => {
    if (typeof window !== 'undefined') {
        setCookie('token', user.token, 30); // Save the token as a cookie

        // Decode the token to extract details
        const decoded: any = jwtDecode(user.token); // Decoding the token
        if (decoded) {
            // Save roleId from the token
            if (decoded.roleId) {
                setCookie('roleId', decoded.roleId, 30);
            }

            // Save permissions as a comma-separated string
            if (decoded.permissions) {
                setCookie('permissions', decoded.permissions.join(','), 30);
            }

            // Save any additional fields if required
            if (decoded.sub) {
                setCookie('userId', decoded.sub, 30); // Save userId (sub field)
            }
        } else {
            console.warn('Token payload is invalid or missing required fields');
        }

        next();
    }
};



// 🔹 Logout User (Clear Cookies)
const logout = (next: () => void) => {
    if (typeof window !== 'undefined') {
        eraseCookie('token');
        eraseCookie('roleId');
        eraseCookie('rolePermissions');
        eraseCookie('permissions');
        eraseCookie('userId');
        eraseCookie('XSRF-token');
        window.location.reload();
    }
};

// 🔹 Check if User is Authenticated
const isAuthenticate = (): string | false => {
    if (typeof window === 'undefined') {
        return false;
    }
    const token = getCookie('token');
    return token ? JSON.stringify(token) : false;
};

export default {
    requestOtp, // ✅ NEW
    verifyOtp, // ✅ NEW
    resendOtp, // ✅ NEW
    getUserLogin,
    getUserRegister,
    getAllUserList,
    getUserUpdate,
    getDeleteUserList,
    authenticate,
    logout,
    isAuthenticate,
};
