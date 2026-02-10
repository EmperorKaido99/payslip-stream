const AZURE_FUNCTION_URL = 'https://payslip-processor-func-czh9fwfwgaeeeefah.southafricanorth-01.azurewebsites.net';

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
  console.log(`🔐 Starting encryption for ${employeeId} (${pdfBytes.length} bytes)`);
  
  // Convert PDF bytes to base64 in chunks to avoid stack overflow
  // The spread operator (...pdfBytes) can cause "Maximum call stack size exceeded" for large arrays
  let binary = '';
  const chunkSize = 8192; // Process 8KB at a time
  for (let i = 0; i < pdfBytes.length; i += chunkSize) {
    const chunk = pdfBytes.slice(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  const pdfBase64 = btoa(binary);
  
  console.log(`📤 Sending to Azure Function: ${AZURE_FUNCTION_URL}/api/encrypt`);
  console.log(`📋 Payload: employeeId=${employeeId}, database=${databaseFileName}, size=${pdfBytes.length} bytes`);

  try {
    // Send JSON payload to Azure Function
    const response = await fetch(`${AZURE_FUNCTION_URL}/api/encrypt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        pdfBase64: pdfBase64,
        employeeId: employeeId,
        databaseFileName: databaseFileName,
      }),
    });

    console.log(`📥 Azure Function response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('❌ Azure encryption error:', errorText);
      throw new Error(`Azure encryption failed (${response.status}): ${errorText}`);
    }

    const encryptedBuffer = await response.arrayBuffer();
    console.log(`✅ Encryption successful: ${encryptedBuffer.byteLength} bytes`);
    return new Uint8Array(encryptedBuffer);
  } catch (error) {
    console.error('❌ Failed to connect to Azure Function:', error);
    console.error('   URL:', `${AZURE_FUNCTION_URL}/api/encrypt`);
    console.error('   Error type:', error instanceof TypeError ? 'Network/CORS' : 'Other');
    throw error;
  }
};
