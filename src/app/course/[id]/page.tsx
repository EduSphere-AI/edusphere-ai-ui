'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { useAuthStore } from '@/store/auth.store';
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
import {
    StructuredJsonView,
    StructuredChapter, // Import type
    transformToStructuredData,
} from '@/components/StructuredJsonView';
import { StructuredMarkdownView } from '@/components/StructuredMarkdownView';
import { updateDoc } from 'firebase/firestore'; // Import updateDoc

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
    // const { user } = useAuthStore(); // Auth removed
    const docId = params.id as string;

    // FIXED: Renamed from 'document' to 'pdfDocument' to avoid shadowing global document object
    const [pdfDocument, setPdfDocument] = useState<PDFDocument | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [slides, setSlides] = useState<Slide[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [extractionData, setExtractionData] = useState<any>(null);
    const [summarizationData, setSummarizationData] = useState<any>(null);
    // Add state for structured slides if loaded from DB
    const [structuredSlides, setStructuredSlides] = useState<
        StructuredChapter[] | null
    >(null);

    const [activeTab, setActiveTab] = useState('slides');
    const [selectedChapter, setSelectedChapter] = useState<number | 'all'>(
        'all',
    );

    const [selectedPage, setSelectedPage] = useState<number | 'all'>('all'); // Add state for Extraction tab pagination

    // Fetch document details
    useEffect(() => {
        const fetchDocument = async () => {
            /*if (!user) {
                toast.error('Please log in to view documents');
                router.push('/dashboard');
                return;
            }*/

            try {
                setIsLoading(true);

                // 1. Fetch from Server/Supabase for basic info
                // ... existing logic ...

                // 2. Fetch Results from Firestore
                try {
                    // Try Fetching from Jobs collection (New Architecture)
                    const jobRef = doc(db, 'jobs', `job_${docId}`);
                    const jobSnap = await getDoc(jobRef);

                    if (
                        jobSnap.exists() &&
                        jobSnap.data().status === 'completed'
                    ) {
                        const jobData = jobSnap.data();
                        console.log('Using Job Data:', jobData);

                        // 1. Slides & Chapters
                        // Check for saved structured_slides (edited version) first
                        if (jobData.result_json?.structured_slides) {
                            setStructuredSlides(
                                jobData.result_json.structured_slides,
                            );
                            // Set raw slides too for sidebar compatibility if needed, though sidebar uses 'slides' state
                            setSlides(jobData.result_json.slides || []);
                            setChapters(jobData.result_json.chapters || []);
                        } else if (jobData.result_json) {
                            setSlides(jobData.result_json.slides || []);
                            setChapters(jobData.result_json.chapters || []);
                        }

                        // If slides missing in Job, try generation subcollection
                        if (
                            !jobData.result_json?.slides?.length &&
                            !jobData.result_json?.structured_slides
                        ) {
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
                        }

                        // 2. Extraction Data
                        // Usually too large for Job doc, fetch from subcollection
                        if (jobData.extracted_content) {
                            setExtractionData(jobData.extracted_content);
                        } else {
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
                                    extSnap.data().content ||
                                        extSnap.data().data ||
                                        [],
                                );
                            }
                        }

                        // 3. Summarization Data
                        // Fetch from subcollection
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
                    } else {
                        // Fallback: Fetch Generation Results (Old Architecture)
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
                                extSnap.data().content ||
                                    extSnap.data().data ||
                                    [],
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
                    console.warn('Failed to fetch from server:', serverError);
                }

                // If we get here, we couldn't find the document
                toast.error('Document not found');
                router.push('/dashboard');
            } catch (error) {
                console.error('Error fetching document:', error);
                toast.error('Failed to load document');
                router.push('/dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocument();
    }, [docId, router]);

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

    const handleSaveSlides = async (newData: StructuredChapter[]) => {
        if (!docId) return;

        try {
            const jobRef = doc(db, 'jobs', `job_${docId}`);
            // We assume we are updating the job document (new architecture)
            // If the user is on old architecture, we might need logic to update 'documents/{id}/results/generation'
            // For now, let's update both to be safe or prefer job.

            // Fetch job to see if it exists
            const jobSnap = await getDoc(jobRef);
            if (jobSnap.exists()) {
                await updateDoc(jobRef, {
                    'result_json.structured_slides': newData,
                    // We don't overwrite 'slides' because mapping back is lossy.
                    // Instead, we rely on 'structured_slides' taking precedence in the UI.
                });
                toast.success('Slides saved successfully');
                setStructuredSlides(newData);
            } else {
                // Fallback to old document structure?
                // Actually if job doesn't exist, we probably shouldn't be here in this specific flow.
                // But let's try updating generation subcollection just in case.
                const genRef = doc(
                    db,
                    'documents',
                    docId,
                    'results',
                    'generation',
                );
                await updateDoc(genRef, {
                    structured_slides: newData,
                });
                toast.success('Slides saved successfully (Legacy)');
                setStructuredSlides(newData);
            }
        } catch (error) {
            console.error('Error saving slides:', error);
            toast.error('Failed to save changes');
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
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'overview'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Overview
                        </div>
                    </button>
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
                            Slides
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
                {activeTab === 'overview' && (
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
                                                    {Array.isArray(
                                                        slide.content,
                                                    ) &&
                                                        slide.content.map(
                                                            (item, idx) => {
                                                                const type = (
                                                                    item.type ||
                                                                    'text'
                                                                ).toLowerCase();

                                                                // Safeguard: Extract text content safely
                                                                let safeText =
                                                                    item.text ||
                                                                    item.content ||
                                                                    '';
                                                                if (
                                                                    typeof safeText ===
                                                                        'object' &&
                                                                    safeText !==
                                                                        null
                                                                ) {
                                                                    safeText =
                                                                        safeText.text ||
                                                                        safeText.content ||
                                                                        JSON.stringify(
                                                                            safeText,
                                                                        );
                                                                }
                                                                // Ensure it's a string
                                                                safeText =
                                                                    String(
                                                                        safeText,
                                                                    );

                                                                return (
                                                                    <div
                                                                        key={
                                                                            idx
                                                                        }
                                                                    >
                                                                        {(type ===
                                                                            'title' ||
                                                                            type ===
                                                                                'section_title') && (
                                                                            <h3 className="text-xl font-bold">
                                                                                {formatText(
                                                                                    safeText,
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
                                                                                        safeText
                                                                                    }
                                                                                </ReactMarkdown>
                                                                            </div>
                                                                        )}
                                                                        {(type ===
                                                                            'bullet points' ||
                                                                            type ===
                                                                                'bullet') && (
                                                                            <ul className="list-disc pl-5">
                                                                                {(Array.isArray(
                                                                                    item.text,
                                                                                )
                                                                                    ? item.text
                                                                                    : safeText.split(
                                                                                          '\n',
                                                                                      )
                                                                                ).map(
                                                                                    (
                                                                                        line: any,
                                                                                        i: number,
                                                                                    ) => {
                                                                                        // Handle line if it's an object
                                                                                        let lineText =
                                                                                            line;
                                                                                        if (
                                                                                            typeof line ===
                                                                                                'object' &&
                                                                                            line !==
                                                                                                null
                                                                                        ) {
                                                                                            lineText =
                                                                                                line.text ||
                                                                                                line.content ||
                                                                                                JSON.stringify(
                                                                                                    line,
                                                                                                );
                                                                                        }
                                                                                        return (
                                                                                            <li
                                                                                                key={
                                                                                                    i
                                                                                                }
                                                                                            >
                                                                                                {formatText(
                                                                                                    String(
                                                                                                        lineText,
                                                                                                    ).replace(
                                                                                                        /^[•-]\s*/,
                                                                                                        '',
                                                                                                    ),
                                                                                                )}
                                                                                            </li>
                                                                                        );
                                                                                    },
                                                                                )}
                                                                            </ul>
                                                                        )}
                                                                        {(type ===
                                                                            'code' ||
                                                                            type ===
                                                                                'table') && (
                                                                            <div className="my-4">
                                                                                {item
                                                                                    .metadata
                                                                                    ?.table_data ? (
                                                                                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                                                                        {item
                                                                                            .metadata
                                                                                            .caption && (
                                                                                            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 italic">
                                                                                                {
                                                                                                    item
                                                                                                        .metadata
                                                                                                        .caption
                                                                                                }
                                                                                            </div>
                                                                                        )}
                                                                                        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                                                                                            {item
                                                                                                .metadata
                                                                                                .table_headers && (
                                                                                                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-800">
                                                                                                    <tr>
                                                                                                        {item.metadata.table_headers.map(
                                                                                                            (
                                                                                                                h: any,
                                                                                                                i: number,
                                                                                                            ) => {
                                                                                                                const headerText =
                                                                                                                    typeof h ===
                                                                                                                        'object' &&
                                                                                                                    h !==
                                                                                                                        null
                                                                                                                        ? h.text ||
                                                                                                                          h.content ||
                                                                                                                          JSON.stringify(
                                                                                                                              h,
                                                                                                                          )
                                                                                                                        : String(
                                                                                                                              h,
                                                                                                                          );
                                                                                                                return (
                                                                                                                    <th
                                                                                                                        key={
                                                                                                                            i
                                                                                                                        }
                                                                                                                        className="px-6 py-3 font-semibold border-b border-gray-200 dark:border-gray-700"
                                                                                                                    >
                                                                                                                        {
                                                                                                                            headerText
                                                                                                                        }
                                                                                                                    </th>
                                                                                                                );
                                                                                                            },
                                                                                                        )}
                                                                                                    </tr>
                                                                                                </thead>
                                                                                            )}
                                                                                            <tbody>
                                                                                                {item.metadata.table_data.map(
                                                                                                    (
                                                                                                        row: any,
                                                                                                        i: number,
                                                                                                    ) => {
                                                                                                        // Handle row format which is { row: [...] }
                                                                                                        const cells =
                                                                                                            Array.isArray(
                                                                                                                row,
                                                                                                            )
                                                                                                                ? row
                                                                                                                : row.row ||
                                                                                                                  [];
                                                                                                        return (
                                                                                                            <tr
                                                                                                                key={
                                                                                                                    i
                                                                                                                }
                                                                                                                className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                                                                            >
                                                                                                                {cells.map(
                                                                                                                    (
                                                                                                                        cell: any,
                                                                                                                        j: number,
                                                                                                                    ) => {
                                                                                                                        const cellText =
                                                                                                                            typeof cell ===
                                                                                                                                'object' &&
                                                                                                                            cell !==
                                                                                                                                null
                                                                                                                                ? cell.text ||
                                                                                                                                  cell.content ||
                                                                                                                                  JSON.stringify(
                                                                                                                                      cell,
                                                                                                                                  )
                                                                                                                                : String(
                                                                                                                                      cell,
                                                                                                                                  );
                                                                                                                        return (
                                                                                                                            <td
                                                                                                                                key={
                                                                                                                                    j
                                                                                                                                }
                                                                                                                                className="px-6 py-4"
                                                                                                                            >
                                                                                                                                {
                                                                                                                                    cellText
                                                                                                                                }
                                                                                                                            </td>
                                                                                                                        );
                                                                                                                    },
                                                                                                                )}
                                                                                                            </tr>
                                                                                                        );
                                                                                                    },
                                                                                                )}
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </div>
                                                                                ) : (
                                                                                    <pre className="bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                                                                                        <code>
                                                                                            {
                                                                                                item.text
                                                                                            }
                                                                                        </code>
                                                                                    </pre>
                                                                                )}
                                                                            </div>
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

                {activeTab === 'slides' && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 min-h-[500px] p-6 rounded-lg">
                        <StructuredJsonView
                            data={
                                structuredSlides ||
                                transformToStructuredData(
                                    slides || [],
                                    chapters || [],
                                )
                            }
                            onSave={handleSaveSlides}
                            canEdit={true}
                        />
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="space-y-6">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4 text-sm border border-yellow-200 dark:border-yellow-800">
                            <p className="font-semibold mb-2">Debug Info:</p>
                            <p>Chapters count: {chapters.length}</p>
                            <p>
                                Has learn controls:{' '}
                                {chapters.some(
                                    (c) =>
                                        c.learn_controls &&
                                        Object.keys(c.learn_controls).length >
                                            0,
                                )
                                    ? 'Yes'
                                    : 'No'}
                            </p>
                            <details className="mt-2">
                                <summary className="cursor-pointer font-medium">
                                    Raw Data Dump
                                </summary>
                                <pre className="mt-2 p-2 bg-slate-950 text-slate-50 rounded text-xs overflow-auto max-h-60">
                                    {JSON.stringify(
                                        chapters.map((c) => ({
                                            ch: c.chapter_num,
                                            controls: c.learn_controls,
                                        })),
                                        null,
                                        2,
                                    )}
                                </pre>
                            </details>
                        </div>
                        {chapters.some(
                            (c) =>
                                c.learn_controls &&
                                Object.keys(c.learn_controls).length > 0,
                        ) ? (
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
                                                    ]) => {
                                                        const questionsArray =
                                                            Array.isArray(
                                                                questions,
                                                            )
                                                                ? questions
                                                                : [];
                                                        if (
                                                            questionsArray.length ===
                                                            0
                                                        )
                                                            return null;

                                                        return (
                                                            <div
                                                                key={subchapter}
                                                            >
                                                                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                                                    {subchapter}
                                                                </h4>
                                                                <div className="grid gap-3 pl-4">
                                                                    {questionsArray.map(
                                                                        (
                                                                            q: any,
                                                                            i,
                                                                        ) => {
                                                                            // Handle object-based questions (new format)
                                                                            let questionText =
                                                                                typeof q ===
                                                                                'string'
                                                                                    ? q
                                                                                    : q.question;

                                                                            // Safeguard: Ensure questionText is a string
                                                                            if (
                                                                                typeof questionText ===
                                                                                    'object' &&
                                                                                questionText !==
                                                                                    null
                                                                            ) {
                                                                                questionText =
                                                                                    questionText.text ||
                                                                                    questionText.content ||
                                                                                    JSON.stringify(
                                                                                        questionText,
                                                                                    );
                                                                            }

                                                                            let answerText =
                                                                                typeof q ===
                                                                                'string'
                                                                                    ? null
                                                                                    : q.answer;

                                                                            // Safeguard: Ensure answerText is a string
                                                                            if (
                                                                                typeof answerText ===
                                                                                    'object' &&
                                                                                answerText !==
                                                                                    null
                                                                            ) {
                                                                                answerText =
                                                                                    answerText.text ||
                                                                                    answerText.content ||
                                                                                    JSON.stringify(
                                                                                        answerText,
                                                                                    );
                                                                            }

                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        i
                                                                                    }
                                                                                    className="p-4 bg-muted/50 rounded-lg text-sm space-y-3"
                                                                                >
                                                                                    <div className="flex gap-2">
                                                                                        <span className="font-bold text-primary shrink-0">
                                                                                            Q
                                                                                            {i +
                                                                                                1}

                                                                                            .
                                                                                        </span>
                                                                                        <span className="font-medium text-foreground">
                                                                                            {
                                                                                                questionText
                                                                                            }
                                                                                        </span>
                                                                                    </div>

                                                                                    {answerText && (
                                                                                        <div className="flex gap-2 pl-2 border-l-2 border-green-500/30 ml-1">
                                                                                            <span className="font-bold text-green-600 dark:text-green-400 shrink-0">
                                                                                                A.
                                                                                            </span>
                                                                                            <span className="text-muted-foreground">
                                                                                                {
                                                                                                    answerText
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        },
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    },
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
                                    <StructuredMarkdownView
                                        markdown={
                                            summarizationData.global_summary
                                        }
                                    />
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
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                        {(() => {
                            let pages: {
                                page_number: number;
                                elements: any[];
                            }[] = [];

                            if (extractionData) {
                                if (
                                    extractionData.pages &&
                                    Array.isArray(extractionData.pages)
                                ) {
                                    pages = extractionData.pages;
                                } else if (Array.isArray(extractionData)) {
                                    // Group by page
                                    const distinctPages = Array.from(
                                        new Set(
                                            extractionData.map(
                                                (i: any) => i.page_number,
                                            ),
                                        ),
                                    ).sort() as number[];
                                    pages = distinctPages.map((pNum) => ({
                                        page_number: pNum,
                                        elements: extractionData.filter(
                                            (i: any) => i.page_number === pNum,
                                        ),
                                    }));
                                } else if (
                                    extractionData.content &&
                                    Array.isArray(extractionData.content)
                                ) {
                                    // Similar grouping
                                    const content = extractionData.content;
                                    const distinctPages = Array.from(
                                        new Set(
                                            content.map(
                                                (i: any) => i.page_number,
                                            ),
                                        ),
                                    ).sort() as number[];
                                    pages = distinctPages.map((pNum) => ({
                                        page_number: pNum,
                                        elements: content.filter(
                                            (i: any) => i.page_number === pNum,
                                        ),
                                    }));
                                }
                            }

                            if (pages.length === 0) {
                                return (
                                    <div className="w-full text-center py-12 text-muted-foreground">
                                        No extraction data found.
                                    </div>
                                );
                            }

                            return (
                                <>
                                    {/* Sidebar */}
                                    <div className="w-full lg:w-64 shrink-0 lg:sticky lg:top-4 space-y-2 max-h-[calc(100vh-100px)] overflow-y-auto">
                                        <Button
                                            variant={
                                                selectedPage === 'all'
                                                    ? 'secondary'
                                                    : 'ghost'
                                            }
                                            className="w-full justify-start"
                                            onClick={() =>
                                                setSelectedPage('all')
                                            }
                                        >
                                            <div className="flex items-center gap-2">
                                                <FileType className="h-4 w-4" />
                                                All Pages
                                            </div>
                                        </Button>
                                        {pages.map((page) => (
                                            <Button
                                                key={page.page_number}
                                                variant={
                                                    selectedPage ===
                                                    page.page_number
                                                        ? 'secondary'
                                                        : 'ghost'
                                                }
                                                className="w-full justify-start text-left"
                                                onClick={() =>
                                                    setSelectedPage(
                                                        page.page_number,
                                                    )
                                                }
                                            >
                                                Page {page.page_number}
                                            </Button>
                                        ))}
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 min-w-0 space-y-8">
                                        {pages
                                            .filter(
                                                (p) =>
                                                    selectedPage === 'all' ||
                                                    p.page_number ===
                                                        selectedPage,
                                            )
                                            .map((page) => (
                                                <Card
                                                    key={page.page_number}
                                                    className="overflow-hidden shadow-sm"
                                                >
                                                    <CardHeader className="bg-muted/30 border-b py-3">
                                                        <CardTitle className="text-base font-medium flex items-center justify-between">
                                                            <span>
                                                                Page{' '}
                                                                {
                                                                    page.page_number
                                                                }
                                                            </span>
                                                            <Badge
                                                                variant="outline"
                                                                className="font-normal text-xs"
                                                            >
                                                                {page.elements
                                                                    ?.length ||
                                                                    0}{' '}
                                                                Elements
                                                            </Badge>
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-6 sm:p-10 font-serif">
                                                        <div className="space-y-4 max-w-3xl mx-auto">
                                                            {(
                                                                page.elements ||
                                                                []
                                                            ).map(
                                                                (
                                                                    item: any,
                                                                    idx: number,
                                                                ) => {
                                                                    const type =
                                                                        (
                                                                            item.type ||
                                                                            'text'
                                                                        ).toLowerCase();

                                                                    // Resolve Image URL - Check all possible locations
                                                                    const imageUrl =
                                                                        item.image_url ||
                                                                        item
                                                                            .metadata
                                                                            ?.image_url ||
                                                                        item
                                                                            .image_context
                                                                            ?.image_url;

                                                                    const isImage =
                                                                        [
                                                                            'image',
                                                                            'figure',
                                                                            'chart',
                                                                        ].includes(
                                                                            type,
                                                                        ) ||
                                                                        !!imageUrl;

                                                                    if (
                                                                        isImage
                                                                    ) {
                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className="my-8"
                                                                            >
                                                                                {imageUrl ? (
                                                                                    <div className="rounded-lg overflow-hidden border bg-muted/10">
                                                                                        <img
                                                                                            src={
                                                                                                imageUrl
                                                                                            }
                                                                                            alt={
                                                                                                item.text ||
                                                                                                'Extracted Visual'
                                                                                            }
                                                                                            className="max-w-full h-auto mx-auto object-contain max-h-[600px]"
                                                                                            loading="lazy"
                                                                                        />
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="h-40 flex flex-col items-center justify-center bg-muted/20 border-2 border-dashed rounded-lg text-muted-foreground p-4">
                                                                                        <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                                                                                        <span className="text-sm font-medium">
                                                                                            Image
                                                                                            marker
                                                                                        </span>
                                                                                        <span className="text-xs max-w-md text-center mt-1">
                                                                                            {item.content ||
                                                                                                item.text ||
                                                                                                'No visual data available'}
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                                {(item
                                                                                    .metadata
                                                                                    ?.caption ||
                                                                                    (type ===
                                                                                        'figure' &&
                                                                                        item.text)) && (
                                                                                    <p className="mt-3 text-center text-sm text-muted-foreground italic">
                                                                                        {item
                                                                                            .metadata
                                                                                            ?.caption ||
                                                                                            item.text}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    }

                                                                    // Formatting based on type
                                                                    // Skip 'header' and 'footer' if they are noisy, or style them differently
                                                                    if (
                                                                        [
                                                                            'header',
                                                                            'footer',
                                                                        ].includes(
                                                                            type,
                                                                        )
                                                                    ) {
                                                                        return (
                                                                            <p
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className="text-xs text-muted-foreground uppercase tracking-widest text-center py-2 opacity-60"
                                                                            >
                                                                                {item.text ||
                                                                                    item.content}
                                                                            </p>
                                                                        );
                                                                    }

                                                                    if (
                                                                        [
                                                                            'title',
                                                                            'h1',
                                                                        ].includes(
                                                                            type,
                                                                        )
                                                                    ) {
                                                                        return (
                                                                            <h2
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className="text-3xl font-bold mb-6 mt-8 first:mt-0 text-foreground text-center"
                                                                            >
                                                                                {item.text ||
                                                                                    item.content}
                                                                            </h2>
                                                                        );
                                                                    }
                                                                    if (
                                                                        [
                                                                            'h2',
                                                                            'section_title',
                                                                            'subtitle',
                                                                        ].includes(
                                                                            type,
                                                                        )
                                                                    ) {
                                                                        return (
                                                                            <h3
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className="text-xl font-semibold mb-3 mt-6 text-foreground"
                                                                            >
                                                                                {item.text ||
                                                                                    item.content}
                                                                            </h3>
                                                                        );
                                                                    }
                                                                    if (
                                                                        [
                                                                            'table',
                                                                        ].includes(
                                                                            type,
                                                                        )
                                                                    ) {
                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className="my-4 overflow-x-auto border rounded-md"
                                                                            >
                                                                                <pre className="text-xs p-4 bg-muted/30 font-mono">
                                                                                    {typeof item.content ===
                                                                                    'object'
                                                                                        ? JSON.stringify(
                                                                                              item.content,
                                                                                              null,
                                                                                              2,
                                                                                          )
                                                                                        : item.content}
                                                                                </pre>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    if (
                                                                        [
                                                                            'bullet_point',
                                                                            'list_item',
                                                                            'bullet',
                                                                        ].includes(
                                                                            type,
                                                                        )
                                                                    ) {
                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className="flex gap-3 mb-2 ml-2"
                                                                            >
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-foreground/70 shrink-0 mt-2.5"></div>
                                                                                <p className="leading-relaxed text-foreground/90 font-sans">
                                                                                    {item.text ||
                                                                                        item.content}
                                                                                </p>
                                                                            </div>
                                                                        );
                                                                    }

                                                                    // Default Paragraph
                                                                    return (
                                                                        <p
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className="leading-relaxed text-foreground/90 mb-4 whitespace-pre-wrap font-sans text-lg"
                                                                        >
                                                                            {item.text ||
                                                                                item.content}
                                                                        </p>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                    </div>
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
