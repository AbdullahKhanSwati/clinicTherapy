// Cloudinary unsigned image upload — no server required.
//
// Setup (one-time, in your Cloudinary dashboard):
//   1. Settings → Upload → Upload presets → "Add upload preset"
//   2. Set "Signing Mode" to "Unsigned"
//   3. Save the preset name. Copy your Cloud name from the dashboard header.
//   4. Add to .env:
//        EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=<your-cloud-name>
//        EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<your-preset-name>
//
// Usage:
//   import { uploadImage } from '../lib/cloudinary';
//   const url = await uploadImage(fileUri, { folder: 'avatars' });
//   // url is a permanent https://res.cloudinary.com/... link

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = () =>
  Boolean(CLOUD_NAME && UPLOAD_PRESET);

/**
 * Upload a local image (file:// URI) to Cloudinary.
 * Returns the secure HTTPS URL on success, throws on failure.
 */
export const uploadImage = async (fileUri, { folder } = {}) => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary not configured. Set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.'
    );
  }
  if (!fileUri) throw new Error('No file selected.');

  const filename = fileUri.split('/').pop() || `upload_${Date.now()}.jpg`;
  const ext = (filename.split('.').pop() || 'jpg').toLowerCase();
  const mime =
    ext === 'png' ? 'image/png' :
    ext === 'webp' ? 'image/webp' :
    ext === 'gif' ? 'image/gif' :
    'image/jpeg';

  const form = new FormData();
  form.append('file', { uri: fileUri, name: filename, type: mime });
  form.append('upload_preset', UPLOAD_PRESET);
  if (folder) form.append('folder', folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const res = await fetch(endpoint, { method: 'POST', body: form });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.secure_url) {
    const msg = json?.error?.message || `Upload failed (${res.status})`;
    throw new Error(msg);
  }
  return json.secure_url;
};
