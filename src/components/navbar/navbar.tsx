import Link from 'next/link';
import { Button } from '../ui/button';
import { APP_NAME } from '@/lib/constants';
import { ArrowRight } from 'lucide-react';

const Navbar = () => {
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

                    {/* Sign In */}
                    <li>
                        <Link href="/login">
                            <Button
                                variant="outline"
                                className="text-sm sm:text-base px-3 sm:px-4"
                            >
                                Sign In
                            </Button>
                        </Link>
                    </li>

                    {/* Get Started */}
                    <li>
                        <Link href="/register">
                            <Button className="text-sm sm:text-base px-3 sm:px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg transition-all font-bold text-white">
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
