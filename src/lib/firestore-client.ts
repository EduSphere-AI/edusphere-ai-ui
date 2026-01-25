'use client';

import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    getDocs,
} from 'firebase/firestore';
import { db } from './firebase';

export interface FileMetadata {
    // userId: string; // Removed
    fileName: string;
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    supabasePath: string;
    supabasePublicUrl: string;
    supabaseBucket: string;
    status: 'uploaded' | 'processing' | 'completed' | 'error';
    createdAt: any;
}

/**
 * Save file metadata to Firestore (client-side)
 */
export async function saveFileMetadata(
    metadata: Omit<FileMetadata, 'createdAt'>,
): Promise<{ success: boolean; fileId?: string; error?: string }> {
    try {
        const docRef = await addDoc(collection(db, 'files'), {
            ...metadata,
            createdAt: serverTimestamp(),
        });

        console.log('✅ File metadata saved to Firestore:', {
            fileId: docRef.id,
            fileName: metadata.fileName,
        });

        return {
            success: true,
            fileId: docRef.id,
        };
    } catch (error) {
        console.error('❌ Error saving file metadata to Firestore:', error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to save file metadata',
        };
    }
}

/**
 * List all files for a user from Firestore (client-side)
 */
export async function listUserFilesFromFirestore(
    userId: string,
): Promise<{ success: boolean; files?: any[]; error?: string }> {
    try {
        const q = query(
            collection(db, 'files'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
        );

        const querySnapshot = await getDocs(q);

        const files = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return {
            success: true,
            files,
        };
    } catch (error) {
        console.error('❌ Error fetching user files from Firestore:', error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch files',
        };
    }
}
