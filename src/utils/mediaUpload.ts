import {uploadMediaRequest} from '../api/keepersApi';

export async function uploadProfileImage(
  file: {uri: string; name: string; type: string},
  kind: 'avatar' | 'vehicle',
) {
  const bucket = kind === 'avatar' ? 'avatars' : 'vehicles';
  const result = await uploadMediaRequest(file, bucket);
  return result.publicUrl;
}

export async function uploadTripMedia(
  file: {uri: string; name: string; type: string},
) {
  const result = await uploadMediaRequest(file, 'trips');
  return result.publicUrl;
}
