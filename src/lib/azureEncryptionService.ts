const AZURE_FUNCTION_URL = 'https://payslip-processor-func-czh9fwfwaeeeefah.southafricanorth-01.azurewebsites.net';

/**
 * Send a single-page PDF to the Azure Function for encryption.
 * Expects multipart/form-data with 'file' (PDF) and 'password' fields.
 * Returns the encrypted PDF as Uint8Array.
 */
export const encryptPdfViaAzure = async (
  pdfBytes: Uint8Array,
  password: string,
  fileName: string = 'payslip.pdf'
): Promise<Uint8Array> => {
  const sanitizedPassword = password.trim().replace(/\s+/g, '').replace(/[\r\n]/g, '');

  const formData = new FormData();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  formData.append('file', blob, fileName);
  formData.append('password', sanitizedPassword);

  const response = await fetch(`${AZURE_FUNCTION_URL}/api/encrypt`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Azure encryption failed (${response.status}): ${errorText}`);
  }

  const encryptedBuffer = await response.arrayBuffer();
  return new Uint8Array(encryptedBuffer);
};
