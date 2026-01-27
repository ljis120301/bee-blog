/**
 * Chunk Upload Utility - Prisma Version
 * ======================================
 * Handles file uploads to the local storage API
 */

/**
 * Upload a file with progress tracking
 * @param {File} file - The file to upload
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} - The URL of the uploaded file
 */
export async function uploadInChunks(file, onProgress) {
  try {
    console.log('Starting upload process for:', file.name);
    console.log('File size:', file.size, 'bytes');

    // Create form data
    const formData = new FormData();
    formData.append('file', file);

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

      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            onProgress(100);
            const result = JSON.parse(xhr.responseText);
            if (result.success) {
              resolve(result.url);
            } else {
              reject(new Error(result.error || 'Upload failed'));
            }
          } catch (e) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));

      // Use credentials to include session cookie
      xhr.open('POST', '/api/files', true);
      xhr.withCredentials = true;
      xhr.send(formData);
    });

    const url = await uploadPromise;
    console.log('Upload completed successfully:', url);
    return url;

  } catch (error) {
    console.error('Upload process failed:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}