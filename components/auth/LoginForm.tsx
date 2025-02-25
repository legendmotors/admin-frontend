'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconMail from '@/components/icon/icon-mail';
import { GetUserLogin } from '@/services';

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const router = useRouter();

    // ✅ Redirect to /admin if the user is already logged in
    useEffect(() => {
        if (typeof window !== "undefined" && GetUserLogin.isAuthenticate()) {
            router.push('/');
        }
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoaded(true);

        try {
            const data = { email, password };
            const user = await GetUserLogin.getUserLogin(data);
            
            if (user?.token) {
                // ✅ Store token in cookies using GetUserLogin.authenticate
                GetUserLogin.authenticate(user, () => {
                    router.push('/'); // Redirect after successful login
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Please check Username & Password',
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Login Error',
                text: 'An error occurred. Please try again.',
            });
        } finally {
            setIsLoaded(false);
        }
    };

    return (
        <form className="space-y-5 dark:text-white" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email">Email</label>
                <div className="relative text-white-dark">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter Email"
                        className="form-input ps-10 placeholder:text-white-dark"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconMail fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <div className="relative text-white-dark">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter Password"
                        className="form-input ps-10 placeholder:text-white-dark"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                </div>
            </div>
            {/* <div>
                <label className="flex cursor-pointer items-center">
                    <input type="checkbox" className="form-checkbox bg-white dark:bg-black" />
                    <span className="text-white-dark">Subscribe to weekly newsletter</span>
                </label>
            </div> */}
            <button
                type="submit"
                className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                disabled={isLoaded}
            >
                {isLoaded ? 'Signing in...' : 'Sign in'}
            </button>
        </form>
    );
};

export default LoginForm;
