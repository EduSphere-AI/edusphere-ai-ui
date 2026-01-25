import { API_BASE_URL } from './constants';

export async function processDocument(url: string, docId: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/content/upload-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url,
                user_id: 'anonymous', // Still required by backend schema? We'll check.
                id: docId,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.detail || `Server error: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to start processing:', error);
        throw error;
    }
}

export async function fetchDocuments() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/content/documents?limit=50`,
        );
        if (!response.ok) throw new Error('Failed to fetch documents');
        return await response.json();
    } catch (error) {
        console.error('Error fetching documents:', error);
        return [];
    }
}
