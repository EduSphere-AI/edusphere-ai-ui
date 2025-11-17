'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, getUserProfile } from '@/lib/firebase';

import {
    Mail,
    Lock,
    Chrome,
    Sparkles,
    ArrowRight,
    AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuthStore();

    const router = useRouter();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password,
            );

            // Wait for auth state to settle
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Fetch user profile from Firestore (optional)
            const userProfile = await getUserProfile(userCredential.user.uid);

            // Update local auth state
            login({
                id: userCredential.user.uid,
                name:
                    userProfile?.name || userCredential.user.displayName || '',
                email: userCredential.user.email || '',
            });

            console.log(
                '✅ User logged in successfully:',
                userCredential.user.uid,
            );
            router.push('/dashboard');
        } catch (err: any) {
            console.error('Login error:', err);

            switch (err.code) {
                case 'auth/invalid-email':
                    setError('Invalid email address');
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    // Combine these for security (don't reveal which is wrong)
                    setError('Invalid email or password');
                    break;
                case 'auth/invalid-credential':
                    setError('Invalid email or password');
                    break;
                case 'auth/too-many-requests':
                    setError('Too many failed attempts. Try again later');
                    break;
                default:
                    setError('Login failed. Please try again');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            const result = await signInWithPopup(auth, googleProvider);

            // Wait for auth state to settle
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Fetch user profile from Firestore (optional)
            const userProfile = await getUserProfile(result.user.uid);

            // Update local auth state
            login({
                id: result.user.uid,
                name: userProfile?.name || result.user.displayName || '',
                email: result.user.email || '',
            });

            console.log(
                '✅ Google user logged in successfully:',
                result.user.uid,
            );
            router.push('/dashboard');
        } catch (err: any) {
            console.error('Google login error:', err);

            if (err.code === 'auth/popup-closed-by-user') {
                setError('Google sign-in was cancelled');
            } else if (
                err.code === 'auth/account-exists-with-different-credential'
            ) {
                setError(
                    'An account already exists with this email using a different sign-in method',
                );
            } else {
                setError('Google login failed. Please try again');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md px-4">
            {/* Floating decoration elements */}
            <div className="absolute top-20 left-10 w-24 h-24 sm:w-32 sm:h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 sm:w-40 sm:h-40 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>

            <div className="relative bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>

                {/* Content */}
                <div className="relative z-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-br from-blue-600 to-cyan-600 mb-6 shadow-lg">
                            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                            Sign in to continue to Architext
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 flex items-start gap-3 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700 dark:text-red-300">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="group w-full py-3.5 mb-6 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Chrome size={16} className="text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                            Continue with Google
                        </span>
                        <ArrowRight
                            size={16}
                            className="text-blue-600 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300"
                        />
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-linear-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                        <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium px-2">
                            or continue with email
                        </span>
                        <div className="flex-1 h-px bg-linear-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors"
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-all text-sm sm:text-base"
                                    placeholder="you@example.com"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Password
                                </label>
                                <a
                                    href="#"
                                    className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-bold hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline transition-colors"
                                >
                                    Forgot?
                                </a>
                            </div>
                            <div className="relative group">
                                <Lock
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors"
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-all text-sm sm:text-base"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group w-full py-3.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight
                                        size={18}
                                        className="group-hover:translate-x-1 transition-transform"
                                    />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t-2 border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                            Don't have an account?{' '}
                            <a
                                href="/register"
                                className="text-blue-600 dark:text-blue-400 font-bold hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline inline-flex items-center gap-1 group transition-colors"
                            >
                                Create one free
                                <ArrowRight
                                    size={14}
                                    className="group-hover:translate-x-0.5 transition-transform"
                                />
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom text */}
            <p className="text-center mt-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Protected by enterprise-grade security
            </p>
        </div>
    );
}
