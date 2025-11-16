'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { usePathname } from 'next/navigation';
import { X, Cookie } from 'lucide-react';

export default function CookieBanner() {
    const pathname = usePathname();
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Only show banner if user is on homepage and hasn't accepted yet
        const accepted = localStorage.getItem('cookiesAccepted');
        if (pathname === '/' && !accepted) {
            // Add slight delay for polished appearance
            const timer = setTimeout(() => setShow(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [pathname]);

    const acceptCookies = () => {
        localStorage.setItem('cookiesAccepted', 'true');
        setShow(false);
    };

    const declineCookies = () => {
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-3xl mx-auto bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-4 sm:p-6 z-50 animate-in slide-in-from-bottom-5">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Icon */}
                <div className="hidden sm:flex w-12 h-12 rounded-xl bg-primary/10 items-center justify-center flex-shrink-0">
                    <Cookie className="w-6 h-6 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">
                        We value your privacy
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
                        We use cookies to improve your experience and analyze
                        site traffic. Read our{' '}
                        <Link
                            href="/cookie-policy"
                            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                        >
                            Cookie Policy
                        </Link>{' '}
                        to learn more.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        onClick={acceptCookies}
                        className="flex-1 sm:flex-initial bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all text-sm"
                        size="sm"
                    >
                        Accept All
                    </Button>
                    <Button
                        onClick={declineCookies}
                        variant="ghost"
                        size="sm"
                        className="flex-1 sm:flex-initial text-sm"
                    >
                        Decline
                    </Button>
                    <button
                        onClick={declineCookies}
                        className="hidden sm:block text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2"
                        aria-label="Close banner"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
