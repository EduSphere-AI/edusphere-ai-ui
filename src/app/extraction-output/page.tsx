'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import {
    FileTextIcon,
    DownloadIcon,
    CalendarIcon,
    LayersIcon,
    ImageIcon,
    TableIcon,
    ChevronRightIcon,
    CheckCircleIcon,
    BookOpenIcon,
    ListIcon,
    SparklesIcon,
    AlertCircleIcon,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import mockExtractionResult from '@/output/extraction/extraction_result.json';

/* ================================
   Types (UNCHANGED)
================================ */
interface ExtractionData {
    metadata: {
        source_file: string;
        extraction_timestamp: string;
        extractor_version: string;
        ollama_enabled?: boolean;
    };
    document_info: {
        total_pages: number;
        baseline_font_size?: number;
    };
    pages: Array<{
        page_number: number;
        header?: string;
        footer?: string;
        title?: string;
        elements: Array<{
            id: string;
            type: string;
            content: string;
        }>;
    }>;
    sections: Array<{
        title: string;
        bullet_points?: string[][];
        paragraphs?: string[];
        figures?: any[];
        tables?: any[];
        subsections?: any[];
    }>;
    summary: {
        title?: string;
        main_summary?: string;
        key_points?: string[];
        topics?: string[];
        document_type?: string;
    };
}

/* ================================
   Supabase Client
================================ */
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/* ================================
   Normalizer (supports multiple models)
================================ */
function normalizeExtractionData(raw: any): ExtractionData {
    if (raw.json_data) raw = raw.json_data;
    if (raw.output) raw = raw.output;

    return {
        metadata: raw.metadata ?? {
            source_file: raw.filename ?? 'document',
            extraction_timestamp: raw.created_at ?? new Date().toISOString(),
            extractor_version: raw.model ?? 'unknown',
        },
        document_info: raw.document_info ?? {
            total_pages: raw.pages?.length ?? 0,
        },
        pages: raw.pages ?? [],
        sections: raw.sections ?? [],
        summary: raw.summary ?? {
            main_summary: raw.summary_text ?? '',
        },
    };
}

export default function ExtractionOutput() {
    const searchParams = useSearchParams();
    const documentId = searchParams.get('doc'); // passed from dashboard

    const [data, setData] = useState<ExtractionData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedPage, setSelectedPage] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<
        'overview' | 'pages' | 'sections'
    >('overview');

    /* ================================
       AUTO FETCH FROM SERVER
    ================================ */
    useEffect(() => {
        if (!documentId) {
            setError('Missing document ID');
            return;
        }

        const fetchData = async () => {
            if (documentId === 'doc-1') {
                try {
                    const normalized =
                        normalizeExtractionData(mockExtractionResult);
                    setData(normalized);

                    if (normalized.pages?.length) {
                        setSelectedPage(normalized.pages[0].page_number);
                    }
                } catch (err: any) {
                    setError(err.message ?? 'Failed to load mock data');
                }
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('extraction_results')
                    .select('json_data')
                    .eq('document_id', documentId)
                    .single();

                if (error) throw error;

                const normalized = normalizeExtractionData(data);
                setData(normalized);

                if (normalized.pages?.length) {
                    setSelectedPage(normalized.pages[0].page_number);
                }
            } catch (err: any) {
                setError(err.message ?? 'Failed to fetch extraction data');
            }
        };

        fetchData();
    }, [documentId]);

    /* ================================
       Loading / Error State
    ================================ */
    if (!data && !error) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
                <div className="text-center">
                    <SparklesIcon
                        className="mx-auto mb-4 text-blue-600"
                        size={48}
                    />
                    <p className="font-semibold text-gray-700">
                        Processing extraction results…
                    </p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-center gap-3">
                    <AlertCircleIcon className="text-red-600" />
                    <p className="text-red-700 font-medium">{error}</p>
                </div>
            </main>
        );
    }

    /* ================================
       EVERYTHING BELOW = YOUR UI
       (UNCHANGED RENDERING)
    ================================ */

    // ⬇️ From here onward, your existing JSX stays exactly the same
    // Stats, tabs, pages, sections, buttons, etc.
    // No visual changes.

    return (
        <>
            {/* 🔥 PASTE YOUR EXISTING JSX HERE FROM:
               "Header Section" onward — NO CHANGES REQUIRED */}
        </>
    );
}
