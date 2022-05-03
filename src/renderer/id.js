import * as uuid from 'uuid';
import * as base32 from 'hi-base32';

export function uuidToBase32(uuidString) {
  const bytes = uuid.parse(uuidString);
  let encoded = base32.encode(bytes);

  if (encoded.indexOf('=') != -1) {
    encoded = encoded.substring(0, encoded.indexOf('='));
  }

  return encoded.toLowerCase();
}

export function base32ToUUID(base32String) {
  if (base32String.length % 8 != 0) {
    base32String += '='.repeat(8 - base32String.length % 8);
  }

  const bytes = base32.decode.asBytes(base32String);
  return uuid.stringify(bytes);
}