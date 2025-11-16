import React from 'react';
import {
    Shield,
    FileText,
    Lock,
    AlertCircle,
    Scale,
    RefreshCw,
    ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

export default function TermsOfService() {
    const sections = [
        {
            icon: FileText,
            title: '1. Eligibility',
            content:
                'Users must be at least 18 years old or enrolled in an academic institution to use this platform.',
        },
        {
            icon: Lock,
            title: '2. User Accounts',
            content:
                'Registration is required via Google or Email/Password. Users are responsible for safeguarding their login credentials.',
        },
        {
            icon: Shield,
            title: '3. Acceptable Use',
            content:
                'Users may only upload PDFs they have rights to and must not misuse the platform (spam, malware, reverse engineering AI).',
        },
        {
            icon: Scale,
            title: '4. Intellectual Property',
            content:
                'Architext owns the platform and its content. Users retain ownership of their uploaded PDFs.',
        },
        {
            icon: AlertCircle,
            title: '5. Limitation of Liability',
            content:
                'Architext is not liable for errors in AI summarization, downtime, or any indirect consequences of using the platform.',
        },
        {
            icon: RefreshCw,
            title: '6. Changes',
            content:
                'Terms may be updated periodically. Users will be notified of material changes.',
        },
    ];

    return (
        <main className="w-screen min-h-screen bg-gradient-offwhite-pink-blue px-4 py-16">
            {/* Floating decoration elements */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>

            <div className="max-w-5xl mx-auto relative">
                {/* Back Button */}
                <Link
                    href="/register"
                    className="inline-flex items-center gap-2 mb-6 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group font-semibold"
                >
                    <ArrowLeft
                        size={20}
                        className="group-hover:-translate-x-1 transition-transform"
                    />
                    <span>Back to Register</span>
                </Link>

                <div className="relative bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-10 space-y-8 overflow-hidden">
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>

                    {/* Content */}
                    <div className="relative z-10">
                        {/* Header */}
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 mb-4 shadow-lg">
                                <Scale className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-5xl font-bold gradient-text mb-4">
                                Terms of Service
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
                                Welcome to Architext! By using our platform to
                                convert research PDFs into slides, you agree to
                                these Terms of Service.
                            </p>
                        </div>

                        {/* Sections Grid */}
                        <div className="space-y-6">
                            {sections.map((section, index) => {
                                const Icon = section.icon;
                                return (
                                    <div
                                        key={index}
                                        className="group p-6 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                                                    {section.title}
                                                </h2>
                                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                    {section.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="mt-10 pt-6 border-t-2 border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                Last updated: November 2025
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                Questions? Contact us at{' '}
                                <a
                                    href="mailto:support@architext.com"
                                    className="text-blue-600 dark:text-blue-400 font-bold hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline transition-colors"
                                >
                                    support@architext.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
