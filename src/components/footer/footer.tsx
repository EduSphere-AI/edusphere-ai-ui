import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full bg-card/80 backdrop-blur-xl border-t border-border/50 py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 mt-20 relative overflow-hidden">
            {/* Background blurred shapes */}
            <div className="absolute top-0 left-0 w-32 h-32 sm:w-40 sm:h-40 bg-primary/10 rounded-full blur-3xl animate-pulse -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 sm:w-48 sm:h-48 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700 translate-y-1/2"></div>

            <div className="relative max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8">
                    {/* Branding */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold gradient-text">
                                Edusphere AI
                            </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4">
                            Transform research papers into engaging
                            micro-courses with the power of AI.
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm">
                            &copy; {new Date().getFullYear()} Edusphere AI. All
                            rights reserved.
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <div>
                        <h3 className="text-lg font-bold text-foreground mb-4">
                            Navigation
                        </h3>
                        <ul className="space-y-3 text-sm sm:text-base">
                            <li>
                                <Link
                                    href="/about-us"
                                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                                >
                                    About Us
                                    <ArrowRight
                                        size={14}
                                        className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all"
                                    />
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms-of-service"
                                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                                >
                                    Terms of Service
                                    <ArrowRight
                                        size={14}
                                        className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all"
                                    />
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy-policy"
                                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                                >
                                    Privacy Policy
                                    <ArrowRight
                                        size={14}
                                        className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all"
                                    />
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/cookie-policy"
                                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                                >
                                    Cookie Policy
                                    <ArrowRight
                                        size={14}
                                        className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all"
                                    />
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Account Actions */}
                    <div>
                        <h3 className="text-lg font-bold text-foreground mb-4">
                            Account
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/login" className="block">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-center text-sm sm:text-base"
                                    >
                                        Sign In
                                    </Button>
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="block">
                                    <Button className="w-full justify-center text-sm sm:text-base bg-linear-to-r from-primary to-accent hover:shadow-lg transition-all">
                                        Get Started
                                        <ArrowRight
                                            className="ml-2"
                                            size={16}
                                        />
                                    </Button>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-bold text-foreground mb-4">
                            Contact
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-3">
                            Have questions? Get in touch!
                        </p>
                        <a
                            href="mailto:contact@edusphere.ai"
                            className="text-blue-600 dark:text-blue-400 font-semibold hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline transition-colors text-sm sm:text-base inline-flex items-center gap-1"
                        >
                            contact@edusphere.ai
                        </a>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border/50 text-center">
                    <p className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm">
                        Made with ❤️ for educators worldwide
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
