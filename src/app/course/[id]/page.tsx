'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { listUserFiles } from '@/lib/supabase';
import { 
  Download, 
  ArrowLeft, 
  FileText, 
  Loader2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

// Types for our PDF document
interface PDFDocument {
  id: string;
  title: string;
  fileUrl: string;
  filePath: string;
  uploadDate: string;
}

export default function PDFViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const docId = params.id as string;

  // FIXED: Renamed from 'document' to 'pdfDocument' to avoid shadowing global document object
  const [pdfDocument, setPdfDocument] = useState<PDFDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string>('');

  // Fetch document details
  useEffect(() => {
    const fetchDocument = async () => {
      if (!user) {
        toast.error('Please log in to view documents');
        router.push('/dashboard');
        return;
      }

      try {
        setIsLoading(true);
        const result = await listUserFiles(user.id);

        if (result.success && result.files) {
          // Find the specific document by matching the ID or filename
          const foundDoc = result.files.find(file => 
            file.id === docId || file.name.includes(docId)
          );

          if (foundDoc) {
            const doc: PDFDocument = {
              id: foundDoc.id,
              title: foundDoc.name.replace(/^\d+-/, ''), // Remove timestamp prefix
              fileUrl: foundDoc.publicUrl,
              filePath: foundDoc.path,
              uploadDate: new Date(foundDoc.createdAt).toLocaleDateString()
            };
            
            setPdfDocument(doc);
            setPdfUrl(foundDoc.publicUrl);
          } else {
            toast.error('Document not found');
            router.push('/dashboard');
          }
        } else {
          throw new Error(result.error || 'Failed to load document');
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        toast.error('Failed to load document');
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [docId, user, router]);

  // Handle PDF download
  const handleDownload = async () => {
    if (!pdfDocument) return;

    try {
      // Create a temporary anchor element for download
      const link = window.document.createElement('a');
      link.href = pdfUrl;
      link.download = `${pdfDocument.title}.pdf`;
      link.target = '_blank';
      
      // Append to body, click, and remove
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      
      toast.success('PDF download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PDF');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-offwhite-pink-blue flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 text-center">Loading document...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pdfDocument) {
    return (
      <div className="min-h-screen bg-gradient-offwhite-pink-blue flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center mb-4">Document not found</p>
            <Button onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-offwhite-pink-blue">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="border-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900 truncate max-w-xs sm:max-w-md">
                  {pdfDocument.title}
                </h1>
                <p className="text-sm text-gray-600">
                  Uploaded on {pdfDocument.uploadDate}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={handleDownload}
                className="w-full justify-center text-sm sm:text-base px-3 sm:px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg transition-all font-bold text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full width PDF viewer */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="border-2 border-gray-200 shadow-xl">
          <CardContent className="p-0 h-[calc(100vh-200px)]">
            {pdfUrl ? (
              <iframe
                src={`${pdfUrl}#toolbar=0`}
                className="w-full h-full border-0"
                title={pdfDocument.title}
                allow="fullscreen"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="text-gray-600">Loading PDF viewer...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Download Card */}
        <Card className="mt-6 border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Download Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Download a copy of this PDF to your device
                </p>
                <p className="text-xs text-gray-500">
                  File: {pdfDocument.title}.pdf
                </p>
              </div>
              <Button
                onClick={handleDownload}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg transition-all font-bold text-white whitespace-nowrap"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}