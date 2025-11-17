import React from 'react';
import {
    ShieldCheck,
    Database,
    Share2,
    Lock,
    UserCheck,
    ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
    const sections = [
        {
            icon: Database,
            title: '1. Information We Collect',
            content:
                'We collect email, name (from Google or email signup), and any PDFs you upload for slide generation. Usage analytics may also be collected.',
        },
        {
            icon: UserCheck,
            title: '2. How We Use Your Data',
            content:
                'Data is used to provide the PDF-to-slide service, communicate updates, and improve platform functionality.',
        },
        {
            icon: Share2,
            title: '3. Data Sharing',
            content:
                'We do not sell or share your personal data. Firebase services are used to store authentication info and PDFs securely.',
        },
        {
            icon: Lock,
            title: '4. Data Security',
            content:
                'All data is stored securely using Firebase. We use HTTPS and encrypted storage to protect user information.',
        },
        {
            icon: ShieldCheck,
            title: '5. User Rights',
            content:
                'Users can delete their account and request deletion of uploaded data at any time by contacting support.',
        },
    ];

    return (
        <main className="w-screen min-h-screen bg-gradient-offwhite-pink-blue px-4 py-16">
            {/* Floating decoration elements */}
            <div className="absolute top-20 right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>

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
                    <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>

                    {/* Content */}
                    <div className="relative z-10">
                        {/* Header */}
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-cyan-600 to-blue-600 mb-4 shadow-lg">
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-5xl font-bold gradient-text mb-4">
                                Privacy Policy
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
                                Your privacy is important to us. This policy
                                explains what data we collect and how we use it.
                            </p>
                        </div>

                        {/* Sections Grid */}
                        <div className="space-y-6">
                            {sections.map((section, index) => {
                                const Icon = section.icon;
                                return (
                                    <div
                                        key={index}
                                        className="group p-6 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-400 dark:hover:border-cyan-600 transition-all duration-300 hover:shadow-lg"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-linear-to-br from-cyan-600 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
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

                        {/* Highlight Box */}
                        <div className="mt-8 p-6 rounded-xl bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                                        Your Data, Your Control
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                        We believe in transparency and user
                                        control. You can export or delete your
                                        data at any time. We never sell your
                                        information to third parties.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-10 pt-6 border-t-2 border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                Last updated: November 2025
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                Privacy concerns? Contact us at{' '}
                                <a
                                    href="mailto:privacy@architext.com"
                                    className="text-blue-600 dark:text-blue-400 font-bold hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline transition-colors"
                                >
                                    privacy@architext.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
