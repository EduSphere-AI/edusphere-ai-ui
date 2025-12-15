'use client';

import { useState, useMemo } from 'react';
import data from './result.json';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface TableData {
    page: number;
    table_number: number;
    table: (string | number | null)[][];
}

interface Section {
    section: string;
    summary: string[];
}

interface Document {
    source_file: string;
    sections: Section[];
    tables: TableData[];
}

const Page = () => {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set([data[0]?.sections[0]?.section || '']),
    );
    const [expandedTables, setExpandedTables] = useState<Set<number>>(
        new Set(),
    );
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const document: Document = useMemo(() => data[0] || {}, []);

    const toggleSection = (sectionName: string) => {
        const newSet = new Set(expandedSections);
        if (newSet.has(sectionName)) {
            newSet.delete(sectionName);
        } else {
            newSet.add(sectionName);
        }
        setExpandedSections(newSet);
    };

    const toggleTable = (tableId: number) => {
        const newSet = new Set(expandedTables);
        if (newSet.has(tableId)) {
            newSet.delete(tableId);
        } else {
            newSet.add(tableId);
        }
        setExpandedTables(newSet);
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-offwhite-pink-blue relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-10 left-5 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-5 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700" />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10">
                {/* Header Section */}
                <div className="mb-8 sm:mb-12">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">
                                Document Analysis
                            </h1>
                            <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg font-medium mt-2">
                                Comprehensive breakdown of your uploaded
                                document
                            </p>
                        </div>
                        <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-linear-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg">
                            <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-6">
                        <Badge className="bg-linear-to-r from-blue-600 to-cyan-600 text-white text-sm px-3 py-1 shadow-md">
                            📄 {document.source_file}
                        </Badge>
                        <Badge
                            variant="outline"
                            className="text-gray-700 dark:text-gray-300 border-2"
                        >
                            {document.sections?.length || 0} Sections
                        </Badge>
                        <Badge
                            variant="outline"
                            className="text-gray-700 dark:text-gray-300 border-2"
                        >
                            {document.tables?.length || 0} Tables
                        </Badge>
                    </div>
                </div>

                {/* Sections */}
                <div className="mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        📌 Content Sections
                    </h2>

                    <div className="space-y-4">
                        {document.sections?.map((section, idx) => {
                            const sectionId = `section-${idx}`;
                            const isExpanded = expandedSections.has(
                                section.section,
                            );

                            return (
                                <Card
                                    key={sectionId}
                                    className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all overflow-hidden relative"
                                >
                                    <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

                                    <button
                                        onClick={() =>
                                            toggleSection(section.section)
                                        }
                                        className="w-full text-left relative z-10"
                                    >
                                        <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors pb-3 sm:pb-4">
                                            <div className="flex-1 space-y-1">
                                                <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-gray-100 flex items-center gap-3">
                                                    <span className="text-lg">
                                                        {idx + 1}.
                                                    </span>
                                                    <span className="line-clamp-2">
                                                        {section.section}
                                                    </span>
                                                </CardTitle>
                                                <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                    {section.summary?.length ||
                                                        0}{' '}
                                                    paragraph
                                                    {section.summary?.length !==
                                                    1
                                                        ? 's'
                                                        : ''}
                                                </CardDescription>
                                            </div>
                                            <div className="ml-4">
                                                {isExpanded ? (
                                                    <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform" />
                                                )}
                                            </div>
                                        </CardHeader>
                                    </button>

                                    {isExpanded && (
                                        <CardContent className="relative z-10 space-y-4 sm:space-y-5 border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-5">
                                            {section.summary?.map(
                                                (para, pIdx) => (
                                                    <div
                                                        key={`para-${idx}-${pIdx}`}
                                                        className="group"
                                                    >
                                                        <div className="flex items-start gap-3 sm:gap-4">
                                                            <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 shrink-0">
                                                                •
                                                            </span>
                                                            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed flex-1">
                                                                {para}
                                                            </p>
                                                        </div>
                                                        <div className="mt-2 flex justify-end">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    handleCopy(
                                                                        para,
                                                                        `para-${idx}-${pIdx}`,
                                                                    )
                                                                }
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs sm:text-sm"
                                                            >
                                                                {copiedId ===
                                                                `para-${idx}-${pIdx}` ? (
                                                                    <>
                                                                        <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-green-600 dark:text-green-400" />
                                                                        Copied
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                                        Copy
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Tables */}
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        📊 Data Tables
                    </h2>

                    <div className="space-y-6">
                        {document.tables?.map((tableObj, tIdx) => {
                            const tableId = tIdx;
                            const isExpanded = expandedTables.has(tableId);
                            const hasContent = tableObj.table?.some((row) =>
                                row.some(
                                    (cell) => cell !== null && cell !== '',
                                ),
                            );

                            if (!hasContent) return null;

                            return (
                                <Card
                                    key={`table-${tableId}`}
                                    className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all overflow-hidden relative"
                                >
                                    <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

                                    <button
                                        onClick={() => toggleTable(tableId)}
                                        className="w-full text-left relative z-10"
                                    >
                                        <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors pb-3 sm:pb-4">
                                            <div className="flex-1 space-y-1">
                                                <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-gray-100 flex items-center gap-2 sm:gap-3">
                                                    <span className="inline-block">
                                                        📋 Table{' '}
                                                        {tableObj.table_number}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        Page {tableObj.page}
                                                    </Badge>
                                                </CardTitle>
                                                <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                    {tableObj.table.length} row
                                                    {tableObj.table.length !== 1
                                                        ? 's'
                                                        : ''}
                                                    {' × '}
                                                    {
                                                        (
                                                            tableObj.table[0] ||
                                                            []
                                                        ).length
                                                    }{' '}
                                                    column
                                                    {(tableObj.table[0] || [])
                                                        .length !== 1
                                                        ? 's'
                                                        : ''}
                                                </CardDescription>
                                            </div>
                                            <div className="ml-4">
                                                {isExpanded ? (
                                                    <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform" />
                                                )}
                                            </div>
                                        </CardHeader>
                                    </button>

                                    {isExpanded && (
                                        <CardContent className="relative z-10 border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-5 overflow-x-auto">
                                            <table className="w-full text-xs sm:text-sm border-collapse">
                                                <tbody>
                                                    {tableObj.table.map(
                                                        (row, rIdx) => (
                                                            <tr
                                                                key={`row-${tableId}-${rIdx}`}
                                                                className={
                                                                    rIdx % 2 ===
                                                                    0
                                                                        ? 'bg-gray-50 dark:bg-gray-800/50'
                                                                        : 'bg-white dark:bg-gray-900'
                                                                }
                                                            >
                                                                {row.map(
                                                                    (
                                                                        cell,
                                                                        cIdx,
                                                                    ) => (
                                                                        <td
                                                                            key={`cell-${tableId}-${rIdx}-${cIdx}`}
                                                                            className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                                                                        >
                                                                            {cell ??
                                                                                '—'}
                                                                        </td>
                                                                    ),
                                                                )}
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Page;
