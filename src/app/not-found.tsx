import Link from 'next/link';
import { ArrowRight, Sparkles, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-offwhite-pink-blue relative overflow-hidden">
            {/* Floating decoration elements */}
            <div className="absolute top-10 left-5 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-5 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>

            {/* Main card */}
            <div className="relative max-w-md w-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 text-center overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center">
                    {/* Header Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-br from-blue-600 to-cyan-600 mb-6 shadow-lg animate-pulse">
                        <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>

                    {/* Error Text */}
                    <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold gradient-text mb-4">
                        404
                    </h1>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg mb-8 max-w-sm">
                        Oops! The page you're looking for seems to have wandered
                        off into the AI void.
                    </p>

                    {/* Back to Home Button */}
                    <Link
                        href="/"
                        className="group inline-flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-cyan-600 text-white font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 w-full sm:w-auto"
                    >
                        <Home size={20} />
                        <span>Back to Home</span>
                        <ArrowRight
                            size={18}
                            className="group-hover:translate-x-1 transition-transform"
                        />
                    </Link>
                </div>
            </div>

            {/* Bottom text */}
            <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400 px-4">
                Need help? Contact us at{' '}
                <a
                    href="mailto:support@architext.com"
                    className="text-blue-600 dark:text-blue-400 font-bold hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline"
                >
                    support@architext.com
                </a>
            </p>
        </div>
    );
}
