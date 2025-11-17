# Supabase Storage Setup

## Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Storage Bucket Setup

1. Go to your Supabase project dashboard
2. Navigate to Storage
3. Create a new bucket named `uploads`
4. Set the bucket to **Public** (for direct file access)

### Bucket Policies (Optional - for more control)

If you want to restrict access, you can set up Row Level Security policies:

```sql
-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to read their own files
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
```

## Features Implemented

- ✅ File upload with 5MB limit
- ✅ Files organized by user ID
- ✅ Automatic fetching of user's previously uploaded files
- ✅ Download URLs printed to console
- ✅ Public URL generation for easy file access
- ✅ File validation (PDF only)
- ✅ Loading states and error handling
- ✅ Empty state when no files uploaded

## File Storage Structure

```
uploads/
  └── {userId}/
      ├── {timestamp}-file1.pdf
      ├── {timestamp}-file2.pdf
      └── ...
```

## Usage

Files are automatically:

1. Uploaded when user selects a PDF
2. Stored in Supabase Storage under the user's ID
3. Listed in the dashboard when user logs in
4. Available for download via the download button
