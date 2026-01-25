'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
    Loader2,
    CheckCircle,
    AlertCircle,
    Link as LinkIcon,
    ArrowRight,
} from 'lucide-react';
// import { useAuthStore } from '@/store/auth.store'; // Removed

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface WebSocketMessage {
    status: 'processing' | 'completed' | 'error';
    step?: string;
    message: string;
    document_id?: string;
}

export function UrlImportForm({ className }: { className?: string }) {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<WebSocketMessage['status'] | 'idle'>(
        'idle',
    );
    const [statusMessage, setStatusMessage] = useState('');
    const [documentId, setDocumentId] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    // const { user } = useAuthStore(); // Auth removed

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        /*if (!user) {
            toast.error('You must be logged in to process URLs');
            return;
        }*/

        setIsLoading(true);
        setStatus('processing');
        setProgress(0);
        setStatusMessage('Initiating upload...');

        try {
            const response = await fetch(`${API_BASE_URL}/content/upload-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url,
                    // user_id removed
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to upload URL');
            }

            const data = await response.json();
            const docId = data.document_id;
            setDocumentId(docId);

            // Redirect immediately to processing page which listens to Firestore
            toast.success('Upload successful, starting processing...');
            window.location.href = `/processing/${docId}`;
        } catch (error) {
            console.error('Upload error:', error);
            setStatus('error');
            setStatusMessage(
                error instanceof Error ? error.message : 'An error occurred',
            );
            setIsLoading(false);
            toast.error('Failed to process URL');
        }
    };

    // Removed connectWebSocket function as we use Firestore polling in the processing page

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    return (
        <Card className={`w-full ${className || ''}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <LinkIcon className="w-5 h-5" />
                    Import PDF from URL
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="url"
                                placeholder="https://example.com/document.pdf"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            {isLoading ? 'Processing' : 'Process'}
                        </Button>
                    </div>

                    {(status !== 'idle' || progress > 0) && (
                        <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium capitalize flex items-center gap-2">
                                    {status === 'processing' && (
                                        <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                                    )}
                                    {status === 'completed' && (
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                    )}
                                    {status === 'error' && (
                                        <AlertCircle className="w-3 h-3 text-red-500" />
                                    )}
                                    {status}
                                </span>
                                <span className="text-muted-foreground">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                                {statusMessage}
                            </p>

                            {status === 'completed' && documentId && (
                                <div className="mt-4 pt-2 border-t border-border">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() =>
                                            (window.location.href = `/course/${documentId}`)
                                        }
                                    >
                                        View Result{' '}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
