const AZURE_FUNCTION_URL = 'https://payslip-processor-func-czh9fwfwaeeeefah.southafricanorth-01.azurewebsites.net';

/**
 * Convert Uint8Array to base64 string.
 */
const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Send a single-page PDF to the Azure Function for encryption.
 * Sends JSON with base64-encoded PDF, employeeId, and databaseFileName.
 * Returns the encrypted PDF as Uint8Array.
 */
export const encryptPdfViaAzure = async (
  pdfBytes: Uint8Array,
  password: string,
  fileName: string = 'payslip.pdf'
): Promise<Uint8Array> => {
  const sanitizedPassword = password.trim().replace(/\s+/g, '').replace(/[\r\n]/g, '');
  const pdfBase64 = uint8ArrayToBase64(pdfBytes);

  const response = await fetch(`${AZURE_FUNCTION_URL}/api/encrypt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pdfBase64,
      employeeId: sanitizedPassword,
      databaseFileName: fileName,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Azure encryption failed (${response.status}): ${errorText}`);
  }

  const encryptedBuffer = await response.arrayBuffer();
  return new Uint8Array(encryptedBuffer);
};
