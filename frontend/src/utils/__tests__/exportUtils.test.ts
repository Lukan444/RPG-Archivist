import { exportToJson } from '../exportUtils';

// Mock file-saver
jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}));

// Mock html-to-image
jest.mock('html-to-image', () => ({
  toPng: jest.fn().mockResolvedValue('png-data-url'),
  toSvg: jest.fn().mockResolvedValue('svg-data-url')
}));

describe('Export Utils', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('exportToJson', () => {
    it('should create a JSON blob with correct data', () => {
      // Arrange
      const data = { nodes: [], edges: [] };
      const filename = 'test-data';

      // Mock Blob constructor
      const originalBlob = global.Blob;
      const mockBlob = jest.fn();
      global.Blob = mockBlob as any;

      try {
        // Act
        exportToJson(data, filename);

        // Assert
        expect(mockBlob).toHaveBeenCalledWith(
          [JSON.stringify(data, null, 2)],
          { type: 'application/json' }
        );
      } finally {
        // Restore Blob constructor
        global.Blob = originalBlob;
      }
    });
  });


});
