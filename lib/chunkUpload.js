const CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks

export async function uploadInChunks(pb, file, onProgress) {
  try {
    console.log('Starting upload process for:', file.name);
    console.log('File size:', file.size, 'bytes');
    
    // Generate file token first
    console.log('Generating file token...');
    const fileToken = await pb.files.getToken().catch(err => {
      console.error('File token generation failed:', err);
      throw new Error('Failed to generate file token: ' + err.message);
    });
    console.log('File token generated successfully');

    // Create initial file record
    console.log('Preparing form data...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('token', fileToken);
    console.log('Form data prepared');

    console.log('Sending upload request...');
    const response = await fetch('/api/files', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${pb.authStore.token}`
      }
    });
    console.log('Upload response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Upload failed with error:', errorData);
      throw new Error(errorData.error || 'Upload failed');
    }

    const result = await response.json();
    console.log('Upload completed successfully:', result);
    onProgress(100);
    return result;
  } catch (error) {
    console.error('Upload process failed:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
} 