'use client';

import Link from 'next/link';
import { Button } from '../ui/button';
import { APP_NAME } from '@/lib/constants';
import { ArrowRight, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            logout();
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo / App Name */}
                <Link
                    className="text-xl sm:text-2xl font-bold gradient-text hover:opacity-80 transition-opacity"
                    href={'/'}
                >
                    {APP_NAME}
                </Link>

                {/* Navigation - Responsive with Flexbox */}
                <ul className="flex items-center gap-2 sm:gap-3 lg:gap-6">
                    {/* About Us - Hidden on smallest screens */}
                    <li className="hidden sm:block">
                        <Link href="/about-us">
                            <Button
                                variant="ghost"
                                className="text-sm sm:text-base"
                            >
                                About Us
                            </Button>
                        </Link>
                    </li>

                    {user ? (
                        <Fragment>
                            <li className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                                <User size={16} className="text-blue-600" />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    {user.name || user.email}
                                </span>
                            </li>

                            <li>
                                <Link href="/dashboard">
                                    <Button
                                        variant="outline"
                                        className="text-sm sm:text-base px-3 sm:px-4 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all font-semibold"
                                    >
                                        <LayoutDashboard
                                            size={16}
                                            className="mr-0 sm:mr-2"
                                        />
                                        <span className="hidden sm:inline">
                                            Dashboard
                                        </span>
                                    </Button>
                                </Link>
                            </li>

                            <li>
                                <Button
                                    onClick={handleLogout}
                                    variant="outline"
                                    className="text-sm sm:text-base px-3 sm:px-4 border-2 border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-700 transition-all font-semibold"
                                >
                                    <LogOut
                                        size={16}
                                        className="mr-0 sm:mr-2"
                                    />
                                    <span className="hidden sm:inline">
                                        Logout
                                    </span>
                                </Button>
                            </li>
                        </Fragment>
                    ) : (
                        <Fragment>
                            {/* Sign In */}
                            <li>
                                <Link href="/login">
                                    <Button
                                        variant="outline"
                                        className="text-sm sm:text-base px-3 sm:px-4 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all font-semibold"
                                    >
                                        Sign In
                                    </Button>
                                </Link>
                            </li>

                            <li>
                                <Link href="/register">
                                    <Button className="text-sm sm:text-base px-3 sm:px-4 bg-linear-to-r from-blue-600 to-cyan-600 hover:shadow-lg transition-all font-bold text-white">
                                        <span className="hidden sm:inline">
                                            Get Started
                                        </span>
                                        <span className="sm:hidden">Start</span>
                                        <ArrowRight
                                            className="ml-1 sm:ml-2 text-white"
                                            size={16}
                                        />
                                    </Button>
                                </Link>
                            </li>
                        </Fragment>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
