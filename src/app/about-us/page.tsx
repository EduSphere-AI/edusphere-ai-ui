import {
    Users,
    Target,
    Lightbulb,
    Workflow,
    TrendingUp,
    Mail,
    ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

const teamMembers = [
    { name: 'Alireza Sehrapour', role: 'Data Preparation and Summarization' },
    { name: 'Zahra Booeshagh', role: 'Data Preparation and Summarization' },
    { name: 'Parinaz Teimouri', role: 'Data Preparation and Summarization' },
    { name: 'Sarthak Bharad', role: 'Interface and Backend' },
    { name: 'Siddhant Dalvi', role: 'Interface and Backend' },
];

export default function AboutUsPage() {
    return (
        <div className="w-full min-h-screen bg-gradient-offwhite-pink-blue px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative overflow-hidden">
            {/* Blurred background circles */}
            <div className="absolute top-10 left-5 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-5 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>

            <div className="relative max-w-6xl mx-auto">
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

                <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-12 space-y-12 sm:space-y-16 overflow-hidden">
                    {/* Mission */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text">
                                Our Mission
                            </h1>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed font-medium">
                            Edusphere AI is designed to help teachers and
                            students by transforming long, complex research
                            papers into clear, concise micro-courses. Our goal
                            is to make education faster, more engaging, and
                            accessible globally. Edusphere AI turns dense
                            research papers into interactive, digestible
                            micro-courses. Key arguments are highlighted, and
                            supporting data is presented clearly.
                        </p>
                    </section>

                    {/* Team */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text">
                                Meet the Team
                            </h2>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg mb-8 font-medium">
                            Our team combines deep AI expertise with robust
                            backend and interface development.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teamMembers.map((member) => (
                                <div
                                    key={member.name}
                                    className="group p-6 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-center"
                                >
                                    <div className="h-20 w-20 mx-auto mb-4 bg-linear-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
                                        {member.name[0]}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                                        {member.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                        {member.role}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Project Challenges */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                                <Lightbulb className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text">
                                Project Challenges
                            </h2>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-6 text-base sm:text-lg font-medium">
                            Our research revealed three major problems that
                            Edusphere AI addresses:
                        </p>
                        <div className="space-y-4">
                            {[
                                {
                                    title: 'Time-Consuming Preparation',
                                    desc: 'Teachers often spend hours summarizing research papers, reducing time for teaching and student engagement.',
                                },
                                {
                                    title: 'Inaccessible Insights',
                                    desc: 'Complex academic language makes it hard for students to grasp essential knowledge, lowering engagement.',
                                },
                                {
                                    title: 'Inefficient Conversion',
                                    desc: 'Manual conversion of PDFs into slides is slow, error-prone, and hard to scale.',
                                },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700"
                                >
                                    <p className="text-base sm:text-lg">
                                        <strong className="text-gray-900 dark:text-gray-100">
                                            {item.title}:
                                        </strong>{' '}
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {item.desc}
                                        </span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Project Overview */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg">
                                <Workflow className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text">
                                Project Overview
                            </h2>
                        </div>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed font-medium">
                            <p>
                                Edusphere AI is a sophisticated Python-based
                                application that intelligently transforms
                                research papers into structured micro-courses.
                                Our AI pipeline extracts text, graphics, charts,
                                and tables, then summarizes this content into
                                slide-ready course sections.
                            </p>
                            <p>
                                The system is multilingual, allowing students
                                and educators worldwide to access research
                                materials. A clean, intuitive interface ensures
                                that structured content is easily managed and
                                accessible.
                            </p>
                        </div>
                    </section>

                    {/* Main Objectives */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text">
                                Main Objectives
                            </h2>
                        </div>
                        <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-base sm:text-lg font-medium">
                            {[
                                'Seamlessly extract data from PDFs, including text, graphics, and tables.',
                                'Intelligently structure the extracted content for clarity and coherence.',
                                'Generate concise, meaningful summaries for each course section.',
                                'Store all standardized data in a robust, scalable database.',
                                'Display structured content on a user-friendly interface for educators and students.',
                            ].map((obj, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                                        <span className="text-white font-bold text-sm">
                                            {i + 1}
                                        </span>
                                    </div>
                                    <span>{obj}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Contact */}
                    <section className="pt-8 border-t-2 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text">
                                Contact Us
                            </h2>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg font-medium">
                            Have questions or want to collaborate? Reach out at:{' '}
                            <a
                                href="mailto:contact@edusphere.ai"
                                className="text-blue-600 dark:text-blue-400 font-bold hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline transition-colors inline-flex items-center gap-2"
                            >
                                contact@edusphere.ai
                                <Mail size={18} />
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
