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
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

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
}

export interface StructuredChapter {
    chapterTitle: string;
    slides: StructuredSlide[];
    questionnaire?: any[];
}

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
    const extractText = (val: any) => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        if (typeof val === 'object')
            return val.text || val.content || JSON.stringify(val);
        return String(val);
    };

    // Group slides by chapter
    const chapterMap = new Map<number, StructuredSlide[]>();

    // Helper to normalize chapter numbers
    const normalizeChapter = (num: any) => {
        const n = parseInt(String(num), 10);
        return isNaN(n) ? 1 : n;
    };

    // Initialize chapters
    courseChapters.forEach((ch) => {
        chapterMap.set(normalizeChapter(ch.chapter_num), []);
    });

    // Transform slides
    courseSlides.forEach((slide) => {
        const elements: ContentElement[] = [];

        slide.content.forEach((item: any) => {
            const typeLower = item.type?.toLowerCase() || 'text';

            if (
                typeLower === 'title' ||
                typeLower === 'h1' ||
                typeLower === 'slide_title'
            ) {
                elements.push({
                    type: 'h2',
                    content: extractText(item.text || item.content),
                });
            } else if (typeLower === 'section_title' || typeLower === 'h2') {
                elements.push({
                    type: 'h3',
                    content: extractText(item.text || item.content),
                });
            } else if (
                typeLower === 'bullet points' ||
                typeLower === 'bullet_points' ||
                typeLower === 'bullet'
            ) {
                // Check if it's already an array
                let items: string[] = [];
                if (Array.isArray(item.text)) items = item.text.map(extractText);
                else if (typeof item.text === 'string')
                    items = item.text
                        .split('\n')
                        .map((s: string) => s.replace(/^[•-]\s*/, ''));
                else if (Array.isArray(item.content)) items = item.content.map(extractText);
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
                // Ensure we get the correct URL from various possible locations
                let imageUrl = '';

                // 1. Try metadata.image_url (standard)
                if (item.metadata?.image_url) {
                    imageUrl = item.metadata.image_url;
                }
                // 2. Try metadata.url
                else if (item.metadata?.url) {
                    imageUrl = item.metadata.url;
                }
                // 3. Try direct url property
                else if (item.url) {
                    imageUrl = item.url;
                }
                // 4. Fallback: if text/content looks like a URL
                else if (
                    (typeof item.text === 'string' &&
                        item.text.startsWith('http')) ||
                    (typeof item.content === 'string' &&
                        item.content.startsWith('http'))
                ) {
                    imageUrl = item.text || item.content;
                }

                if (imageUrl) {
                    elements.push({
                        type: 'image',
                        content: imageUrl,
                    });
                }
            } else if (typeLower === 'table') {
                const rawRows = item.metadata?.table_data || [];
                const rows = rawRows.map((r: any) => {
                    let rowData = [];
                    if (Array.isArray(r)) rowData = r;
                    else if (r && Array.isArray(r.row)) rowData = r.row;

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

                // Sanitize headers
                const rawHeaders = item.metadata?.table_headers || [];
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

                elements.push({
                    type: 'table',
                    content: {
                        caption: item.metadata?.caption || item.text || 'Table',
                        headers: headers,
                        rows: rows,
                    },
                });
            } else {
                // Default to paragraph
                elements.push({
                    type: 'p',
                    content: extractText(item.text || item.content),
                });
            }
        });

        const structuredSlide: StructuredSlide = {
            slideTitle: slide.slide_title,
            elements: elements,
        };

        const chapterNum = normalizeChapter(slide.chapter || 1);
        if (!chapterMap.has(chapterNum)) {
            chapterMap.set(chapterNum, []);
        }
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
}

export const StructuredJsonView: React.FC<StructuredJsonViewProps> = ({
    data,
    onSave,
    canEdit = true,
}) => {
    // State for navigation
    const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [localData, setLocalData] = useState<StructuredChapter[]>(data);
    const [isSaving, setIsSaving] = useState(false);

    // Reset to start when data changes (only if not editing)
    useEffect(() => {
        if (!isEditing) {
            setCurrentChapterIndex(0);
            setCurrentSlideIndex(0);
            setLocalData(data);
        }
    }, [data]);

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
                    {canEdit && onSave && (
                        <div className="flex items-center gap-2">
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

            {/* Slide Content */}
            <div className="relative min-h-[500px] flex flex-col">
                {currentSlide ? (
                    <Card
                        className={`flex-1 overflow-hidden border-none shadow-xl bg-white dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-300 ring-1 ring-gray-100 dark:ring-gray-700 ${
                            isEditing ? 'ring-2 ring-blue-500' : ''
                        }`}
                    >
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-100 dark:border-gray-700/50 py-6">
                            <div className="flex items-center gap-3 w-full">
                                <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm text-blue-600 dark:text-blue-400 shrink-0">
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
                                {currentSlide.elements.map((element, elIdx) => (
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
