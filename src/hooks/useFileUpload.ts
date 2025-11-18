/**
 * Custom React hook for file uploads (client-side only)
 */

'use client';

import { useState, useCallback } from 'react';
import { uploadFileWithMetadata } from '@/lib/upload-utils';

interface UploadState {
    isUploading: boolean;
    progress: number;
    error: string | null;
    uploadedFile: {
        fileId: string;
        publicUrl: string;
        fileName: string;
        metadata: {
            originalFileName: string;
            fileSize: number;
            mimeType: string;
            uploadedAt: string;
        };
    } | null;
}

interface UseFileUploadOptions {
    onSuccess?: (data: UploadState['uploadedFile']) => void;
    onError?: (error: string) => void;
    maxSize?: number; // in bytes
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
    const { onSuccess, onError, maxSize = 5 * 1024 * 1024 } = options; // Default 5MB

    const [state, setState] = useState<UploadState>({
        isUploading: false,
        progress: 0,
        error: null,
        uploadedFile: null,
    });

    const upload = useCallback(
        async (file: File, userId: string) => {
            setState({
                isUploading: true,
                progress: 0,
                error: null,
                uploadedFile: null,
            });

            try {
                if (!file.name.endsWith('.pdf')) {
                    const error = 'Only PDF files are allowed';
                    setState((prev) => ({
                        ...prev,
                        isUploading: false,
                        error,
                    }));
                    onError?.(error);
                    return null;
                }

                if (file.size > maxSize) {
                    const error = `File size must be less than ${maxSize / 1024 / 1024}MB`;
                    setState((prev) => ({
                        ...prev,
                        isUploading: false,
                        error,
                    }));
                    onError?.(error);
                    return null;
                }

                setState((prev) => ({ ...prev, progress: 25 }));

                const result = await uploadFileWithMetadata(file, userId);

                if (!result.success) {
                    throw new Error(result.error || 'Upload failed');
                }

                setState((prev) => ({ ...prev, progress: 75 }));

                const uploadData = {
                    fileId: result.fileId!,
                    publicUrl: result.publicUrl!,
                    fileName: result.fileName!,
                    metadata: result.metadata!,
                };

                setState({
                    isUploading: false,
                    progress: 100,
                    error: null,
                    uploadedFile: uploadData,
                });

                onSuccess?.(uploadData);

                return uploadData;
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : 'Upload failed';

                setState({
                    isUploading: false,
                    progress: 0,
                    error: errorMessage,
                    uploadedFile: null,
                });

                onError?.(errorMessage);
                return null;
            }
        },
        [maxSize, onSuccess, onError],
    );

    const reset = useCallback(() => {
        setState({
            isUploading: false,
            progress: 0,
            error: null,
            uploadedFile: null,
        });
    }, []);

    return {
        upload,
        reset,
        ...state,
    };
}
