'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { listUserFiles } from '@/lib/supabase';
import { API_BASE_URL } from '@/lib/constants';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
    ArrowLeft,
    Download,
    Eye,
    FileText,
    FileType,
    Image as ImageIcon,
    Loader2,
    Presentation,
    MessageCircleQuestion,
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import mockPresentation from '@/output/generation/presentation.json';
import mockExtractionResult from '@/output/extraction/extraction_result.json';
import mockSummarizationResult from '@/output/summarization/summary_result.json';

// Types for our PDF document
interface PDFDocument {
    id: string;
    title: string;
    fileUrl: string;
    filePath: string;
    uploadDate: string;
}

interface Slide {
    slide_number: number;
    slide_title: string;
    content: any[];
    chapter?: number;
    subchapter?: string;
    chapter_main_title?: string;
    chapter_subtitle?: string;
}

interface Chapter {
    chapter_num: number;
    main_title: string;
    subtitle: string;
    slide_count: number;
    subchapters: string[];
    learn_controls: {
        [key: string]: string[];
    };
}

const formatText = (text: string) => {
    if (!text) return '';
    // Split by **bold** and _italic_
    const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('_') && part.endsWith('_')) {
            return <em key={index}>{part.slice(1, -1)}</em>;
        }
        return part;
    });
};

export default function PDFViewerPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const docId = params.id as string;

    // FIXED: Renamed from 'document' to 'pdfDocument' to avoid shadowing global document object
    const [pdfDocument, setPdfDocument] = useState<PDFDocument | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [slides, setSlides] = useState<Slide[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [extractionData, setExtractionData] = useState<any>(null);
    const [summarizationData, setSummarizationData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('slides');
    const [selectedChapter, setSelectedChapter] = useState<number | 'all'>(
        'all',
    );

    // Fetch document details
    useEffect(() => {
        const fetchDocument = async () => {
            if (!user) {
                toast.error('Please log in to view documents');
                router.push('/dashboard');
                return;
            }

            if (docId === 'doc-1') {
                setSlides(mockPresentation.slides as any[]);
                setChapters((mockPresentation.chapters as any[]) || []);

                // Define extra images that are present in the folder but missing from JSON
                const extraImages = [
                    {
                        page: 1,
                        name: 'page_1_figure_1_graphs.png',
                        type: 'Chart',
                        caption: 'Graphs extracted from Figure 1',
                    },
                    {
                        page: 1,
                        name: 'page_1_figure_1_map.png',
                        type: 'Map',
                        caption: 'Map extracted from Figure 1',
                    },
                    {
                        page: 6,
                        name: 'page_6_figure_1_row1.png',
                        type: 'Figure Row',
                        caption: 'Row 1 of Figure 1',
                    },
                    {
                        page: 6,
                        name: 'page_6_figure_1_row2.png',
                        type: 'Figure Row',
                        caption: 'Row 2 of Figure 1',
                    },
                    {
                        page: 6,
                        name: 'page_6_figure_1_row3.png',
                        type: 'Figure Row',
                        caption: 'Row 3 of Figure 1',
                    },
                    {
                        page: 7,
                        name: 'page_7_figure_1_row1.png',
                        type: 'Figure Row',
                        caption: 'Row 1 of Figure 1',
                    },
                    {
                        page: 7,
                        name: 'page_7_figure_1_row2.png',
                        type: 'Figure Row',
                        caption: 'Row 2 of Figure 1',
                    },
                    {
                        page: 7,
                        name: 'page_7_figure_1_row3.png',
                        type: 'Figure Row',
                        caption: 'Row 3 of Figure 1',
                    },
                ];

                // Process extraction data to fix image paths and inject missing images
                const processedExtraction = {
                    ...mockExtractionResult,
                    pages: mockExtractionResult.pages.map((page: any) => {
                        // Fix existing elements
                        const existingElements = page.elements.map(
                            (el: any) => {
                                if (el.image_context?.image_path) {
                                    const imagePath =
                                        el.image_context.image_path;
                                    const fixedUrl = imagePath.startsWith(
                                        'images/',
                                    )
                                        ? `/output/${imagePath}`
                                        : `/output/images/${imagePath}`;

                                    return {
                                        ...el,
                                        image_url: fixedUrl, // Lift to top level for component
                                        image_context: {
                                            ...el.image_context,
                                            image_url: fixedUrl,
                                        },
                                    };
                                }
                                return el;
                            },
                        );

                        // Find and add extra images for this page
                        const pageExtras = extraImages
                            .filter((img) => img.page === page.page_number)
                            .map((img) => ({
                                type: 'figure',
                                content: img.caption,
                                metadata: { caption: img.caption },
                                image_url: `/output/images/${img.name}`,
                                image_context: {
                                    image_url: `/output/images/${img.name}`,
                                    title: img.type,
                                },
                            }));

                        return {
                            ...page,
                            elements: [...existingElements, ...pageExtras],
                        };
                    }),
                };

                setExtractionData(processedExtraction);
                setSummarizationData(mockSummarizationResult);

                setPdfDocument({
                    id: 'doc-1',
                    title: 'Doc 1 Presentation',
                    fileUrl: '',
                    filePath: '',
                    uploadDate: new Date().toISOString(),
                });
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);

                // 1. Fetch from Server/Supabase for basic info
                // ... existing logic ...

                // 2. Fetch Results from Firestore
                try {
                    // Fetch Generation Results
                    const genRef = doc(
                        db,
                        'documents',
                        docId,
                        'results',
                        'generation',
                    );
                    const genSnap = await getDoc(genRef);
                    if (genSnap.exists()) {
                        const data = genSnap.data();
                        setSlides(data.slides || []);
                        setChapters(data.chapters || []);
                    }

                    // Fetch Extraction Results
                    const extRef = doc(
                        db,
                        'documents',
                        docId,
                        'results',
                        'extraction',
                    );
                    const extSnap = await getDoc(extRef);
                    if (extSnap.exists()) {
                        setExtractionData(
                            extSnap.data().content || extSnap.data().data || [],
                        );
                    }

                    // Fetch Summarization Results
                    const sumRef = doc(
                        db,
                        'documents',
                        docId,
                        'results',
                        'summarization',
                    );
                    const sumSnap = await getDoc(sumRef);
                    if (sumSnap.exists()) {
                        setSummarizationData(sumSnap.data());
                    }
                } catch (error) {
                    console.error('Error fetching Firestore results:', error);
                }

                // Try fetching from Server first (for processed documents)
                try {
                    const response = await fetch(
                        `${API_BASE_URL}/content/documents/${docId}`,
                    );
                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ Fetched document from server:', data);

                        const doc: PDFDocument = {
                            id: String(data.id),
                            title: data.filename.replace(/^\d+-/, ''), // Remove timestamp prefix if any
                            fileUrl: data.source_url || '', // Fallback if no source URL
                            filePath: '', // Not needed for server docs if we have URL
                            uploadDate: new Date(
                                data.upload_date,
                            ).toLocaleDateString(),
                        };

                        setPdfDocument(doc);
                        setPdfUrl(data.source_url);
                        setIsLoading(false);
                        return;
                    }
                } catch (serverError) {
                    console.warn(
                        'Failed to fetch from server, falling back to Supabase:',
                        serverError,
                    );
                }

                // Fallback to Supabase
                const result = await listUserFiles(user.id);

                if (result.success && result.files) {
                    // Find the specific document by matching the ID or filename
                    const foundDoc = result.files.find(
                        (file) =>
                            file.id === docId || file.name.includes(docId),
                    );

                    if (foundDoc) {
                        const doc: PDFDocument = {
                            id: foundDoc.id,
                            title: foundDoc.name.replace(/^\d+-/, ''), // Remove timestamp prefix
                            fileUrl: foundDoc.publicUrl,
                            filePath: foundDoc.path,
                            uploadDate: new Date(
                                foundDoc.createdAt,
                            ).toLocaleDateString(),
                        };

                        setPdfDocument(doc);
                        setPdfUrl(foundDoc.publicUrl);
                    } else {
                        toast.error('Document not found');
                        router.push('/dashboard');
                    }
                } else {
                    throw new Error(result.error || 'Failed to load document');
                }
            } catch (error) {
                console.error('Error fetching document:', error);
                toast.error('Failed to load document');
                router.push('/dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocument();
    }, [docId, user, router]);

    // Handle PDF download
    const handleDownload = async () => {
        if (!pdfDocument) return;

        try {
            // Create a temporary anchor element for download
            const link = window.document.createElement('a');
            link.href = pdfUrl;
            link.download = `${pdfDocument.title}.pdf`;
            link.target = '_blank';

            // Append to body, click, and remove
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);

            toast.success('PDF download started');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download PDF');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!pdfDocument) {
        return null;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/dashboard')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">
                            {pdfDocument.title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Uploaded on {pdfDocument.uploadDate}
                        </p>
                    </div>
                </div>
                <Button variant="outline" asChild>
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </a>
                </Button>
            </div>

            {/* Custom Tabs */}
            <div className="space-y-6">
                <div className="flex space-x-2 border-b">
                    <button
                        onClick={() => setActiveTab('slides')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'slides'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Presentation className="h-4 w-4" />
                            Generated Slides
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('summarization')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'summarization'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Summaries
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('questions')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'questions'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <MessageCircleQuestion className="h-4 w-4" />
                            Review & Quiz
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('extraction')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'extraction'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Extraction & Images
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('pdf')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'pdf'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <FileType className="h-4 w-4" />
                            Original PDF
                        </div>
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'slides' && (
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                        {/* Sidebar */}
                        <div className="w-full lg:w-64 shrink-0 lg:sticky lg:top-4 space-y-2 max-h-[calc(100vh-100px)] overflow-y-auto">
                            <Button
                                variant={
                                    selectedChapter === 'all'
                                        ? 'secondary'
                                        : 'ghost'
                                }
                                className="w-full justify-start"
                                onClick={() => setSelectedChapter('all')}
                            >
                                All Chapters
                            </Button>
                            {chapters.map((chapter) => (
                                <Button
                                    key={chapter.chapter_num}
                                    variant={
                                        selectedChapter === chapter.chapter_num
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    className="w-full justify-start text-left h-auto py-2 px-3 whitespace-normal"
                                    onClick={() =>
                                        setSelectedChapter(chapter.chapter_num)
                                    }
                                >
                                    <div className="flex flex-col items-start w-full">
                                        <span className="font-medium text-sm">
                                            {chapter.chapter_num}.{' '}
                                            {chapter.main_title}
                                        </span>
                                        {chapter.subtitle && (
                                            <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                {chapter.subtitle}
                                            </span>
                                        )}
                                    </div>
                                </Button>
                            ))}
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0 space-y-6">
                            {slides.length > 0 ? (
                                slides
                                    .filter(
                                        (s) =>
                                            selectedChapter === 'all' ||
                                            s.chapter === selectedChapter,
                                    )
                                    .map((slide, index) => (
                                        <Card key={index}>
                                            <CardHeader>
                                                <CardTitle className="text-lg">
                                                    {slide.chapter_main_title}
                                                    <div className="text-lg text-muted-foreground">
                                                        {slide.subchapter &&
                                                            slide.subchapter !==
                                                                'Unknown' &&
                                                            ` - ${slide.subchapter}`}
                                                    </div>
                                                </CardTitle>
                                                {slide.chapter_main_title && (
                                                    <div className="text-sm text-muted-foreground"></div>
                                                )}
                                            </CardHeader>
                                            <CardContent>
                                                <div className="prose dark:prose-invert max-w-none space-y-4">
                                                    {slide.content.map(
                                                        (item, idx) => {
                                                            const type = (
                                                                item.type ||
                                                                'text'
                                                            ).toLowerCase();
                                                            return (
                                                                <div key={idx}>
                                                                    {(type ===
                                                                        'title' ||
                                                                        type ===
                                                                            'section_title') && (
                                                                        <h3 className="text-xl font-bold">
                                                                            {formatText(
                                                                                item.text,
                                                                            )}
                                                                        </h3>
                                                                    )}
                                                                    {(type ===
                                                                        'text' ||
                                                                        type ===
                                                                            'paragraph') && (
                                                                        <div className="prose dark:prose-invert max-w-none text-base leading-relaxed">
                                                                            <ReactMarkdown>
                                                                                {
                                                                                    item.text
                                                                                }
                                                                            </ReactMarkdown>
                                                                        </div>
                                                                    )}
                                                                    {(type ===
                                                                        'bullet points' ||
                                                                        type ===
                                                                            'bullet') && (
                                                                        <ul className="list-disc pl-5">
                                                                            {item.text
                                                                                .split(
                                                                                    '\n',
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        line: string,
                                                                                        i: number,
                                                                                    ) => (
                                                                                        <li
                                                                                            key={
                                                                                                i
                                                                                            }
                                                                                        >
                                                                                            {formatText(
                                                                                                line.replace(
                                                                                                    /^[•-]\s*/,
                                                                                                    '',
                                                                                                ),
                                                                                            )}
                                                                                        </li>
                                                                                    ),
                                                                                )}
                                                                        </ul>
                                                                    )}
                                                                    {(type ===
                                                                        'code' ||
                                                                        type ===
                                                                            'table') && (
                                                                        <pre className="bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                                                                            <code>
                                                                                {
                                                                                    item.text
                                                                                }
                                                                            </code>
                                                                        </pre>
                                                                    )}
                                                                    {(type ===
                                                                        'image' ||
                                                                        type ===
                                                                            'figure') && (
                                                                        <div className="my-4">
                                                                            {item
                                                                                .metadata
                                                                                ?.image_url ? (
                                                                                <img
                                                                                    src={
                                                                                        item
                                                                                            .metadata
                                                                                            .image_url
                                                                                    }
                                                                                    alt={
                                                                                        item.text ||
                                                                                        'Slide Image'
                                                                                    }
                                                                                    className="max-w-full h-auto rounded-lg"
                                                                                />
                                                                            ) : (
                                                                                <p className="text-sm text-muted-foreground mb-2 p-4 border border-dashed rounded-lg text-center">
                                                                                    [Image
                                                                                    Placeholder:{' '}
                                                                                    {
                                                                                        item.text
                                                                                    }

                                                                                    ]
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    No slides generated yet.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="space-y-6">
                        {chapters.length > 0 ? (
                            chapters.map((chapter) => {
                                const hasQuestions =
                                    chapter.learn_controls &&
                                    Object.keys(chapter.learn_controls).length >
                                        0;

                                if (!hasQuestions) return null;

                                return (
                                    <Card key={chapter.chapter_num}>
                                        <CardHeader>
                                            <CardTitle>
                                                Chapter {chapter.chapter_num}:{' '}
                                                {chapter.main_title}
                                            </CardTitle>
                                            {chapter.subtitle && (
                                                <p className="text-sm text-muted-foreground">
                                                    {chapter.subtitle}
                                                </p>
                                            )}
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                {Object.entries(
                                                    chapter.learn_controls,
                                                ).map(
                                                    ([
                                                        subchapter,
                                                        questions,
                                                    ]) => (
                                                        <div key={subchapter}>
                                                            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                                                {subchapter}
                                                            </h4>
                                                            <div className="grid gap-3 pl-4">
                                                                {questions.map(
                                                                    (q, i) => (
                                                                        <div
                                                                            key={
                                                                                i
                                                                            }
                                                                            className="p-3 bg-muted/50 rounded-lg text-sm"
                                                                        >
                                                                            <span className="font-bold mr-2">
                                                                                Q
                                                                                {i +
                                                                                    1}

                                                                                .
                                                                            </span>
                                                                            {q}
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                No review questions available.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'summarization' && (
                    <div className="space-y-6">
                        {summarizationData ? (
                            <>
                                {summarizationData.global_summary && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Global Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="whitespace-pre-wrap">
                                                {
                                                    summarizationData.global_summary
                                                }
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                                <div className="grid gap-6">
                                    {(
                                        summarizationData.page_summaries ||
                                        summarizationData.topic_summaries
                                    )?.map((item: any, index: number) => (
                                        <Card key={index}>
                                            <CardHeader>
                                                <CardTitle className="text-lg">
                                                    {item.page_number
                                                        ? `Page ${item.page_number}`
                                                        : item.topic}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <h4 className="font-semibold mb-2">
                                                        Summary
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                        {item.summary}
                                                    </p>
                                                </div>
                                                {item.topics &&
                                                    item.topics.length > 0 && (
                                                        <div>
                                                            <h4 className="font-semibold mb-2">
                                                                Topics
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {item.topics.map(
                                                                    (
                                                                        topic: string,
                                                                        i: number,
                                                                    ) => (
                                                                        <Badge
                                                                            key={
                                                                                i
                                                                            }
                                                                            variant="secondary"
                                                                        >
                                                                            {
                                                                                topic
                                                                            }
                                                                        </Badge>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                {item.key_visuals &&
                                                    item.key_visuals.length >
                                                        0 && (
                                                        <div>
                                                            <h4 className="font-semibold mb-2">
                                                                Key Visuals
                                                            </h4>
                                                            <ul className="list-disc pl-5 text-sm">
                                                                {item.key_visuals.map(
                                                                    (
                                                                        visual: any,
                                                                        i: number,
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                i
                                                                            }
                                                                        >
                                                                            {typeof visual ===
                                                                            'string' ? (
                                                                                visual
                                                                            ) : (
                                                                                <div className="space-y-2">
                                                                                    <p>
                                                                                        {
                                                                                            visual.analysis
                                                                                        }
                                                                                    </p>
                                                                                    {visual.image_url && (
                                                                                        <img
                                                                                            src={
                                                                                                visual.image_url
                                                                                            }
                                                                                            alt="Visual"
                                                                                            className="max-w-full h-auto rounded-lg shadow-sm mt-2 max-h-64"
                                                                                        />
                                                                                    )}
                                                                                    {!visual.analysis &&
                                                                                        !visual.image_url &&
                                                                                        JSON.stringify(
                                                                                            visual,
                                                                                        )}
                                                                                </div>
                                                                            )}
                                                                        </li>
                                                                    ),
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}
                                                {item.key_insights &&
                                                    item.key_insights.length >
                                                        0 && (
                                                        <div>
                                                            <h4 className="font-semibold mb-2">
                                                                Key Insights
                                                            </h4>
                                                            <ul className="list-disc pl-5 text-sm">
                                                                {item.key_insights.map(
                                                                    (
                                                                        insight: string,
                                                                        i: number,
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                i
                                                                            }
                                                                        >
                                                                            {
                                                                                insight
                                                                            }
                                                                        </li>
                                                                    ),
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                No summaries found.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'extraction' && (
                    <div className="space-y-8">
                        {(() => {
                            let data: any[] = [];
                            if (extractionData) {
                                if (Array.isArray(extractionData)) {
                                    data = extractionData;
                                } else if (extractionData.pages) {
                                    // Flatten elements from all pages
                                    data = extractionData.pages.flatMap(
                                        (page: any) =>
                                            page.elements
                                                ? page.elements.map(
                                                      (el: any) => ({
                                                          ...el,
                                                          page_number:
                                                              page.page_number,
                                                      }),
                                                  )
                                                : [],
                                    );
                                } else if (extractionData.content) {
                                    data = extractionData.content;
                                }
                            }

                            if (data.length === 0) {
                                return (
                                    <div className="text-center py-12 text-muted-foreground">
                                        No extraction data found.
                                    </div>
                                );
                            }

                            // Separate images and other content
                            const images = data.filter(
                                (item) =>
                                    (['Image', 'figure', 'chart'].includes(
                                        item.type,
                                    ) &&
                                        item.image_url) ||
                                    (item.image_context &&
                                        item.image_context.image_url),
                            );

                            const otherContent = data.filter(
                                (item) => !images.includes(item),
                            );

                            return (
                                <>
                                    {/* Images Gallery */}
                                    {images.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-bold flex items-center gap-2">
                                                    <ImageIcon className="h-5 w-5" />
                                                    Extracted Visuals
                                                </h3>
                                                <Badge variant="secondary">
                                                    {images.length} Images
                                                </Badge>
                                            </div>
                                            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                                                {images.map(
                                                    (
                                                        item: any,
                                                        index: number,
                                                    ) => {
                                                        const imageUrl =
                                                            item.image_url ||
                                                            item.image_context
                                                                ?.image_url;
                                                        return (
                                                            <div
                                                                key={index}
                                                                className="break-inside-avoid"
                                                            >
                                                                <Card className="overflow-hidden">
                                                                    <div className="relative bg-muted/20">
                                                                        <img
                                                                            src={
                                                                                imageUrl
                                                                            }
                                                                            alt={
                                                                                item.type ||
                                                                                'Extracted Visual'
                                                                            }
                                                                            className="w-full h-auto object-cover transition-all hover:scale-105"
                                                                            loading="lazy"
                                                                        />
                                                                    </div>
                                                                    <CardContent className="p-4">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <Badge
                                                                                variant="outline"
                                                                                className="capitalize"
                                                                            >
                                                                                {
                                                                                    item.type
                                                                                }
                                                                            </Badge>
                                                                            {item.page_number && (
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    Page{' '}
                                                                                    {
                                                                                        item.page_number
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {item
                                                                            .metadata
                                                                            ?.caption && (
                                                                            <p className="text-sm text-muted-foreground italic">
                                                                                {
                                                                                    item
                                                                                        .metadata
                                                                                        .caption
                                                                                }
                                                                            </p>
                                                                        )}
                                                                        {item.content &&
                                                                            item.content !==
                                                                                'Figure on page ' +
                                                                                    item.page_number && (
                                                                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                                                                    {
                                                                                        item.content
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                    </CardContent>
                                                                </Card>
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Other Content */}
                                    {otherContent.length > 0 && (
                                        <div
                                            className={
                                                images.length > 0 ? 'mt-12' : ''
                                            }
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-bold flex items-center gap-2">
                                                    <FileText className="h-5 w-5" />
                                                    Extracted Content
                                                </h3>
                                                <Badge variant="secondary">
                                                    {otherContent.length} Items
                                                </Badge>
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                {otherContent.map(
                                                    (
                                                        item: any,
                                                        index: number,
                                                    ) => (
                                                        <Card
                                                            key={index}
                                                            className="h-full"
                                                        >
                                                            <CardContent className="p-4 flex flex-col h-full">
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="capitalize"
                                                                    >
                                                                        {item.type ||
                                                                            'Content'}
                                                                    </Badge>
                                                                    {item.page_number && (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            Page{' '}
                                                                            {
                                                                                item.page_number
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Handle Tables */}
                                                                {item.type ===
                                                                'table' ? (
                                                                    <div className="bg-muted p-2 rounded text-xs font-mono overflow-auto max-h-60">
                                                                        <pre>
                                                                            {typeof item.content ===
                                                                            'string'
                                                                                ? item.content
                                                                                : JSON.stringify(
                                                                                      item.table_data ||
                                                                                          item.content,
                                                                                      null,
                                                                                      2,
                                                                                  )}
                                                                        </pre>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-sm whitespace-pre-wrap line-clamp-[10] overflow-y-auto max-h-60">
                                                                        {item.content ||
                                                                            item.text ||
                                                                            JSON.stringify(
                                                                                item,
                                                                            )}
                                                                    </div>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                )}

                {activeTab === 'pdf' && (
                    <div className="aspect-[16/9] w-full bg-muted rounded-lg overflow-hidden border">
                        <iframe
                            src={pdfUrl}
                            className="w-full h-full"
                            title="PDF Viewer"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
