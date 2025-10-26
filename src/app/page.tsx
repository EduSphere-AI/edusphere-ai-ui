import { Badge } from '@/components/ui/badge';
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
        <main className="w-screen" id="main">
            <section
                id="section-one"
                className="w-full bg-gradient-offwhite-pink-blue"
            >
                <div id="section-one-container" className="w-full px-4 py-16">
                    <div id="hero-text" className="w-full">
                        <div
                            id="custom-badge"
                            className="flex items-center gap-2 mb-4 mt-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-full w-fit text-base font-medium border-[0.5px] border-primary-foreground"
                        >
                            <SparklesIcon size={16} />
                            <p>AI Powered Teaching Assistant</p>
                        </div>
                        <h3 className="mt-6 text-5xl font-bold leading-tight">
                            Turn Research into{' '}
                            <span className="gradient-text">
                                Ready-to-Teach Slides
                            </span>{' '}
                            — Instantly.
                        </h3>
                        <p className="mt-4 text-xl text-muted-foreground font-medium">
                            Architext uses advanced AI to transform academic
                            PDFs into structured, beautiful teaching materials.
                            Save time, maintain quality, and focus on what
                            matters — inspiring your students.
                        </p>
                        <div className="flex flex-col gap-4 mt-8">
                            <Button
                                size={'xl'}
                                className="shadow-2xl text-xl bg-linear-to-r from-primary to-accent"
                            >
                                <UploadIcon />
                                Get Started
                            </Button>
                            <Button
                                size={'xl'}
                                variant={'outline'}
                                className="text-xl"
                            >
                                <ZapIcon />
                                How It Works
                            </Button>
                        </div>
                        <div className="mt-8 space-y-2">
                            {sectionOneBenefits.map((benefit, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2"
                                >
                                    <CheckCircleIcon size={18} />
                                    <p>{benefit}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div id="hero-ui" className="w-1/2">
                        <div
                            id="card"
                            className="w-full p-8 rounded-lg bg-muted flex flex-col gap-4 relative"
                        >
                            <div
                                id="inner-card"
                                className="w-full border border-dotted border-blue-600 flex flex-col rounded-lg h-[30vh] relative"
                            >
                                <div className="w-full h-1/2 absolute top-1/2 flex flex-col justify-center items-center">
                                    <div
                                        id="upload-icon-card"
                                        className="w-1/6 aspect-square rounded-2xl absolute top-[-50%] flex items-center justify-center bg-blue-100 shadow-lg animate-bounce-slow"
                                    >
                                        <UploadIcon
                                            size={32}
                                            className="text-blue-600"
                                        />
                                    </div>
                                    <p className="text-lg">
                                        Drop your PDF here
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        or click to upload
                                    </p>
                                </div>
                            </div>
                            <div
                                id="extraction-stage"
                                className="w-full flex items-center gap-2 p-2 bg-blue-300 rounded"
                            >
                                <FileTextIcon size={22} />
                                <div
                                    id="stage-info"
                                    className="flex-1 flex flex-col items-start"
                                >
                                    <p>Extracting text...</p>
                                    <Progress value={100} />
                                </div>
                            </div>
                            <div
                                id="processing-stage"
                                className="w-full flex items-center gap-2 p-2 bg-blue-300 rounded"
                            >
                                <ChartNoAxesCombinedIcon size={22} />
                                <div
                                    id="stage-info"
                                    className="flex-1 flex flex-col items-start"
                                >
                                    <p>Processing content...</p>
                                    <Progress value={65} />
                                </div>
                            </div>
                            <div
                                id="analyzing-stage"
                                className="w-full flex items-center gap-2 p-2 bg-blue-300 rounded"
                            >
                                <TableIcon size={22} />
                                <div
                                    id="stage-info"
                                    className="flex-1 flex flex-col items-start"
                                >
                                    <p>Analyzing tables...</p>
                                    <Progress value={40} />
                                </div>
                            </div>
                            <div
                                id="icon-bounce-container"
                                className="absolute top-0 left-full -translate-1/2 w-18 h-18 flex items-center justify-center bg-white rounded-2xl shadow-lg animate-bounce-rotate"
                            >
                                <SparklesIcon
                                    size={32}
                                    className="text-blue-600"
                                />
                            </div>
                            <div
                                id="icon-bounce-container"
                                className="absolute top-full left-0 -translate-1/2 w-18 h-18 flex items-center justify-center bg-white rounded-2xl shadow-lg animate-bounce-rotate"
                            >
                                <BrainIcon
                                    size={32}
                                    className="text-blue-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section id="section-two" className="w-full">
                <div
                    id="container"
                    className="w-10/12 mx-auto py-20 text-center"
                >
                    <h2 className="text-4xl font-bold text-gray-800">
                        Powerful Features for Modern Educators
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Everything you need to transform research into engaging
                        teaching materials
                    </p>
                    <div
                        id="features-grid"
                        className="mt-12 flex flex-wrap gap-8"
                    >
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
                            >
                                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-md mb-4">
                                    <feature.icon
                                        size={24}
                                        className="text-blue-600"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
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
