'use client';

import Link from 'next/link';
import { Button } from '../ui/button';
import { APP_NAME } from '@/lib/constants';
import { ArrowRight, LogOut, LayoutDashboard, User } from 'lucide-react';
// import { useAuthStore } from '@/store/auth.store'; // Removed
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react';

const Navbar = () => {
    // const { user, logout } = useAuthStore(); // Auth removed
    const router = useRouter();

    /*const handleLogout = async () => {
        try {
            await signOut(auth);
            logout();
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };*/

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

                    {/* Always show Dashboard link since it's public now */}
                    <li>
                        <Link href="/dashboard">
                            <Button
                                variant="ghost"
                                className="text-sm sm:text-base font-semibold"
                            >
                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                Dashboard
                            </Button>
                        </Link>
                    </li>

                    {/* Get Started Button - Goes to Dashboard */}
                    <li>
                        <Link href="/dashboard">
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
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
