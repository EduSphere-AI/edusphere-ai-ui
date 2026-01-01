import { API_BASE_URL } from './constants';

export async function processDocument(
    url: string,
    userId: string,
    docId: string,
) {
    try {
        const response = await fetch(`${API_BASE_URL}/content/upload-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url,
                user_id: userId,
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
