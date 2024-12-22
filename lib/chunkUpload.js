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
    
    const uploadPromise = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          console.log(`Current progress: ${percentComplete.toFixed(2)}%`);
          onProgress(Math.min(percentComplete, 98));
        }
      };

      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            onProgress(100);
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (e) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));

      xhr.open('POST', '/api/files', true);
      xhr.setRequestHeader('Authorization', `Bearer ${pb.authStore.token}`);
      xhr.send(formData);
    });

    const result = await uploadPromise;
    console.log('Upload completed successfully:', result);
    return result;

  } catch (error) {
    console.error('Upload process failed:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
} 