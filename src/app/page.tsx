import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    BrainIcon,
    ChartNoAxesCombinedIcon,
    CheckCircleIcon,
    FileTextIcon,
    ImageIcon,
    SparklesIcon,
    TableIcon,
    UploadIcon,
    ZapIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
    const sectionOneBenefits = [
        'Save hours of manual slide preparation',
        'Maintain academic rigor and accuracy',
        'Create consistent, professional materials',
        'Focus on teaching, not formatting',
    ];

    const features = [
        {
            icon: BrainIcon,
            title: 'AI-Powered Analysis',
            description:
                'Advanced machine learning extracts key insights from academic papers',
        },
        {
            icon: FileTextIcon,
            title: 'Smart Summarization',
            description:
                'Automatically generates concise summaries for each section',
        },
        {
            icon: ImageIcon,
            title: 'Visual Extraction',
            description:
                'Identifies and extracts all figures, charts, and diagrams',
        },
        {
            icon: TableIcon,
            title: 'Data Tables',
            description:
                'Preserves complex tables and data structures perfectly',
        },
    ];

    return (
        <main className="w-full overflow-x-hidden">
            {/* Hero Section */}
            <section className="w-full bg-gradient-offwhite-pink-blue relative min-h-screen flex items-center">
                {/* Floating Decorative Elements */}
                <div className="absolute top-10 left-5 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-5 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full">
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                        {/* Hero Text */}
                        <div className="flex-1 w-full text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-linear-to-r from-blue-600 to-cyan-600 text-white rounded-full text-sm sm:text-base font-bold border-2 border-white shadow-xl">
                                <SparklesIcon size={18} />
                                <p>AI Powered Teaching Assistant</p>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900 dark:text-gray-100">
                                Turn Research into{' '}
                                <span className="gradient-text">
                                    Ready-to-Teach Slides
                                </span>{' '}
                                — Instantly.
                            </h1>

                            <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 font-medium mb-8 max-w-2xl mx-auto lg:mx-0">
                                Architext uses advanced AI to transform academic
                                PDFs into structured, beautiful teaching
                                materials. Save time, maintain quality, and
                                focus on what matters — inspiring your students.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-md mx-auto lg:mx-0">
                                <Link href="/register" className="flex-1">
                                    <Button
                                        size="lg"
                                        className="w-full shadow-xl text-base sm:text-lg bg-linear-to-r from-blue-600 to-cyan-600 hover:shadow-2xl transition-all font-bold text-white"
                                    >
                                        <UploadIcon size={20} />
                                        Get Started
                                    </Button>
                                </Link>
                                <Link href="/about-us" className="flex-1">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full text-base sm:text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border-2 border-gray-300 dark:border-gray-600 font-bold"
                                    >
                                        <ZapIcon size={20} />
                                        Learn More
                                    </Button>
                                </Link>
                            </div>

                            <div className="space-y-3 max-w-md mx-auto lg:mx-0">
                                {sectionOneBenefits.map((benefit, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 text-left"
                                    >
                                        <CheckCircleIcon
                                            size={20}
                                            className="text-blue-600 flex-shrink-0"
                                        />
                                        <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
                                            {benefit}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hero UI Card */}
                        <div className="flex-1 w-full max-w-lg lg:max-w-none mt-8 lg:mt-0">
                            <div className="relative w-full p-6 sm:p-8 rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-2xl">
                                {/* Inner Upload Card */}
                                <div className="w-full border-2 border-dashed border-blue-600 rounded-xl h-48 sm:h-56 lg:h-64 flex flex-col justify-center items-center bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-cyan-500/5 pointer-events-none"></div>

                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg animate-bounce-slow mb-4">
                                            <UploadIcon
                                                size={28}
                                                className="text-white"
                                            />
                                        </div>
                                        <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                                            Drop your PDF here
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                                            or click to upload
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Stages */}
                                <div className="space-y-3 mt-6">
                                    {[
                                        {
                                            icon: FileTextIcon,
                                            text: 'Extracting text...',
                                            value: 100,
                                            color: 'blue',
                                        },
                                        {
                                            icon: ChartNoAxesCombinedIcon,
                                            text: 'Processing content...',
                                            value: 65,
                                            color: 'cyan',
                                        },
                                        {
                                            icon: TableIcon,
                                            text: 'Analyzing tables...',
                                            value: 40,
                                            color: 'blue',
                                        },
                                    ].map((stage, i) => (
                                        <div
                                            key={i}
                                            className={`flex items-center gap-3 p-3 bg-${stage.color}-100 dark:bg-${stage.color}-900/20 rounded-lg border-2 border-${stage.color}-200 dark:border-${stage.color}-800`}
                                        >
                                            <stage.icon
                                                size={20}
                                                className={`text-${stage.color}-600 dark:text-${stage.color}-400 flex-shrink-0`}
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold mb-1 text-gray-900 dark:text-gray-100">
                                                    {stage.text}
                                                </p>
                                                <Progress
                                                    value={stage.value}
                                                    className="h-2"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Floating Icons */}
                                <div className="absolute -top-4 -right-4 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-linear-to-br from-cyan-600 to-blue-600 rounded-2xl shadow-xl animate-bounce-rotate border-2 border-white dark:border-gray-800">
                                    <SparklesIcon
                                        size={24}
                                        className="text-white"
                                    />
                                </div>
                                <div className="absolute -bottom-4 -left-4 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-linear-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-xl animate-bounce-rotate border-2 border-white dark:border-gray-800">
                                    <BrainIcon
                                        size={24}
                                        className="text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="w-full bg-white dark:bg-gray-950 py-16 sm:py-20 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-4">
                            Powerful Features for Modern Educators
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
                            Everything you need to transform research into
                            engaging teaching materials
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group p-6 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300"
                            >
                                <div className="w-14 h-14 flex items-center justify-center bg-linear-to-br from-blue-600 to-cyan-600 rounded-xl mb-4 group-hover:scale-110 transition-transform shadow-lg">
                                    <feature.icon
                                        size={28}
                                        className="text-white"
                                    />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                                    {feature.title}
                                </h3>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
