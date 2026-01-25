'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/constants';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface ProcessingStatus {
    status: 'processing' | 'completed' | 'error';
    step?: string;
    message?: string;
}

export default function ProcessingPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug: documentId } = use(params);
    const router = useRouter();
    const [status, setStatus] = useState<ProcessingStatus>({
        status: 'processing',
        step: 'starting',
        message: 'Initializing...',
    });
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!documentId) return;

        // The backend `process_full_pipeline` creates a job with ID `job_${documentId}`
        const jobId = `job_${documentId}`;
        console.log('Listening to job:', jobId);

        const jobRef = doc(db, 'jobs', jobId);
        const unsubscribe = onSnapshot(
            jobRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    console.log('Firestore Job Update:', data);

                    setStatus({
                        status: data.status,
                        step: data.stage,
                        message: data.message || 'Processing...',
                    });

                    // Calculate progress based on stage
                    if (data.status === 'completed') {
                        setProgress(100);
                        toast.success('Processing completed successfully!');
                        setTimeout(() => {
                            router.push(`/course/${documentId}`);
                        }, 1000);
                    } else if (data.status === 'error') {
                        toast.error(
                            `Processing failed: ${data.message || 'Unknown error'}`,
                        );
                        setStatus((prev) => ({ ...prev, status: 'error' }));
                    } else {
                        // process_full_pipeline stages:
                        // started -> extraction -> extraction_done -> chunking -> summarization -> generation_done
                        const stage = data.stage;
                        switch (stage) {
                            case 'started':
                                setProgress(10);
                                break;
                            case 'extraction':
                                setProgress(25);
                                break;
                            case 'extraction_done':
                                setProgress(40);
                                break;
                            case 'chunking':
                                setProgress(55);
                                break;
                            case 'summarization':
                                setProgress(80);
                                break;
                            case 'generation_done':
                                setProgress(100);
                                break;
                            default:
                                // Keep current progress if unknown stage, but ensure at least minimal visible progress
                                if (progress < 10) setProgress(5);
                        }
                    }
                } else {
                    console.log('Job document not found yet - waiting...');
                }
            },
            (error) => {
                console.error('Firestore Error:', error);
                // Don't show error immediately as it might be transient
            },
        );

        return () => unsubscribe();
    }, [documentId, router]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">
                        Processing Document
                    </CardTitle>
                    <CardDescription>
                        Please wait while we analyze and transform your content
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center py-4">
                        {status.status === 'processing' && (
                            <div className="relative">
                                <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                                    {progress}%
                                </div>
                            </div>
                        )}
                        {status.status === 'completed' && (
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        )}
                        {status.status === 'error' && (
                            <AlertCircle className="h-16 w-16 text-red-500" />
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Status</span>
                            <span className="text-gray-500 capitalize">
                                {status.step || status.status}
                            </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-sm text-center text-gray-500 mt-2">
                            {status.message}
                        </p>
                    </div>

                    {status.status === 'error' && (
                        <Button
                            className="w-full"
                            onClick={() => router.push('/dashboard')}
                        >
                            Return to Dashboard
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
