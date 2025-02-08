'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconMail from '@/components/icon/icon-mail';
import IconUser from '@/components/icon/icon-user';
import { GetUserLogin } from '@/services';

// Validation Schema
const validationSchema = Yup.object({
    firstName: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    otp: Yup.string().length(6, 'OTP must be 6 digits').required('OTP is required'),
});

const RegistrationForm = () => {
    const router = useRouter();
    const [otpSent, setOtpSent] = useState(false); // Track OTP status
    const [email, setEmail] = useState(''); // Store email for OTP verification
    const [loadingOtp, setLoadingOtp] = useState(false); // Loading state for OTP request
    const [timer, setTimer] = useState(0); // Countdown timer
    const [isTimerActive, setIsTimerActive] = useState(false); // Timer state

    // Function to request OTP
    const handleRequestOtp = async () => {
        if (!email) {
            alert('Please enter a valid email before requesting OTP.');
            return;
        }

        setLoadingOtp(true);
        try {
            const response = await GetUserLogin.requestOtp({ email });
            if (response.success) {
                alert('OTP has been sent to your email.');
                setOtpSent(true); // Show OTP input field
                setIsTimerActive(true);
                startTimer(); // Start the 60-sec countdown
            } else {
                alert(response.message || 'Failed to send OTP');
            }
        } catch (error) {
            alert('Error sending OTP, please try again.');
        }
        setLoadingOtp(false);
    };

    // Function to start the countdown timer
    const startTimer = () => {
        let timeLeft = 60; // 60 seconds
        setTimer(timeLeft);

        const countdown = setInterval(() => {
            timeLeft -= 1;
            setTimer(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(countdown);
                setIsTimerActive(false);
            }
        }, 1000);
    };

    return (
        <Formik
            initialValues={{
                firstName: '',
                email: '',
                password: '',
                otp: '',
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
                try {
                    // Step 1: Verify OTP
                    const otpResponse = await GetUserLogin.verifyOtp({ email: values.email, otp: values.otp });
                    if (!otpResponse.success) {
                        alert('Invalid OTP. Please try again.');
                        setSubmitting(false);
                        return;
                    }

                    // Step 2: Register user after OTP verification
                    let user = await GetUserLogin.getUserRegister(values);
                    if (user.success) {
                        alert('Registration successful!');
                        router.push('/auth/login');
                    } else {
                        alert(user.message || 'Failed to register');
                    }
                } catch (error) {
                    alert('Error registering user, please try again.');
                }
                setSubmitting(false);
            }}
        >
            {({ isSubmitting, values, setFieldValue }) => (
                <Form className="space-y-5 dark:text-white">
                    <div>
                        <label htmlFor="firstName">Name</label>
                        <div className="relative text-white-dark">
                            <Field id="firstName" name="firstName" type="text" className="form-input ps-10 placeholder:text-white-dark" placeholder="Enter Name" />
                            <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                <IconUser fill={true} />
                            </span>
                        </div>
                        <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm" />
                    </div>
                    
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email">Email</label>
                        <div className="relative text-white-dark">
                            <Field
                                id="email"
                                name="email"
                                type="email"
                                className="form-input ps-10 placeholder:text-white-dark"
                                placeholder="Enter Email"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setEmail(e.target.value);
                                    setFieldValue('email', e.target.value);
                                }}
                                disabled={otpSent} // Disable email editing after OTP is sent
                            />
                            <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                <IconMail fill={true} />
                            </span>
                        </div>
                        <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />

                        {/* OTP Request Button */}
                        {!otpSent && (
                            <button
                                type="button"
                                className="btn btn-outline-primary mt-2 w-full"
                                onClick={handleRequestOtp}
                                disabled={loadingOtp}
                            >
                                {loadingOtp ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        )}

                        {/* Resend OTP with Timer */}
                        {otpSent && isTimerActive && (
                            <p className="text-sm text-gray-400 mt-2">
                                Resend OTP in {timer} seconds
                            </p>
                        )}

                        {!isTimerActive && otpSent && (
                            <button
                                type="button"
                                className="btn btn-outline-secondary mt-2 w-full"
                                onClick={handleRequestOtp}
                            >
                                Resend OTP
                            </button>
                        )}
                    </div>

                    {/* OTP Input - Show only after OTP is sent */}
                    {otpSent && (
                        <div>
                            <label htmlFor="otp">Enter OTP</label>
                            <div className="relative text-white-dark">
                                <Field id="otp" name="otp" type="text" className="form-input ps-10 placeholder:text-white-dark" placeholder="Enter OTP" />
                            </div>
                            <ErrorMessage name="otp" component="div" className="text-red-500 text-sm" />
                        </div>
                    )}

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password">Password</label>
                        <div className="relative text-white-dark">
                            <Field id="password" name="password" type="password" className="form-input ps-10 placeholder:text-white-dark" placeholder="Enter Password" />
                            <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                <IconLockDots fill={true} />
                            </span>
                        </div>
                        <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                    >
                        {isSubmitting ? 'Submitting...' : 'Sign Up'}
                    </button>
                </Form>
            )}
        </Formik>
    );
};

export default RegistrationForm;
