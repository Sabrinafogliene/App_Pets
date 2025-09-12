-- Create storage bucket for pet photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('pets', 'pets', true);

-- Create policies for pet photo uploads
CREATE POLICY "Anyone can view pet photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'pets');

CREATE POLICY "Users can upload pet photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their pet photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'pets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their pet photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'pets' AND auth.uid()::text = (storage.foldername(name))[1]);