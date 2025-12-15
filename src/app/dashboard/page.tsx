'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/store/auth.store';
import {
    Upload,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Sparkles,
    Plus,
    Download,
    Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { listUserFiles } from '@/lib/supabase';
import { uploadFileWithMetadata } from '@/lib/upload-utils';
import { saveFileMetadata } from '@/lib/firestore-client';
import { toast } from 'sonner';
import { UrlImportForm } from '@/components/url-import-form';

interface Document {
    id: string;
    title: string;
    uploadDate: string;
    status: 'Processing' | 'Completed' | 'Error';
    fileUrl?: string;
    filePath?: string;
}

type DocumentStatus = Document['status'];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ACCEPTED_FILE_TYPES = '.pdf';

const extractOriginalFilename = (fileName: string): string => {
    const match = fileName.match(/^\d+-(.+)$/);
    return match ? match[1] : fileName;
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const StatusBadge = ({ status }: { status: DocumentStatus }) => {
    const statusConfig = useMemo(
        () => ({
            Completed: {
                className:
                    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-200 dark:border-green-800',
                icon: CheckCircle,
                label: 'Completed',
            },
            Processing: {
                className:
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-800',
                icon: Clock,
                label: 'Processing',
            },
            Error: {
                className:
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-2 border-red-200 dark:border-red-800',
                icon: XCircle,
                label: 'Error',
            },
        }),
        [],
    );

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge className={`${config.className} shadow-md font-semibold`}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
        </Badge>
    );
};

const DocumentActionButton = ({
    status,
    docId,
    onNavigate,
}: {
    status: DocumentStatus;
    docId: string;
    onNavigate: (path: string) => void;
}) => {
    const actionConfig = useMemo(
        () => ({
            Completed: {
                label: 'View',
                icon: Eye,
                path: `/course/${docId}`,
                className:
                    'border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-500',
            },
            Processing: {
                label: 'View Progress',
                icon: Eye,
                path: `/processing/${docId}`,
                className:
                    'border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-500',
            },
            Error: {
                label: 'Retry',
                icon: XCircle,
                path: '#',
                className:
                    'border-2 border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-700',
            },
        }),
        [docId],
    );

    const config = actionConfig[status];
    const Icon = config.icon;

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate(config.path)}
            className={`${config.className} transition-all font-semibold`}
        >
            <Icon className="h-4 w-4 mr-2" />
            {config.label}
        </Button>
    );
};

const FileUploadZone = ({
    onFileSelect,
    isUploading,
}: {
    onFileSelect: (file: File) => void;
    isUploading: boolean;
}) => {
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            if (isUploading) return;
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                onFileSelect(files[0]);
            }
        },
        [onFileSelect, isUploading],
    );

    const handleFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (isUploading) return;
            const files = e.target.files;
            if (files && files.length > 0) {
                onFileSelect(files[0]);
            }
        },
        [onFileSelect, isUploading],
    );

    return (
        <Card className="mb-8 sm:mb-12 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
            <CardHeader className="relative">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-linear-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg">
                        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl text-gray-900 dark:text-gray-100">
                        Upload Academic Article
                    </CardTitle>
                </div>
                <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
                    Upload PDF articles to automatically generate teaching
                    slides and materials
                </CardDescription>
            </CardHeader>
            <CardContent className="relative">
                <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed border-blue-600 rounded-xl p-8 sm:p-12 text-center bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all ${isUploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} group relative overflow-hidden`}
                >
                    <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-cyan-500/5 pointer-events-none" />
                    <div className="flex flex-col items-center space-y-4 sm:space-y-6 relative z-10">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg animate-bounce-slow">
                            {isUploading ? (
                                <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 text-white animate-spin" />
                            ) : (
                                <Upload className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                                {isUploading
                                    ? 'Uploading...'
                                    : 'Drop your PDF here'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                {isUploading
                                    ? 'Please wait while we upload your file'
                                    : 'or click to upload • Max size: 5MB'}
                            </p>
                        </div>
                        <label htmlFor="file-upload">
                            <Button
                                size="lg"
                                disabled={isUploading}
                                className="shadow-xl bg-linear-to-r from-blue-600 to-cyan-600 hover:shadow-2xl transition-all font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                asChild
                            >
                                <span>
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Select PDF
                                        </>
                                    )}
                                </span>
                            </Button>
                            <input
                                id="file-upload"
                                type="file"
                                accept={ACCEPTED_FILE_TYPES}
                                onChange={handleFileInputChange}
                                disabled={isUploading}
                                className="hidden"
                                aria-label="Upload PDF file"
                            />
                        </label>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function Dashboard() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const documentCount = useMemo(() => documents.length, [documents.length]);

    useEffect(() => {
        const fetchUserFiles = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                const result = await listUserFiles(user.id);

                if (result.success && result.files) {
                    const formattedDocs: Document[] = result.files.map(
                        (file) => ({
                            id: file.id,
                            title: extractOriginalFilename(file.name),
                            uploadDate: new Date(file.createdAt)
                                .toISOString()
                                .split('T')[0],
                            status: 'Completed',
                            fileUrl: file.publicUrl,
                            filePath: file.path,
                        }),
                    );

                    setDocuments(formattedDocs);
                }
            } catch (error) {
                console.error('Error fetching user files:', error);
                toast.error('Failed to load your files');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserFiles();
    }, [user]);

    const handleFileSelect = useCallback(
        async (file: File) => {
            if (!user) {
                toast.error('Please log in to upload files');
                return;
            }

            if (!file.name.endsWith('.pdf')) {
                toast.warning('Please upload a PDF file');
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                toast.warning(
                    `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
                );
                return;
            }

            setIsUploading(true);

            try {
                console.log('Uploading file to Supabase...', {
                    fileName: file.name,
                    fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                    userId: user.id,
                });

                const uploadResult = await uploadFileWithMetadata(
                    file,
                    user.id,
                );

                if (!uploadResult.success) {
                    throw new Error(uploadResult.error || 'Upload failed');
                }

                toast.success('File uploaded successfully!');

                console.log('File uploaded successfully!', {
                    path: uploadResult.path,
                    publicUrl: uploadResult.publicUrl,
                    fileId: uploadResult.fileId,
                    metadata: uploadResult.metadata,
                });

                console.log('📥 File Download URL:', uploadResult.publicUrl);
                console.log('🔥 File ID:', uploadResult.fileId);

                // Save file metadata to Firestore
                const firestoreSave = await saveFileMetadata({
                    userId: user.id,
                    fileName: uploadResult.fileName || file.name,
                    originalFileName: file.name,
                    fileSize: file.size,
                    mimeType: file.type,
                    supabasePath: uploadResult.path || '',
                    supabasePublicUrl: uploadResult.publicUrl || '',
                    supabaseBucket: 'documents',
                    status: 'uploaded',
                });

                if (!firestoreSave.success) {
                    console.error(
                        'Failed to save to Firestore:',
                        firestoreSave.error,
                    );
                    toast.error('File uploaded but failed to save metadata');
                }

                const newDoc: Document = {
                    id:
                        firestoreSave.fileId ||
                        uploadResult.fileId ||
                        String(Date.now()),
                    title: file.name,
                    uploadDate: new Date().toISOString().split('T')[0],
                    status: 'Processing',
                    fileUrl: uploadResult.publicUrl,
                    filePath: uploadResult.path,
                };

                setDocuments((prev) => [newDoc, ...prev]);

                toast.success(
                    `File uploaded successfully!\n\nFirestore ID: ${firestoreSave.fileId}`,
                );

                // setTimeout(() => {
                //     router.push(`/processing/${newDoc.id}`);
                // }, 1000);
            } catch (error) {
                console.error('Upload error:', error);
                toast.error(
                    `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
                );
            } finally {
                setIsUploading(false);
            }
        },
        [router, user],
    );

    const handleNavigate = useCallback(
        (path: string) => {
            if (path !== '#') {
                router.push(path);
            }
        },
        [router],
    );

    return (
        <div className="min-h-screen bg-gradient-offwhite-pink-blue relative overflow-hidden">
            <div className="absolute top-10 left-5 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-5 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10">
                <div className="mb-8 sm:mb-12 space-y-2">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">
                        Dashboard
                    </h1>
                    <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg font-medium">
                        Upload academic papers and transform them into teaching
                        materials instantly
                    </p>
                </div>

                <FileUploadZone
                    onFileSelect={handleFileSelect}
                    isUploading={isUploading}
                />

                <UrlImportForm className="mb-8 sm:mb-12 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl relative overflow-hidden" />

                <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
                    <CardHeader className="relative">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl sm:text-2xl text-gray-900 dark:text-gray-100">
                                    Uploaded Documents
                                </CardTitle>
                                <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                                    View and manage your uploaded academic
                                    articles
                                </CardDescription>
                            </div>
                            <Badge className="w-fit bg-linear-to-r from-blue-600 to-cyan-600 text-white text-sm sm:text-base px-4 py-2 shadow-lg">
                                {documentCount}{' '}
                                {documentCount === 1 ? 'Document' : 'Documents'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="overflow-x-auto">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        Loading your documents...
                                    </p>
                                </div>
                            ) : documents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400 text-base font-semibold mb-2">
                                        No documents uploaded yet
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-500 text-sm">
                                        Upload your first PDF to get started
                                    </p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-gray-200 dark:border-gray-700">
                                            <TableHead className="text-gray-700 dark:text-gray-300 font-bold">
                                                Title
                                            </TableHead>
                                            <TableHead className="text-gray-700 dark:text-gray-300 font-bold">
                                                Upload Date
                                            </TableHead>
                                            <TableHead className="text-gray-700 dark:text-gray-300 font-bold">
                                                Status
                                            </TableHead>
                                            <TableHead className="text-right text-gray-700 dark:text-gray-300 font-bold">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {documents.map((doc) => (
                                            <TableRow
                                                key={doc.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-gray-200 dark:border-gray-700"
                                            >
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 flex items-center justify-center bg-linear-to-br from-blue-600 to-cyan-600 rounded-lg shadow-md">
                                                            <FileText className="h-5 w-5 text-white" />
                                                        </div>
                                                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                                                            {doc.title}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                                                    {doc.uploadDate}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge
                                                        status={doc.status}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {doc.fileUrl && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    window.open(
                                                                        doc.fileUrl,
                                                                        '_blank',
                                                                    );
                                                                    console.log(
                                                                        '📥 Download URL:',
                                                                        doc.fileUrl,
                                                                    );
                                                                }}
                                                                className="border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-green-400 dark:hover:border-green-500 transition-all font-semibold"
                                                            >
                                                                <Download className="h-4 w-4 mr-2" />
                                                                <span className="hidden sm:inline">
                                                                    Download
                                                                </span>
                                                            </Button>
                                                        )}
                                                        <DocumentActionButton
                                                            status={doc.status}
                                                            docId={doc.id}
                                                            onNavigate={
                                                                handleNavigate
                                                            }
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>

            <div className="fixed bottom-8 right-8 z-50">
                <label htmlFor="fab-upload" className="cursor-pointer group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-cyan-600 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                        <Button
                            size="lg"
                            className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-linear-to-r from-blue-600 to-cyan-600 hover:scale-110 active:scale-95 shadow-2xl transition-transform"
                            asChild
                        >
                            <span>
                                <Plus className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                            </span>
                        </Button>
                    </div>
                    <input
                        id="fab-upload"
                        type="file"
                        accept={ACCEPTED_FILE_TYPES}
                        disabled={isUploading}
                        onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                                handleFileSelect(files[0]);
                            }
                        }}
                        className="hidden"
                        aria-label="Quick upload PDF file"
                    />
                </label>
            </div>
        </div>
    );
}
