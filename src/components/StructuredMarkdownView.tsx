import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

// Simple Markdown Parser
const parseMarkdown = (markdown: string) => {
    if (!markdown) return [];

    const lines = markdown.trim().split('\n');
    const elements: any[] = [];
    let currentList: any = null;

    lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Headers
        if (trimmed.startsWith('## ')) {
            if (currentList) {
                elements.push(currentList);
                currentList = null;
            }
            elements.push({ type: 'h2', content: trimmed.substring(3) });
        } else if (trimmed.startsWith('### ')) {
            if (currentList) {
                elements.push(currentList);
                currentList = null;
            }
            elements.push({ type: 'h3', content: trimmed.substring(4) });
        } else if (trimmed.startsWith('# ')) {
            if (currentList) {
                elements.push(currentList);
                currentList = null;
            }
            elements.push({ type: 'h1', content: trimmed.substring(2) });
        }
        // List items
        else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const content = trimmed.substring(2);
            if (!currentList) {
                currentList = { type: 'ul', items: [] };
            }
            currentList.items.push(content);
        }
        // Numbered lists
        else if (/^\d+\.\s/.test(trimmed)) {
            const content = trimmed.replace(/^\d+\.\s/, '');
            if (!currentList || currentList.type !== 'ol') {
                if (currentList) elements.push(currentList);
                currentList = { type: 'ol', items: [] };
            }
            currentList.items.push(content);
        }
        // Horizontal rule
        else if (trimmed === '---') {
            if (currentList) {
                elements.push(currentList);
                currentList = null;
            }
            elements.push({ type: 'hr' });
        }
        // Regular paragraph
        else {
            if (currentList) {
                elements.push(currentList);
                currentList = null;
            }
            elements.push({ type: 'p', content: trimmed });
        }
    });

    if (currentList) {
        elements.push(currentList);
    }

    return elements;
};

interface StructuredMarkdownViewProps {
    markdown: string;
}

export const StructuredMarkdownView: React.FC<StructuredMarkdownViewProps> = ({
    markdown,
}) => {
    const elements = parseMarkdown(markdown);

    return (
        <Card className="bg-white dark:bg-gray-800/50 border-none shadow-sm">
            <CardContent className="p-6 sm:p-10 max-w-4xl mx-auto">
                <div className="space-y-4">
                    {elements.map((element, idx) => {
                        if (element.type === 'h1') {
                            return (
                                <h1
                                    key={idx}
                                    className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 pb-2 border-b border-gray-200 dark:border-gray-700"
                                >
                                    {element.content.replace(
                                        /\*\*(.*?)\*\*/g,
                                        '$1',
                                    )}
                                </h1>
                            );
                        }
                        if (element.type === 'h2') {
                            return (
                                <h2
                                    key={idx}
                                    className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4"
                                >
                                    {element.content.replace(
                                        /\*\*(.*?)\*\*/g,
                                        '$1',
                                    )}
                                </h2>
                            );
                        }
                        if (element.type === 'h3') {
                            return (
                                <h3
                                    key={idx}
                                    className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3"
                                >
                                    {element.content.replace(
                                        /\*\*(.*?)\*\*/g,
                                        '$1',
                                    )}
                                </h3>
                            );
                        }
                        if (element.type === 'p') {
                            // Simple bold parsing
                            const parts =
                                element.content.split(/(\*\*.*?\*\*)/g);
                            return (
                                <p
                                    key={idx}
                                    className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed"
                                >
                                    {parts.map((part: string, i: number) => {
                                        if (
                                            part.startsWith('**') &&
                                            part.endsWith('**')
                                        ) {
                                            return (
                                                <strong
                                                    key={i}
                                                    className="font-semibold text-gray-900 dark:text-gray-100"
                                                >
                                                    {part.slice(2, -2)}
                                                </strong>
                                            );
                                        }
                                        return part;
                                    })}
                                </p>
                            );
                        }
                        if (element.type === 'ul') {
                            return (
                                <ul key={idx} className="space-y-2 mb-6 ml-4">
                                    {element.items.map(
                                        (item: string, i: number) => {
                                            const parts =
                                                item.split(/(\*\*.*?\*\*)/g);
                                            return (
                                                <li
                                                    key={i}
                                                    className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                                                    <span className="leading-relaxed">
                                                        {parts.map(
                                                            (part, pi) => {
                                                                if (
                                                                    part.startsWith(
                                                                        '**',
                                                                    ) &&
                                                                    part.endsWith(
                                                                        '**',
                                                                    )
                                                                ) {
                                                                    return (
                                                                        <strong
                                                                            key={
                                                                                pi
                                                                            }
                                                                            className="font-semibold text-gray-900 dark:text-gray-100"
                                                                        >
                                                                            {part.slice(
                                                                                2,
                                                                                -2,
                                                                            )}
                                                                        </strong>
                                                                    );
                                                                }
                                                                return part;
                                                            },
                                                        )}
                                                    </span>
                                                </li>
                                            );
                                        },
                                    )}
                                </ul>
                            );
                        }
                        if (element.type === 'ol') {
                            return (
                                <ol
                                    key={idx}
                                    className="space-y-2 mb-6 ml-4 list-decimal list-inside text-gray-700 dark:text-gray-300"
                                >
                                    {element.items.map(
                                        (item: string, i: number) => (
                                            <li
                                                key={i}
                                                className="pl-2 leading-relaxed"
                                            >
                                                {item.replace(
                                                    /\*\*(.*?)\*\*/g,
                                                    '$1',
                                                )}
                                            </li>
                                        ),
                                    )}
                                </ol>
                            );
                        }
                        if (element.type === 'hr') {
                            return (
                                <hr
                                    key={idx}
                                    className="my-8 border-gray-200 dark:border-gray-700"
                                />
                            );
                        }
                        return null;
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
