import { useState, ChangeEvent } from 'react';
import imageCompression from 'browser-image-compression';
import generator from 'generate-password';

interface CompressConfig {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
}

const useImageUpload = (options: CompressConfig) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgUploadError, setImgUploadError] = useState<string | null>(null);

  const getImageFile = async (e: ChangeEvent<HTMLInputElement>) => {
    setImgUploadError(null);

    const reader = new FileReader();

    if (!e.target.files) return;

    const file = e.target.files[0];

    let compressedFile;

    //If something goes wrong or e.g. user tries to upload a pdf, it will throw an error with invalid file
    try {
      if (!file) return;
      compressedFile = await imageCompression(file, options);
    } catch (error) {
      setImgUploadError((error as Error).message);
      return;
    }

    const compressedFileSize = compressedFile.size / 1024;

    //Creating unique file name to prevent overwrites in the storage.
    const defaultFileName = compressedFile.name;
    const uniqueString = generator.generate({ length: 18, numbers: true, uppercase: false });
    const uniqueFileName = uniqueString + defaultFileName;

    if (compressedFile) {
      reader.readAsDataURL(compressedFile);

      reader.addEventListener('load', async () => {
        let base64str;

        if (typeof reader.result === 'string') {
          base64str = reader.result.split(',')[1];
        }

        try {
          const res = await fetch('/api/image', {
            method: 'POST',
            body: JSON.stringify({
              image: base64str,
              imageSize: compressedFileSize,
              imageName: uniqueFileName,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message);
          }

          const data = await res.json();
          setImgUrl(data.location);
        } catch (error) {
          e.target.value = ''; //clearing input just to make sure another failed input will be rejected and err msg displayed
          const message = (error as Error).message;
          setImgUploadError(message);
        }
      });
    }
  };

  return { getImageFile, imgUrl, imgUploadError };
};

export default useImageUpload;
