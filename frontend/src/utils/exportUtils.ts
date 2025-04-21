import { toPng, toSvg } from 'html-to-image';
import { saveAs } from 'file-saver';
import { GraphData } from '../services/api/graph.service';

/**
 * Export graph to PNG image
 * @param elementId ID of the element to export
 * @param fileName Name of the file to save
 */
export const exportToPng = async (elementId: string, fileName: string = 'mind-map'): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Create PNG data URL
    const dataUrl = await toPng(element, {
      backgroundColor: '#ffffff',
      quality: 0.95,
      pixelRatio: 2
    });

    // Save file
    saveAs(dataUrl, `${fileName}.png`);
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    throw error;
  }
};

/**
 * Export graph to SVG image
 * @param elementId ID of the element to export
 * @param fileName Name of the file to save
 */
export const exportToSvg = async (elementId: string, fileName: string = 'mind-map'): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Create SVG data URL
    const dataUrl = await toSvg(element, {
      backgroundColor: '#ffffff',
      quality: 1,
      pixelRatio: 2
    });

    // Save file
    saveAs(dataUrl, `${fileName}.svg`);
  } catch (error) {
    console.error('Error exporting to SVG:', error);
    throw error;
  }
};

/**
 * Export graph to JSON
 * @param graphData Graph data to export
 * @param fileName Name of the file to save
 */
export const exportToJson = (graphData: GraphData, fileName: string = 'mind-map'): void => {
  try {
    // Create JSON blob
    const jsonString = JSON.stringify(graphData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Save file
    saveAs(blob, `${fileName}.json`);
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw error;
  }
};
