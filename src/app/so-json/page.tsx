'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

// Content element types that backend can send
type ContentType = 'h1' | 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'text';

interface ContentElement {
    type: ContentType;
    content: string | string[]; // string for text/headers, array for lists
    style?: 'bold' | 'italic' | 'highlight'; // optional styling
}

interface Slide {
    slideTitle: string;
    elements: ContentElement[];
}

interface Question {
    question: string;
    options: string[];
    correctAnswer?: number;
}

interface Chapter {
    chapterTitle: string;
    slides: Slide[];
    questionnaire: Question[];
}

// Component to render individual content elements
const ContentRenderer = ({ element }: { element: ContentElement }) => {
    const { type, content, style } = element;

    // Apply styling classes
    const getStyleClass = () => {
        if (style === 'bold') return 'font-bold text-blue-600 dark:text-blue-400';
        if (style === 'italic') return 'italic';
        if (style === 'highlight') return 'bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded';
        return '';
    };

    switch (type) {
        case 'h1':
            return (
                <h1 className={`text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 ${getStyleClass()}`}>
                    {content as string}
                </h1>
            );
        
        case 'h2':
            return (
                <h2 className={`text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 ${getStyleClass()}`}>
                    {content as string}
                </h2>
            );
        
        case 'h3':
            return (
                <h3 className={`text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-3 ${getStyleClass()}`}>
                    {content as string}
                </h3>
            );
        
        case 'p':
        case 'text':
            return (
                <p className={`text-gray-700 dark:text-gray-300 mb-4 leading-relaxed ${getStyleClass()}`}>
                    {content as string}
                </p>
            );
        
        case 'ul':
            return (
                <ul className="space-y-2 mb-4">
                    {(content as string[]).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            );
        
        case 'ol':
            return (
                <ol className="space-y-2 mb-4 list-decimal list-inside">
                    {(content as string[]).map((item, idx) => (
                        <li key={idx} className="text-gray-700 dark:text-gray-300 ml-2">
                            {item}
                        </li>
                    ))}
                </ol>
            );
        
        default:
            return null;
    }
};

/**
 * MOCK DATA - Replace with API call
 * Backend should return this JSON structure
 */
const mockSlidesData: Chapter[] = [
    {
        chapterTitle: 'Introduction to Machine Learning',
        slides: [
            {
                slideTitle: 'What is Machine Learning?',
                elements: [
                    {
                        type: 'p',
                        content: 'Machine Learning is a subset of Artificial Intelligence that enables systems to learn and improve from experience without being explicitly programmed.',
                    },
                    {
                        type: 'h3',
                        content: 'Key Characteristics:',
                    },
                    {
                        type: 'ul',
                        content: [
                            'Systems that learn from data',
                            'Improve performance over time',
                            'Automatic pattern recognition',
                        ],
                    },
                ],
            },
            {
                slideTitle: 'Why Machine Learning Matters',
                elements: [
                    {
                        type: 'p',
                        content: 'Machine Learning has transformed how we approach problems in various domains.',
                    },
                    {
                        type: 'h3',
                        content: 'Applications:',
                    },
                    {
                        type: 'ul',
                        content: [
                            'Automation of decision making',
                            'Handling large-scale data',
                            'Real-world applications in healthcare, finance, and more',
                        ],
                    },
                    {
                        type: 'h3',
                        content: 'Impact:',
                    },
                    {
                        type: 'ol',
                        content: [
                            'Increased efficiency',
                            'Better predictions',
                            'Personalized experiences',
                        ],
                    },
                ],
            },
        ],
        questionnaire: [
            {
                question: 'Machine Learning is a subset of which field?',
                options: ['Databases', 'Artificial Intelligence', 'Networking', 'Cloud Computing'],
                correctAnswer: 1,
            },
            {
                question: 'What enables ML systems to improve?',
                options: ['Hard-coded rules', 'Data and experience', 'Manual updates', 'Static algorithms'],
                correctAnswer: 1,
            },
        ],
    },
    {
        chapterTitle: 'Supervised Learning',
        slides: [
            {
                slideTitle: 'Definition of Supervised Learning',
                elements: [
                    {
                        type: 'p',
                        content: 'Supervised learning is a type of machine learning where the model is trained on labeled data.',
                    },
                    {
                        type: 'h3',
                        content: 'Characteristics:',
                    },
                    {
                        type: 'ul',
                        content: [
                            'Uses labeled datasets',
                            'Predicts known outputs',
                            'Common in classification and regression',
                        ],
                    },
                ],
            },
            {
                slideTitle: 'Types of Supervised Learning',
                elements: [
                    {
                        type: 'h3',
                        content: '1. Classification',
                    },
                    {
                        type: 'ul',
                        content: [
                            'Categorizes data into predefined classes',
                            'Example: Email spam detection',
                        ],
                    },
                    {
                        type: 'h3',
                        content: '2. Regression',
                    },
                    {
                        type: 'ul',
                        content: [
                            'Predicts continuous values',
                            'Example: House price prediction',
                        ],
                    },
                ],
            },
        ],
        questionnaire: [
            {
                question: 'Supervised learning requires:',
                options: ['Unlabeled data', 'Labeled data', 'No data', 'Random data'],
                correctAnswer: 1,
            },
            {
                question: 'Which is an example of classification?',
                options: ['Stock price prediction', 'Spam detection', 'Temperature forecasting', 'Sales prediction'],
                correctAnswer: 1,
            },
        ],
    },
];

export default function SlidesOutputJSONPage() {
    const searchParams = useSearchParams();
    const docId = searchParams.get('doc');
    
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchSlides = async () => {
            if (!docId) {
                setIsLoading(false);
                return;
            }

            try {
                // TODO: Replace with actual API call
                // const response = await fetch(`/api/slides/${docId}`);
                // const data = await response.json();
                // setChapters(data.chapters);
                
                // Mock delay to simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                setChapters(mockSlidesData);
            } catch (error) {
                console.error('Error fetching slides:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSlides();
    }, [docId]);

    const handleAnswerSelect = (chapterIndex: number, questionIndex: number, optionIndex: number) => {
        const key = `${chapterIndex}-${questionIndex}`;
        setSelectedAnswers(prev => ({
            ...prev,
            [key]: optionIndex,
        }));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-offwhite-pink-blue flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">Loading slides...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-offwhite-pink-blue relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-10 left-5 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-5 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10">
                {/* Page Header */}
                <div className="mb-8 sm:mb-12 space-y-2">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">
                        Slide Deck
                    </h1>
                    <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg font-medium">
                        Here are your generated slides with interactive questionnaires!
                    </p>
                </div>

                {/* Summary Card */}
                <Card className="mb-8 sm:mb-12 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
                    <CardHeader className="relative">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-linear-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg">
                                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl sm:text-2xl text-gray-900 dark:text-gray-100">
                                        Slide Deck Overview
                                    </CardTitle>
                                    <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                                        Complete learning materials with interactive elements
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Badge className="bg-linear-to-r from-blue-600 to-cyan-600 text-white text-sm px-4 py-2 shadow-lg">
                                    {chapters.length} Chapters
                                </Badge>
                                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-200 dark:border-green-800 text-sm px-4 py-2 shadow-md">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Ready
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Chapters */}
                <div className="space-y-8 sm:space-y-12">
                    {chapters.map((chapter, chapterIndex) => (
                        <Card
                            key={chapterIndex}
                            className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
                            
                            <CardHeader className="relative">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-linear-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg">
                                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                    </div>
                                    <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-800 text-sm px-3 py-1 shadow-md font-semibold">
                                        Chapter {chapterIndex + 1}
                                    </Badge>
                                </div>
                                <CardTitle className="text-2xl sm:text-3xl text-gray-900 dark:text-gray-100">
                                    {chapter.chapterTitle}
                                </CardTitle>
                                <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
                                    {chapter.slides.length} slides • {chapter.questionnaire.length} questions
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="relative space-y-6">
                                {/* Slides Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-1 w-12 bg-linear-to-r from-blue-600 to-cyan-600 rounded-full" />
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                                            Slides
                                        </h3>
                                    </div>
                                    
                                    {chapter.slides.map((slide, slideIndex) => (
                                        <Card
                                            key={slideIndex}
                                            className="border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10 shadow-lg hover:shadow-xl transition-all"
                                        >
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 flex items-center justify-center bg-linear-to-br from-blue-600 to-cyan-600 rounded-lg shadow-md flex-shrink-0 mt-1">
                                                        <span className="text-white text-sm font-bold">
                                                            {slideIndex + 1}
                                                        </span>
                                                    </div>
                                                    <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-gray-100 leading-tight">
                                                        {slide.slideTitle}
                                                    </CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    {slide.elements.map((element, elemIndex) => (
                                                        <ContentRenderer key={elemIndex} element={element} />
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <Separator className="my-8" />

                                {/* Questionnaire Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-1 w-12 bg-linear-to-r from-cyan-600 to-blue-600 rounded-full" />
                                        <Sparkles className="h-5 w-5 text-cyan-600" />
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                                            Chapter Questionnaire
                                        </h3>
                                    </div>

                                    {chapter.questionnaire.map((q, qIndex) => {
                                        const key = `${chapterIndex}-${qIndex}`;
                                        const selectedAnswer = selectedAnswers[key];
                                        
                                        return (
                                            <Card
                                                key={qIndex}
                                                className="border-2 border-cyan-200 dark:border-cyan-800 bg-gradient-to-br from-white to-cyan-50/30 dark:from-gray-800 dark:to-cyan-900/10 shadow-lg"
                                            >
                                                <CardContent className="space-y-4 pt-6">
                                                    <div className="flex items-start gap-3">
                                                        <Badge className="bg-linear-to-r from-cyan-600 to-blue-600 text-white text-sm px-3 py-1 shadow-md font-semibold flex-shrink-0">
                                                            Q{qIndex + 1}
                                                        </Badge>
                                                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                                                            {q.question}
                                                        </p>
                                                    </div>
                                                    <div className="grid gap-2 ml-0 sm:ml-12">
                                                        {q.options.map((opt, optIndex) => (
                                                            <Button
                                                                key={optIndex}
                                                                variant="outline"
                                                                onClick={() => handleAnswerSelect(chapterIndex, qIndex, optIndex)}
                                                                className={`justify-start border-2 transition-all font-medium text-sm sm:text-base text-left h-auto py-3 ${
                                                                    selectedAnswer === optIndex
                                                                        ? 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-500 dark:border-cyan-500'
                                                                        : 'border-gray-300 dark:border-gray-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:border-cyan-400 dark:hover:border-cyan-500'
                                                                }`}
                                                            >
                                                                <span className="mr-3 text-gray-500 dark:text-gray-400 font-semibold">
                                                                    {String.fromCharCode(65 + optIndex)}.
                                                                </span>
                                                                {opt}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 mt-8 sm:mt-12">
                    <Button
                        size="lg"
                        className="shadow-xl bg-linear-to-r from-blue-600 to-cyan-600 hover:shadow-2xl transition-all font-bold text-white"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export Slides
                    </Button>
                </div>
            </main>
        </div>
    );
}