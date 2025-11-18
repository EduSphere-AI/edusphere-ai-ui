'use client';

import { supabase, STORAGE_BUCKET } from './supabase';

/**
 * Upload file directly to Supabase storage (client-side)
 */
export async function uploadFileWithMetadata(file: File, userId: string) {
    try {
        // Validate file
        if (!file.name.endsWith('.pdf')) {
            return {
                success: false,
                error: 'Only PDF files are allowed',
            };
        }

        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_FILE_SIZE) {
            return {
                success: false,
                error: `File size must be less than 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
            };
        }

        // Ensure bucket exists
        const bucketResult = await supabase.storage.getBucket(STORAGE_BUCKET);
        if (!bucketResult.data) {
            await supabase.storage.createBucket(STORAGE_BUCKET, {
                public: true,
            });
        }

        // Upload file to Supabase
        const timestamp = Date.now();
        const fileName = `${userId}/${timestamp}-${file.name}`;

        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('Supabase upload error:', error);
            throw new Error(error.message);
        }

        // Get public URL
        const {
            data: { publicUrl },
        } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);

        console.log('✅ File uploaded to Supabase:', {
            path: data.path,
            publicUrl,
        });

        return {
            success: true,
            path: data.path,
            publicUrl,
            fileName: data.path.split('/').pop() || file.name,
            fileId: fileName, // Use path as ID
            metadata: {
                originalFileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                uploadedAt: new Date().toISOString(),
            },
        };
    } catch (error) {
        console.error('❌ Upload error:', error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to upload file',
        };
    }
}
