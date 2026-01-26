import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Layers,
    Edit2,
    Save,
    X,
    RotateCcw,
    Plus,
    Wand2,
    Check,
    Zap,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { API_BASE_URL } from '@/lib/constants';
import { toast } from 'sonner';

// Content element types that backend can send
type ContentType =
    | 'h1'
    | 'h2'
    | 'h3'
    | 'p'
    | 'ul'
    | 'ol'
    | 'text'
    | 'image'
    | 'table';

interface TableContent {
    headers: string[];
    rows: string[][];
    caption?: string;
}

interface ContentElement {
    type: ContentType;
    content: string | string[] | TableContent; // string for text, array for lists, object for tables
    style?: 'bold' | 'italic' | 'highlight'; // optional styling
    metadata?: any;
}

export interface StructuredSlide {
    slideTitle: string;
    elements: ContentElement[];
    slide_number?: number;
    chapter_num?: number;
}

export interface StructuredChapter {
    chapterTitle: string;
    slides: StructuredSlide[];
    questionnaire?: any[];
}

// Helper to transform raw content items to ContentElements
const transformContentToElements = (contentItems: any[]): ContentElement[] => {
    const elements: ContentElement[] = [];

    contentItems.forEach((item: any) => {
        const typeLower = item.type?.toLowerCase() || 'text';

        if (
            typeLower === 'title' ||
            typeLower === 'h1' ||
            typeLower === 'slide_title'
        ) {
            elements.push({
                type: 'h2',
                content: item.text || item.content,
            });
        } else if (typeLower === 'section_title' || typeLower === 'h2') {
            elements.push({
                type: 'h3',
                content: item.text || item.content,
            });
        } else if (
            typeLower === 'bullet points' ||
            typeLower === 'bullet_points' ||
            typeLower === 'bullet'
        ) {
            // Check if it's already an array
            let items = [];
            if (Array.isArray(item.text)) items = item.text;
            else if (typeof item.text === 'string')
                items = item.text
                    .split('\n')
                    .map((s: string) => s.replace(/^[•-]\s*/, ''));
            else if (Array.isArray(item.content)) items = item.content;
            else if (typeof item.content === 'string')
                items = item.content
                    .split('\n')
                    .map((s: string) => s.replace(/^[•-]\s*/, ''));

            if (items.length > 0) {
                elements.push({ type: 'ul', content: items });
            }
        } else if (
            typeLower === 'image' ||
            typeLower === 'img' ||
            typeLower === 'figure'
        ) {
            elements.push({
                type: 'image',
                content:
                    item.metadata?.image_url ||
                    item.metadata?.url ||
                    item.url ||
                    item.text ||
                    item.content ||
                    '',
            });
        } else if (typeLower === 'table') {
            const rawRows = item.table_data || item.metadata?.table_data || [];
            // Check if table data is empty but content/text might be a markdown table string
            const possibleContent =
                item.content || item.text || item.value || '';

            if (
                rawRows.length === 0 &&
                typeof possibleContent === 'string' &&
                possibleContent.includes('|')
            ) {
                // Attempt to parse markdown table
                let lines = possibleContent
                    .split('\n')
                    .map((l: string) => l.trim())
                    .filter((l: string) => l.length > 0);

                // Handle case where newlines might be missing or different
                if (lines.length < 2 && possibleContent.includes('| |')) {
                    lines = possibleContent
                        .split('| |')
                        .map((l: string) => l.trim())
                        .filter((l: string) => l.length > 0);
                }

                if (lines.length >= 2) {
                    // Simple parser: assumes pipe-separated values
                    const parseLine = (line: string) =>
                        line
                            .split('|')
                            .map((c) => c.trim())
                            .filter((c, i, arr) => {
                                // Filter out empty first/last cells if they exist due to leading/trailing pipes
                                if (i === 0 && c === '') return false;
                                if (i === arr.length - 1 && c === '')
                                    return false;
                                return true;
                            });

                    const headers = parseLine(lines[0]);

                    // Better separator check: check if cells contain mostly dashes
                    const isSeparator = (line: string) => {
                        // Remove pipes and spaces
                        const stripped = line.replace(/[|\s]/g, '');
                        // Check if remaining is mostly dashes (allow some colons for alignment :---)
                        return /^[:\-]+$/.test(stripped);
                    };

                    const dataRows = lines
                        .slice(1)
                        .filter((l: string) => !isSeparator(l))
                        .map(parseLine);

                    if (headers.length > 0 && dataRows.length > 0) {
                        elements.push({
                            type: 'table',
                            content: {
                                caption: item.metadata?.caption || 'Table Data',
                                headers: headers,
                                rows: dataRows,
                            },
                        });
                        return; // Skip default processing
                    }
                }
            }

            // Sanitize headers first to use for row mapping if needed
            let rawHeaders =
                item.table_headers || item.metadata?.table_headers || [];

            // If headers are missing but we have object rows, derive headers from keys
            if (
                rawHeaders.length === 0 &&
                rawRows.length > 0 &&
                typeof rawRows[0] === 'object' &&
                !Array.isArray(rawRows[0]) &&
                !rawRows[0].row
            ) {
                rawHeaders = Object.keys(rawRows[0]);
            }

            const headers = rawHeaders.map((h: any) => {
                if (h === null || h === undefined) return '';
                if (typeof h === 'object') {
                    return (
                        h.column_name ||
                        h.name ||
                        h.title ||
                        h.text ||
                        JSON.stringify(h)
                    );
                }
                return String(h);
            });

            const rows = rawRows.map((r: any) => {
                let rowData = [];
                if (Array.isArray(r)) rowData = r;
                else if (r && Array.isArray(r.row)) rowData = r.row;
                else if (r && typeof r === 'object') {
                    // Handle list of dicts format
                    // Use headers to determine order and keys
                    rowData = headers.map((h: string) => {
                        const val = r[h];
                        return val !== undefined ? val : '';
                    });
                }

                // Sanitize cells to ensure they are strings
                return rowData.map((cell: any) => {
                    if (cell === null || cell === undefined) return '';
                    if (typeof cell === 'object') {
                        return (
                            cell.text ||
                            cell.content ||
                            cell.value ||
                            JSON.stringify(cell)
                        );
                    }
                    return String(cell);
                });
            });

            elements.push({
                type: 'table',
                content: {
                    caption:
                        item.metadata?.caption ||
                        (typeof item.content === 'string' &&
                        !item.content.includes('|')
                            ? item.content
                            : '') ||
                        '',
                    headers: headers,
                    rows: rows,
                },
            });
        } else {
            // Default to paragraph
            elements.push({
                type: 'p',
                content: item.text || item.content || '',
            });
        }
    });

    return elements;
};

// Editable Content Component
const ContentEditor = ({
    element,
    onChange,
}: {
    element: ContentElement;
    onChange: (newContent: string | string[]) => void;
}) => {
    const { type, content, style } = element;

    if (type === 'ul' || type === 'ol') {
        const listItems = Array.isArray(content) ? content : [String(content)];
        return (
            <div className="space-y-2 mb-4">
                {listItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                        <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                        <Textarea
                            value={item}
                            onChange={(e) => {
                                const newItems = [...listItems];
                                newItems[idx] = e.target.value;
                                onChange(newItems);
                            }}
                            className="min-h-[40px] resize-y bg-white dark:bg-gray-900"
                        />
                    </div>
                ))}
            </div>
        );
    }

    // Headers and Text
    if (type === 'h1' || type === 'h2' || type === 'h3') {
        return (
            <Input
                value={content as string}
                onChange={(e) => onChange(e.target.value)}
                className="mb-4 font-bold text-lg"
            />
        );
    }

    if (type === 'image') {
        return (
            <div className="mb-4">
                <label className="text-xs text-gray-500 mb-1 block">
                    Image URL
                </label>
                <div className="flex gap-2">
                    <Input
                        value={content as string}
                        onChange={(e) => onChange(e.target.value)}
                        className="text-sm font-mono"
                        placeholder="https://..."
                    />
                </div>
                {(content as string) && (
                    <div className="mt-2 relative aspect-video w-full rounded-lg overflow-hidden border bg-gray-100 dark:bg-gray-800">
                        <img
                            src={content as string}
                            alt="Preview"
                            className="object-contain w-full h-full"
                        />
                    </div>
                )}
            </div>
        );
    }

    if (type === 'table') {
        // Simple editor for caption? Or ignore editing tables for now.
        // For now, just allow editing the caption or a placeholder.
        return (
            <div className="p-2 border border-gray-200 rounded text-sm text-gray-500 bg-gray-50 italic">
                Table editing not supported yet.
            </div>
        );
    }

    return (
        <Textarea
            value={content as string}
            onChange={(e) => onChange(e.target.value)}
            className="mb-4 min-h-[80px] leading-relaxed"
        />
    );
};

// Component to render individual content elements
const ContentRenderer = ({ element }: { element: ContentElement }) => {
    const { type, content, style } = element;

    // Apply styling classes
    const getStyleClass = () => {
        if (style === 'bold')
            return 'font-bold text-blue-600 dark:text-blue-400';
        if (style === 'italic') return 'italic';
        if (style === 'highlight')
            return 'bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded';
        return '';
    };

    switch (type) {
        case 'h1':
            return (
                <h1
                    className={`text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 ${getStyleClass()}`}
                >
                    {content as string}
                </h1>
            );

        case 'h2':
            return (
                <h2
                    className={`text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 ${getStyleClass()}`}
                >
                    {content as string}
                </h2>
            );

        case 'h3':
            return (
                <h3
                    className={`text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-3 ${getStyleClass()}`}
                >
                    {content as string}
                </h3>
            );

        case 'p':
        case 'text':
            return (
                <div
                    className={`text-gray-700 dark:text-gray-300 mb-4 leading-relaxed ${getStyleClass()}`}
                >
                    <ReactMarkdown>{content as string}</ReactMarkdown>
                </div>
            );

        case 'ul':
            return (
                <ul className="space-y-2 mb-4">
                    {(content as string[]).map((item, idx) => (
                        <li
                            key={idx}
                            className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                            <div className="flex-1">
                                <ReactMarkdown>{item}</ReactMarkdown>
                            </div>
                        </li>
                    ))}
                </ul>
            );

        case 'ol':
            return (
                <ol className="space-y-2 mb-4 list-decimal list-inside">
                    {(content as string[]).map((item, idx) => (
                        <li
                            key={idx}
                            className="text-gray-700 dark:text-gray-300 ml-2"
                        >
                            <span className="inline-block align-top">
                                <ReactMarkdown>{item}</ReactMarkdown>
                            </span>
                        </li>
                    ))}
                </ol>
            );

        case 'image':
            if (!content) return null;
            return (
                <div className="mb-6 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <img
                        src={content as string}
                        alt="Slide content"
                        className="w-full h-auto max-h-[400px] object-contain mx-auto"
                        loading="lazy"
                    />
                </div>
            );

        case 'table':
            const tableContent = content as TableContent;
            return (
                <div className="my-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    {tableContent.caption && (
                        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 italic">
                            {tableContent.caption}
                        </div>
                    )}
                    <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-800">
                            <tr>
                                {(tableContent.headers || []).map(
                                    (header, idx) => (
                                        <th
                                            key={idx}
                                            className="px-6 py-3 font-semibold border-b border-gray-200 dark:border-gray-700"
                                        >
                                            {header}
                                        </th>
                                    ),
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {(tableContent.rows || []).map((row, rowIdx) => (
                                <tr
                                    key={rowIdx}
                                    className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 last:border-0"
                                >
                                    {(row || []).map((cell, cellIdx) => (
                                        <td key={cellIdx} className="px-6 py-4">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );

        default:
            return null;
    }
};

// Transformer function to adapt existing Slide data to this view
export const transformToStructuredData = (
    courseSlides: any[],
    courseChapters: any[],
): StructuredChapter[] => {
    // Group slides by chapter
    const chapterMap = new Map<number, StructuredSlide[]>();
    const chapterTitleMap = new Map<string, number>();

    // Helper to normalize chapter numbers
    const normalizeChapter = (num: any) => {
        const n = parseInt(String(num), 10);
        return isNaN(n) ? 1 : n;
    };

    // Initialize chapters
    courseChapters.forEach((ch) => {
        const num = normalizeChapter(ch.chapter_num);
        chapterMap.set(num, []);
        if (ch.main_title) {
            chapterTitleMap.set(ch.main_title.toLowerCase().trim(), num);
        }
    });

    // Transform slides
    courseSlides.forEach((slide) => {
        const elements = transformContentToElements(slide.content);

        // Determine correct chapter bucket
        let chapterNum = 1;

        // Strategy 1: Match by Title (Most accurate)
        const slideChapterTitle =
            slide.chapter_main_title || slide.chapter_title;
        if (
            slideChapterTitle &&
            chapterTitleMap.has(slideChapterTitle.toLowerCase().trim())
        ) {
            chapterNum = chapterTitleMap.get(
                slideChapterTitle.toLowerCase().trim(),
            )!;
        } else {
            // Strategy 2: Numeric fallback
            const rawNum = slide.chapter;
            if (rawNum === null || rawNum === undefined || rawNum === 'null') {
                chapterNum = 1;
            } else {
                const n = parseInt(String(rawNum), 10);
                if (!isNaN(n)) {
                    // Check if this number exists directly in our map
                    if (chapterMap.has(n)) {
                        chapterNum = n;
                    }
                    // Check if n+1 exists (common 0-vs-1 indexing offset)
                    else if (chapterMap.has(n + 1)) {
                        chapterNum = n + 1;
                    } else {
                        chapterNum = n; // Fallback to raw number
                    }
                }
            }
        }

        if (!chapterMap.has(chapterNum)) {
            // If bucket doesn't exist (e.g. Chapter 0?), try to put in Chapter 1 or create new
            if (chapterMap.has(1)) chapterNum = 1;
            else {
                chapterMap.set(chapterNum, []);
            }
        }

        const structuredSlide: StructuredSlide = {
            slideTitle: slide.title || slide.slide_title || 'Untitled Slide',
            elements: elements,
            slide_number:
                slide.sequence !== undefined
                    ? slide.sequence
                    : slide.slide_number,
            chapter_num:
                slide.chapter !== undefined && slide.chapter !== null
                    ? slide.chapter
                    : chapterNum, // Use calculated chapter if missing
        };

        chapterMap.get(chapterNum)?.push(structuredSlide);
    });

    // Build result
    return courseChapters.map((ch) => {
        const chapterNum = normalizeChapter(ch.chapter_num);
        const isIntro =
            chapterNum === 1 ||
            ch.main_title?.toLowerCase().includes('introduction');

        return {
            chapterTitle: ch.main_title,
            slides: chapterMap.get(chapterNum) || [],
            questionnaire:
                isIntro || !ch.learn_controls
                    ? []
                    : Object.entries(ch.learn_controls).map(
                          ([subchapter, questions]) => ({
                              subchapter,
                              questions: Array.isArray(questions)
                                  ? questions
                                  : [],
                          }),
                      ),
        };
    });
};

interface StructuredJsonViewProps {
    data: StructuredChapter[];
    onSave?: (newData: StructuredChapter[]) => Promise<void>;
    canEdit?: boolean;
    resultId?: string;
    rawSlides?: any[]; // Raw slides to lookup metadata if missing
    initialChapterIndex?: number;
    initialSlideIndex?: number;
}

export const StructuredJsonView: React.FC<StructuredJsonViewProps> = ({
    data,
    onSave,
    canEdit = true,
    resultId,
    rawSlides,
    initialChapterIndex = 0,
    initialSlideIndex = 0,
}) => {
    // State for navigation
    const [currentChapterIndex, setCurrentChapterIndex] =
        useState(initialChapterIndex);
    const [currentSlideIndex, setCurrentSlideIndex] =
        useState(initialSlideIndex);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [localData, setLocalData] = useState<StructuredChapter[]>(data);
    const [isSaving, setIsSaving] = useState(false);

    // Summarization State
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summaryPreview, setSummaryPreview] = useState<{
        original: any[];
        summarized: any[];
        newElements: ContentElement[];
    } | null>(null);

    // Reset to start when data changes (only if not editing)
    useEffect(() => {
        if (!isEditing && !summaryPreview) {
            // Only reset if data length changes significantly or if we want to enforce reset
            // For now, let's respect initial props if provided on mount, but if data changes
            // we might want to reset or keep current position.
            // Existing logic was:
            // setCurrentChapterIndex(0);
            // setCurrentSlideIndex(0);
            // setLocalData(data);

            // We should keep localData in sync
            setLocalData(data);
        }
    }, [data]);

    // Update URL when position changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('chapter', String(currentChapterIndex + 1));
            url.searchParams.set('slide', String(currentSlideIndex + 1));
            window.history.replaceState({}, '', url.toString());
        }
    }, [currentChapterIndex, currentSlideIndex]);

    // Helper to get slide metadata, falling back to lookup if needed
    const getSlideMetadata = (
        slide: StructuredSlide,
        chapter: StructuredChapter,
    ) => {
        console.group('getSlideMetadata Debug');
        console.log('Checking slide:', slide);
        console.log('Checking chapter:', chapter);
        console.log('Direct properties:', {
            chapter_num: slide.chapter_num,
            slide_number: slide.slide_number,
        });

        // 1. Check direct properties
        if (
            typeof slide.chapter_num === 'number' &&
            !isNaN(slide.chapter_num) &&
            typeof slide.slide_number === 'number' &&
            !isNaN(slide.slide_number)
        ) {
            console.log('Found valid metadata directly on slide');
            console.groupEnd();
            return {
                chapter_num: slide.chapter_num,
                slide_number: slide.slide_number,
            };
        }

        console.log('Direct check failed, attempting lookup in rawSlides', {
            rawSlidesLength: rawSlides?.length,
        });

        // 2. Attempt lookup in rawSlides
        if (rawSlides && rawSlides.length > 0) {
            // Heuristic: Match slide title and chapter title
            const match = rawSlides.find(
                (s) =>
                    (s.title === slide.slideTitle ||
                        s.slide_title === slide.slideTitle) &&
                    (s.chapter_main_title === chapter.chapterTitle ||
                        s.chapter_title === chapter.chapterTitle),
            );

            console.log('Lookup match result:', match);

            if (match) {
                // Try to find chapter number
                const cNum =
                    match.chapter !== undefined && match.chapter !== null
                        ? Number(match.chapter)
                        : undefined;

                // Try to find slide number (sequence or slide_number)
                let sNum =
                    match.slide_number !== undefined &&
                    match.slide_number !== null
                        ? Number(match.slide_number)
                        : undefined;

                if (
                    sNum === undefined &&
                    match.sequence !== undefined &&
                    match.sequence !== null
                ) {
                    sNum = Number(match.sequence);
                }

                if (
                    cNum !== undefined &&
                    !isNaN(cNum) &&
                    sNum !== undefined &&
                    !isNaN(sNum)
                ) {
                    console.log('Found valid metadata via lookup');
                    console.groupEnd();
                    return {
                        chapter_num: cNum,
                        slide_number: sNum,
                    };
                }
            }
        }
        console.warn('Metadata lookup failed completely');
        console.groupEnd();
        return null;
    };

    const handleSummarize = async (
        strength: 'standard' | 'strong' = 'standard',
    ) => {
        if (!resultId) {
            toast.error('Result ID is missing. Cannot summarize.');
            return;
        }

        const currentChapter = localData[currentChapterIndex];
        const currentSlide = currentChapter.slides[currentSlideIndex];

        const metadata = getSlideMetadata(currentSlide, currentChapter);

        if (!metadata) {
            toast.error(
                'Slide metadata missing (chapter/slide number). Cannot summarize.',
            );
            return;
        }

        // Final sanity check for payload
        const chapterNum = Number(metadata.chapter_num);
        const slideNum = Number(metadata.slide_number);

        if (isNaN(chapterNum) || isNaN(slideNum)) {
            console.error('Invalid metadata values:', metadata);
            toast.error('Invalid chapter/slide numbers. Cannot summarize.');
            return;
        }

        setIsSummarizing(true);
        try {
            const payload = {
                result_id: resultId,
                chapter_num: chapterNum,
                slide_num: slideNum,
                strength: strength,
            };

            const response = await fetch(
                `${API_BASE_URL}/content/summarize/preview`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                },
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Summarization failed:', errorData);
                throw new Error(
                    errorData.detail
                        ? JSON.stringify(errorData.detail)
                        : 'Failed to summarize',
                );
            }

            const data = await response.json();
            const newElements = transformContentToElements(
                data.summarized_content,
            );

            setSummaryPreview({
                original: data.original_content,
                summarized: data.summarized_content,
                newElements: newElements,
            });
            toast.success('Summary generated! Review the changes.');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate summary.');
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleConfirmSummary = async () => {
        if (!summaryPreview || !resultId) return;

        const currentChapter = localData[currentChapterIndex];
        const currentSlide = currentChapter.slides[currentSlideIndex];
        const metadata = getSlideMetadata(currentSlide, currentChapter);

        if (!metadata) {
            toast.error('Cannot confirm: Slide metadata missing.');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/content/summarize/confirm`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        result_id: resultId,
                        chapter_num: metadata.chapter_num,
                        slide_num: metadata.slide_number,
                        new_content: summaryPreview.summarized,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('Failed to confirm summary');
            }

            // Update local state
            const newData = [...localData];
            const chapter = { ...newData[currentChapterIndex] };
            const slides = [...chapter.slides];
            const slide = { ...slides[currentSlideIndex] };

            slide.elements = summaryPreview.newElements;
            // Optionally persist the recovered metadata to the local object so we don't look it up again
            slide.chapter_num = metadata.chapter_num;
            slide.slide_number = metadata.slide_number;

            slides[currentSlideIndex] = slide;
            chapter.slides = slides;
            newData[currentChapterIndex] = chapter;

            setLocalData(newData);
            setSummaryPreview(null);
            toast.success('Slide updated with summary.');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save summary.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelSummary = () => {
        setSummaryPreview(null);
    };

    const handleAddSlide = () => {
        const newSlide: StructuredSlide = {
            slideTitle: 'New Slide',
            elements: [
                { type: 'h2', content: 'New Slide Title' },
                { type: 'p', content: 'Add your content here...' },
            ],
        };

        const newData = [...localData];
        const chapter = { ...newData[currentChapterIndex] };
        const slides = [...chapter.slides];

        // Insert after current slide
        slides.splice(currentSlideIndex + 1, 0, newSlide);

        chapter.slides = slides;
        newData[currentChapterIndex] = chapter;

        setLocalData(newData);
        setCurrentSlideIndex((prev) => prev + 1);
        setIsEditing(true);
    };

    const handleAddElement = (type: ContentType = 'p') => {
        const newData = [...localData];
        const chapter = { ...newData[currentChapterIndex] };
        const slides = [...chapter.slides];
        const slide = { ...slides[currentSlideIndex] };

        let content: string | string[] = 'New content here...';
        if (type === 'ul' || type === 'ol') content = ['New item'];
        if (type === 'image') content = '';

        const newElement: ContentElement = {
            type,
            content,
        };

        slide.elements = [...slide.elements, newElement];
        slides[currentSlideIndex] = slide;
        chapter.slides = slides;
        newData[currentChapterIndex] = chapter;

        setLocalData(newData);
    };

    const handleSave = async () => {
        if (!onSave) return;
        setIsSaving(true);
        try {
            await onSave(localData);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save slides', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setLocalData(data); // Revert changes
        setIsEditing(false);
    };

    const updateSlideContent = (
        elementIndex: number,
        newContent: string | string[],
    ) => {
        const newData = [...localData];
        const chapter = { ...newData[currentChapterIndex] };
        const slides = [...chapter.slides];
        const slide = { ...slides[currentSlideIndex] };
        const elements = [...slide.elements];

        elements[elementIndex] = {
            ...elements[elementIndex],
            content: newContent,
        };

        slide.elements = elements;
        slides[currentSlideIndex] = slide;
        chapter.slides = slides;
        newData[currentChapterIndex] = chapter;

        setLocalData(newData);
    };

    const updateSlideTitle = (newTitle: string) => {
        const newData = [...localData];
        const chapter = { ...newData[currentChapterIndex] };
        const slides = [...chapter.slides];
        const slide = { ...slides[currentSlideIndex] };

        slide.slideTitle = newTitle;
        slides[currentSlideIndex] = slide;
        chapter.slides = slides;
        newData[currentChapterIndex] = chapter;

        setLocalData(newData);
    };

    if (!localData || localData.length === 0)
        return (
            <div className="text-muted-foreground p-4">
                No content available for structured view.
            </div>
        );

    const currentChapter = localData[currentChapterIndex];
    if (!currentChapter) return null;

    const currentSlide = currentChapter.slides[currentSlideIndex];
    const totalChapters = localData.length;

    // Helper to verify if we can move next
    const hasNextSlide = currentSlideIndex < currentChapter.slides.length - 1;
    const hasNextChapter = currentChapterIndex < totalChapters - 1;

    // Helper to verify if we can move prev
    const hasPrevSlide = currentSlideIndex > 0;
    const hasPrevChapter = currentChapterIndex > 0;

    const handleNext = () => {
        if (hasNextSlide) {
            setCurrentSlideIndex((prev) => prev + 1);
        } else if (hasNextChapter) {
            setCurrentChapterIndex((prev) => prev + 1);
            setCurrentSlideIndex(0);
        }
    };

    const handlePrev = () => {
        if (hasPrevSlide) {
            setCurrentSlideIndex((prev) => prev - 1);
        } else if (hasPrevChapter) {
            const prevChapterIndex = currentChapterIndex - 1;
            setCurrentChapterIndex(prevChapterIndex);
            // Go to last slide of previous chapter
            setCurrentSlideIndex(localData[prevChapterIndex].slides.length - 1);
        }
    };

    // Calculate global progress
    const calculateProgress = () => {
        let totalSlidesPassed = 0;
        let totalSlides = 0;

        localData.forEach((ch, idx) => {
            if (idx < currentChapterIndex) {
                totalSlidesPassed += ch.slides.length;
            } else if (idx === currentChapterIndex) {
                totalSlidesPassed += currentSlideIndex + 1;
            }
            totalSlides += ch.slides.length;
        });

        return { current: totalSlidesPassed, total: totalSlides };
    };

    const progress = calculateProgress();

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Navigation Header */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col">
                    <span className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider mb-1">
                        Chapter {currentChapterIndex + 1} of {totalChapters}
                    </span>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 line-clamp-1">
                        {currentChapter.chapterTitle}
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    {/* Position Indicator */}
                    <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                        Slide {currentSlideIndex + 1} /{' '}
                        {currentChapter.slides.length}
                    </div>

                    {/* Edit Controls */}
                    {canEdit && onSave && !summaryPreview && (
                        <div className="flex items-center gap-2">
                            {/* Summarize Button */}
                            {!isEditing && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleSummarize('standard')}
                                    disabled={isSummarizing}
                                    title="Summarize Slide"
                                    className="h-8 w-8 p-0 text-purple-600 hover:bg-purple-50"
                                >
                                    {isSummarizing ? (
                                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                                    ) : (
                                        <Wand2 className="w-4 h-4" />
                                    )}
                                </Button>
                            )}

                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleAddSlide}
                                title="Add New Slide"
                                className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="default"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="h-8 gap-2 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Save className="w-3 h-3" />
                                        {isSaving ? '...' : 'Save'}
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setIsEditing(true)}
                                    className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Preview Banner */}
            {summaryPreview && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <Wand2 className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                                Summary Preview
                            </h3>
                            <p className="text-sm text-purple-700 dark:text-purple-300">
                                Review the summarized content below.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSummarize('strong')}
                            disabled={isSummarizing}
                            className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                        >
                            <Zap className="w-3 h-3 mr-1.5" />
                            Summarize Stronger
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelSummary}
                            disabled={isSaving}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleConfirmSummary}
                            disabled={isSaving}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {isSaving ? (
                                'Saving...'
                            ) : (
                                <>
                                    <Check className="w-3 h-3 mr-1.5" />
                                    Confirm
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Slide Content */}
            <div className="relative min-h-[500px] flex flex-col">
                {currentSlide ? (
                    <Card
                        className={`flex-1 overflow-hidden border-none shadow-xl bg-white dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-300 ring-1 ring-gray-100 dark:ring-gray-700 ${
                            isEditing ? 'ring-2 ring-blue-500' : ''
                        } ${summaryPreview ? 'ring-2 ring-purple-500' : ''}`}
                    >
                        <CardHeader
                            className={`bg-gradient-to-r ${summaryPreview ? 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20' : 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'} border-b border-gray-100 dark:border-gray-700/50 py-6`}
                        >
                            <div className="flex items-center gap-3 w-full">
                                <div
                                    className={`w-10 h-10 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm ${summaryPreview ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'} shrink-0`}
                                >
                                    <Layers className="w-5 h-5" />
                                </div>
                                {isEditing ? (
                                    <Input
                                        value={currentSlide.slideTitle}
                                        onChange={(e) =>
                                            updateSlideTitle(e.target.value)
                                        }
                                        className="text-xl font-bold bg-white/50"
                                    />
                                ) : (
                                    <CardTitle className="text-xl sm:text-2xl text-blue-900 dark:text-blue-100 leading-tight">
                                        {currentSlide.slideTitle}
                                    </CardTitle>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 md:p-12 overflow-y-auto max-h-[600px]">
                            {/* Render Elements */}
                            <div className="prose dark:prose-invert max-w-none space-y-6">
                                {/* Use preview elements if available, otherwise current slide elements */}
                                {(summaryPreview
                                    ? summaryPreview.newElements
                                    : currentSlide.elements
                                ).map((element, elIdx) => (
                                    <div
                                        key={elIdx}
                                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                                        style={{
                                            animationDelay: `${elIdx * 100}ms`,
                                        }}
                                    >
                                        {isEditing ? (
                                            <ContentEditor
                                                element={element}
                                                onChange={(newVal) =>
                                                    updateSlideContent(
                                                        elIdx,
                                                        newVal,
                                                    )
                                                }
                                            />
                                        ) : (
                                            <ContentRenderer
                                                element={element}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            {isEditing && (
                                <div className="mt-8 flex flex-wrap gap-2 border-t pt-4 border-gray-100 dark:border-gray-700">
                                    <span className="text-xs text-gray-500 w-full mb-1">
                                        Add Content:
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleAddElement('p')}
                                        className="text-xs h-7"
                                    >
                                        + Paragraph
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleAddElement('ul')}
                                        className="text-xs h-7"
                                    >
                                        + List
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleAddElement('h2')}
                                        className="text-xs h-7"
                                    >
                                        + Subheading
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            handleAddElement('image')
                                        }
                                        className="text-xs h-7"
                                    >
                                        + Image
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-dashed">
                        <p className="text-gray-500">
                            No content in this slide.
                        </p>
                    </div>
                )}
            </div>

            {/* Footer Navigation Controls */}
            <div className="flex items-center justify-between gap-4 mt-6">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePrev}
                    disabled={!hasPrevSlide && !hasPrevChapter}
                    className="w-32 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                <div className="hidden sm:flex flex-col items-center flex-1 max-w-xs mx-4">
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-300 ease-out"
                            style={{
                                width: `${(progress.current / progress.total) * 100}%`,
                            }}
                        />
                    </div>
                    <span className="text-xs text-gray-500 mt-2 font-medium">
                        {Math.round((progress.current / progress.total) * 100)}%
                        Complete
                    </span>
                </div>

                <Button
                    variant="default"
                    size="lg"
                    onClick={handleNext}
                    disabled={!hasNextSlide && !hasNextChapter}
                    className="w-32 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                >
                    {hasNextSlide || hasNextChapter ? (
                        <>
                            Next <ChevronRight className="w-4 h-4" />
                        </>
                    ) : (
                        <>
                            Finish <BookOpen className="w-4 h-4" />
                        </>
                    )}
                </Button>
            </div>

            {/* Keyboard hint */}
            <div className="text-center text-xs text-gray-400 mt-4">
                Tip: Use the "Previous" and "Next" buttons to navigate through
                the deck.
            </div>
        </div>
    );
};
