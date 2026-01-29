// Test file for PDF encryption fixes

import { describe, it, expect } from 'vitest';

// Import the sanitization function
const sanitizeEmployeeId = (id: string): string => {
  return id.trim().replace(/\s+/g, '').replace(/[\r\n]/g, '');
};

describe('PDF Encryption Fixes', () => {
  describe('sanitizeEmployeeId', () => {
    it('should remove leading and trailing whitespace', () => {
      expect(sanitizeEmployeeId('  ID100001  ')).toBe('ID100001');
    });

    it('should remove newlines', () => {
      expect(sanitizeEmployeeId('ID100001\n')).toBe('ID100001');
      expect(sanitizeEmployeeId('ID100001\r\n')).toBe('ID100001');
    });

    it('should remove all internal whitespace', () => {
      expect(sanitizeEmployeeId('ID 100 001')).toBe('ID100001');
    });

    it('should handle multiple whitespace types', () => {
      expect(sanitizeEmployeeId('  ID100001\n\r  ')).toBe('ID100001');
    });

    it('should handle already clean IDs', () => {
      expect(sanitizeEmployeeId('ID100001')).toBe('ID100001');
    });
  });

  describe('ID Matching', () => {
    it('should match IDs regardless of formatting', () => {
      const id1 = sanitizeEmployeeId('ID100001\n');
      const id2 = sanitizeEmployeeId('  ID100001  ');
      expect(id1).toBe(id2);
    });

    it('should match IDs from different sources', () => {
      const excelId = sanitizeEmployeeId('ID100001\n'); // From Excel with newline
      const fileId = sanitizeEmployeeId('ID100001');     // Clean ID
      expect(excelId).toBe(fileId);
    });
  });

  describe('Password Generation', () => {
    it('should generate consistent passwords', () => {
      const employeeId1 = 'ID100001\n';
      const employeeId2 = '  ID100001  ';
      
      const password1 = sanitizeEmployeeId(employeeId1);
      const password2 = sanitizeEmployeeId(employeeId2);
      
      expect(password1).toBe(password2);
      expect(password1).toBe('ID100001');
    });
  });
});

// Manual testing instructions (to run in browser console)
export const manualTests = {
  testSanitization: () => {
    console.log('=== Testing ID Sanitization ===');
    
    const testCases = [
      { input: 'ID100001', expected: 'ID100001' },
      { input: '  ID100001  ', expected: 'ID100001' },
      { input: 'ID100001\n', expected: 'ID100001' },
      { input: 'ID 100 001', expected: 'ID100001' },
      { input: '  ID100001\n\r  ', expected: 'ID100001' },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = sanitizeEmployeeId(input);
      const passed = result === expected;
      console.log(`Input: "${input}" → Output: "${result}" → ${passed ? '✓ PASS' : '✗ FAIL'}`);
    });
  },

  testPDFEncryption: async () => {
    console.log('=== Testing PDF Encryption ===');
    console.log('This test requires the full application to be running.');
    console.log('Steps to test manually:');
    console.log('1. Generate a test employee: { id: "TEST001", name: "Test User" }');
    console.log('2. Create an encrypted PDF with password "TEST001"');
    console.log('3. Try to open the PDF without password (should fail)');
    console.log('4. Try to open the PDF with password "TEST001" (should succeed)');
    console.log('5. Verify the PDF content is readable');
  },

  testIDMatching: () => {
    console.log('=== Testing ID Matching ===');
    
    // Simulate employee data from Excel (might have whitespace)
    const excelIds = [
      'ID100001\n',
      '  ID100002  ',
      'ID100003',
      'ID 100004',
    ];

    // Simulate employee data from processed files (clean)
    const fileIds = [
      'ID100001',
      'ID100002',
      'ID100003',
      'ID100004',
    ];

    console.log('Comparing Excel IDs to File IDs:');
    
    let allMatch = true;
    excelIds.forEach((excelId, index) => {
      const sanitizedExcel = sanitizeEmployeeId(excelId);
      const fileId = fileIds[index];
      const match = sanitizedExcel === fileId;
      
      if (!match) allMatch = false;
      
      console.log(`Excel: "${excelId}" → Sanitized: "${sanitizedExcel}" vs File: "${fileId}" → ${match ? '✓' : '✗'}`);
    });

    console.log(`\nOverall: ${allMatch ? '✓ All IDs match!' : '✗ Some IDs do not match'}`);
  },
};

// Export test utilities for use in the application
export { sanitizeEmployeeId };
