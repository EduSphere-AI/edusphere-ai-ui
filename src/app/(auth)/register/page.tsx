'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import {
    User,
    Mail,
    Lock,
    Chrome,
    Sparkles,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuthStore();

    const router = useRouter();

    const passwordRequirements = [
        { met: password.length >= 6, text: 'At least 6 characters' },
        { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
        { met: /[0-9]/.test(password), text: 'One number' },
    ];

    const handleEmailRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password,
            );

            await updateProfile(userCredential.user, {
                displayName: name,
            });

            login({
                id: userCredential.user.uid,
                name: name,
                email: userCredential.user.email || '',
            });

            console.log('User registered:', userCredential.user);
            router.push('/dashboard');
        } catch (err: any) {
            console.error('Registration error:', err);

            switch (err.code) {
                case 'auth/email-already-in-use':
                    setError('An account with this email already exists');
                    break;
                case 'auth/invalid-email':
                    setError('Invalid email address');
                    break;
                case 'auth/weak-password':
                    setError('Password is too weak. Use at least 6 characters');
                    break;
                default:
                    setError('Registration failed. Please try again');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setError('');
        setLoading(true);

        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log('Google user registered:', result.user);
            login({
                id: result.user.uid,
                name: result.user.displayName || '',
                email: result.user.email || '',
            });
            router.push('/dashboard');
        } catch (err: any) {
            console.error('Google registration error:', err);

            if (err.code === 'auth/popup-closed-by-user') {
                setError('Google sign-in was cancelled');
            } else {
                setError('Google sign-in failed. Please try again');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md px-4">
            {/* Floating decoration elements */}
            <div className="absolute top-20 right-10 w-24 h-24 sm:w-32 sm:h-32 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-10 w-32 h-32 sm:w-40 sm:h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>

            <div className="relative bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>

                {/* Content */}
                <div className="relative z-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 mb-6 shadow-lg animate-pulse">
                            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                            Get Started
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                            Create your free Architext account
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

                    {/* Google Register Button */}
                    <button
                        onClick={handleGoogleRegister}
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
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                        <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium px-2">
                            or sign up with email
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailRegister} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                Full Name
                            </label>
                            <div className="relative group">
                                <User
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors"
                                />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-all text-sm sm:text-base"
                                    placeholder="John Doe"
                                    disabled={loading}
                                />
                            </div>
                        </div>

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
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                Password
                            </label>
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
                                    minLength={6}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-all text-sm sm:text-base"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                            </div>

                            {/* Password Requirements */}
                            {password && (
                                <div className="mt-3 space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                                    {passwordRequirements.map((req, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 text-xs sm:text-sm"
                                        >
                                            <CheckCircle2
                                                size={16}
                                                className={
                                                    req.met
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-gray-400'
                                                }
                                            />
                                            <span
                                                className={
                                                    req.met
                                                        ? 'text-gray-900 dark:text-gray-100 font-medium'
                                                        : 'text-gray-500 dark:text-gray-400'
                                                }
                                            >
                                                {req.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight
                                        size={18}
                                        className="group-hover:translate-x-1 transition-transform"
                                    />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Terms */}
                    <p className="mt-4 text-xs text-center text-gray-600 dark:text-gray-400">
                        By signing up, you agree to our{' '}
                        <Link
                            href="/terms-of-service"
                            className="text-blue-600 dark:text-blue-400 font-bold hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline transition-colors"
                        >
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link
                            href="/privacy-policy"
                            className="text-blue-600 dark:text-blue-400 font-bold hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline transition-colors"
                        >
                            Privacy Policy
                        </Link>
                    </p>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t-2 border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="text-blue-600 dark:text-blue-400 font-bold hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline inline-flex items-center gap-1 group transition-colors"
                            >
                                Sign in
                                <ArrowRight
                                    size={14}
                                    className="group-hover:translate-x-0.5 transition-transform"
                                />
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom text */}
            <p className="text-center mt-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Join thousands of educators worldwide
            </p>
        </div>
    );
}
