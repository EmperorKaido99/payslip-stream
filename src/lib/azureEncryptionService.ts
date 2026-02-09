const AZURE_FUNCTION_URL = 'https://payslip-processor-func-czh9fqrfwgaeeeefah.southafricanorth-01.azurewebsites.net';

/**
 * Send a single-page PDF to the Azure Function for encryption.
 * Sends JSON with pdfBase64, employeeId, and databaseFileName.
 * Returns the encrypted PDF as Uint8Array.
 */
export const encryptPdfViaAzure = async (
  pdfBytes: Uint8Array,
  employeeId: string,
  databaseFileName: string
): Promise<Uint8Array> => {
  // Convert PDF bytes to base64
  const pdfBase64 = btoa(
    String.fromCharCode(...new Uint8Array(pdfBytes))
  );

  // Send JSON payload to Azure Function
  const response = await fetch(`${AZURE_FUNCTION_URL}/api/encrypt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pdfBase64: pdfBase64,
      employeeId: employeeId,
      databaseFileName: databaseFileName,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Azure encryption failed (${response.status}): ${errorText}`);
  }

  const encryptedBuffer = await response.arrayBuffer();
  return new Uint8Array(encryptedBuffer);
};
