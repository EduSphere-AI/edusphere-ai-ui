import Link from 'next/link';
import { Cookie, ArrowLeft, Settings, Database, Shield } from 'lucide-react';

export default function CookiePolicyPage() {
    return (
        <div className="w-full min-h-screen bg-gradient-offwhite-pink-blue px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative overflow-hidden">
            {/* Floating decoration elements */}
            <div className="absolute top-10 left-5 w-24 h-24 sm:w-32 sm:h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-5 w-32 h-32 sm:w-40 sm:h-40 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>

            <div className="relative max-w-4xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 mb-8 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group font-semibold"
                >
                    <ArrowLeft
                        size={20}
                        className="group-hover:-translate-x-1 transition-transform"
                    />
                    <span>Back to Home</span>
                </Link>

                <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 space-y-8 overflow-hidden">
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 to-cyan-600 mb-4 shadow-lg">
                                <Cookie className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-4">
                                Cookie Policy
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto font-medium">
                                This Cookie Policy explains how{' '}
                                <strong>Edusphere AI</strong> uses cookies when
                                you access or use our website.
                            </p>
                        </div>

                        {/* Sections */}
                        <div className="space-y-6">
                            {/* What are Cookies */}
                            <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                        <Cookie className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                                            What are Cookies?
                                        </h2>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                                            Cookies are small text files stored
                                            on your device to help improve your
                                            experience, remember preferences,
                                            and enable basic functionality.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* How We Use Cookies */}
                            <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-400 dark:hover:border-cyan-600 transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-cyan-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                        <Database className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                                            How We Use Cookies
                                        </h2>
                                        <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-600 mt-1 font-bold">
                                                    •
                                                </span>
                                                <span>
                                                    Firebase Authentication may
                                                    set cookies to keep you
                                                    logged in.
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-600 mt-1 font-bold">
                                                    •
                                                </span>
                                                <span>
                                                    Analytics cookies may be
                                                    used to understand usage
                                                    patterns (optional,
                                                    depending on your setup).
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-600 mt-1 font-bold">
                                                    •
                                                </span>
                                                <span>
                                                    No third-party tracking
                                                    cookies are set by default.
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Managing Cookies */}
                            <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                        <Settings className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                                            Managing Cookies
                                        </h2>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                                            You can manage or disable cookies
                                            via your browser settings. Note that
                                            disabling cookies may affect
                                            functionality, such as staying
                                            signed in.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-400 dark:hover:border-cyan-600 transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-cyan-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                                            Contact Us
                                        </h2>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                                            For questions about this policy,
                                            contact us at{' '}
                                            <a
                                                href="mailto:contact@edusphere.ai"
                                                className="text-blue-600 dark:text-blue-400 font-bold hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline transition-colors"
                                            >
                                                contact@edusphere.ai
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-10 pt-6 border-t-2 border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                Last updated: {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
