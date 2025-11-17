import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file',
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name
export const STORAGE_BUCKET = 'uploads';

/**
 * Upload a file to Supabase storage
 * @param file - File to upload
 * @param userId - User ID for file organization
 * @returns Upload result with download URL
 */
export async function uploadFile(file: File, userId: string) {
    try {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${timestamp}-${file.name}`;

        const bucketResult = await supabase.storage.getBucket(STORAGE_BUCKET);
        if (!bucketResult.data) {
            await supabase.storage.createBucket(STORAGE_BUCKET, {
                public: true,
            });
        }

        // Upload file to Supabase storage
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            throw error;
        }

        // Get public URL for the uploaded file
        const {
            data: { publicUrl },
        } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);

        return {
            success: true,
            path: data.path,
            publicUrl,
            fileName: file.name,
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to upload file',
        };
    }
}

/**
 * Delete a file from Supabase storage
 * @param filePath - Path of the file to delete
 */
export async function deleteFile(filePath: string) {
    try {
        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([filePath]);

        if (error) {
            throw error;
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting file:', error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to delete file',
        };
    }
}

/**
 * Get download URL for a file
 * @param filePath - Path of the file
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 */
export async function getDownloadUrl(
    filePath: string,
    expiresIn: number = 3600,
) {
    try {
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(filePath, expiresIn);

        if (error) {
            throw error;
        }

        return {
            success: true,
            signedUrl: data.signedUrl,
        };
    } catch (error) {
        console.error('Error getting download URL:', error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to get download URL',
        };
    }
}

/**
 * List all files uploaded by a user
 * @param userId - User ID to filter files
 */
export async function listUserFiles(userId: string) {
    try {
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .list(userId, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' },
            });

        if (error) {
            throw error;
        }

        // Get public URLs for all files
        const filesWithUrls = data.map((file) => {
            const filePath = `${userId}/${file.name}`;
            const {
                data: { publicUrl },
            } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

            return {
                id: file.id,
                name: file.name,
                path: filePath,
                publicUrl,
                createdAt: file.created_at,
                updatedAt: file.updated_at,
                size: file.metadata?.size || 0,
            };
        });

        return {
            success: true,
            files: filesWithUrls,
        };
    } catch (error) {
        console.error('Error listing user files:', error);
        return {
            success: false,
            error:
                error instanceof Error ? error.message : 'Failed to list files',
            files: [],
        };
    }
}
