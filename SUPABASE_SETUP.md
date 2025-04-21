# Setting up Supabase Storage for Writing Frames

This guide will help you set up Supabase Storage for the Writing Frames application.

## Steps

1. **Create a Supabase Account**
   - Go to [Supabase](https://supabase.com/) and sign up for an account
   - Create a new project

2. **Get Your API Keys**
   - In your project dashboard, go to the "Settings" section
   - Click on "API" in the sidebar
   - You'll find your project URL and anon/public key there
   - Copy these values to your `.env` file:
     ```
     REACT_APP_SUPABASE_URL=your_project_url
     REACT_APP_SUPABASE_ANON_KEY=your_anon_key
     ```

3. **Create a Storage Bucket**
   - In your project dashboard, go to the "Storage" section
   - Click "Create a new bucket"
   - Name it "writing-frames" (important: this name must match the one used in the code)
   - Choose "Public" bucket for this example (or set appropriate RLS policies if choosing private)

4. **Set Up Storage Permissions**
   - Go to the "Authentication" section, then "Policies"
   - Create appropriate policies for your storage bucket
   - For a simple setup, you can allow authenticated users to perform all operations:

   For example:
   ```sql
   -- Allow users to upload files to their own folder
   CREATE POLICY "User can upload their own files"
   ON storage.objects
   FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'writing-frames' AND (storage.foldername(name))[1] = auth.uid());

   -- Allow users to update their own files
   CREATE POLICY "User can update their own files"
   ON storage.objects
   FOR UPDATE
   TO authenticated
   USING (bucket_id = 'writing-frames' AND (storage.foldername(name))[1] = auth.uid());

   -- Allow users to read their own files
   CREATE POLICY "User can read their own files"
   ON storage.objects
   FOR SELECT
   TO authenticated
   USING (bucket_id = 'writing-frames' AND (storage.foldername(name))[1] = auth.uid());

   -- Allow users to delete their own files
   CREATE POLICY "User can delete their own files"
   ON storage.objects
   FOR DELETE
   TO authenticated
   USING (bucket_id = 'writing-frames' AND (storage.foldername(name))[1] = auth.uid());
   ```

5. **Test Your Configuration**
   - Start your application and try saving a note with an image
   - Check the Supabase storage console to see if the image was uploaded successfully

## Troubleshooting

- If images aren't uploading, check your browser console for error messages
- Verify that your environment variables are correctly set
- Ensure the bucket name in the code matches the one you created in Supabase
- Check that your RLS policies allow the operations you're trying to perform 