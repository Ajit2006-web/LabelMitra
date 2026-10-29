import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ScanPage from './ScanPage';
import * as AuthContextModule from '../context/AuthContext';

// Mock AuthContext
const mockAuthValues = {
  token: 'mock-jwt-test-token',
  isAuthenticated: true,
  loading: false,
  user: { id: 'test-user-id', email: 'test@labelmitra.test' },
  logout: () => {},
};

function renderWithProviders(ui, authOverrides = {}) {
  const authState = { ...mockAuthValues, ...authOverrides };
  jest.spyOn(AuthContextModule, 'useAuth').mockReturnValue(authState);

  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
}

describe('ScanPage Frontend Component Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('1. Initial Rendering & Panel Controls', () => {
    it('renders the page header and all 4 packaging panel slots', () => {
      renderWithProviders(<ScanPage />);

      expect(screen.getByText('Scan a Food Label')).toBeInTheDocument();
      expect(screen.getByText('Image Upload & OCR Pipeline')).toBeInTheDocument();

      // All 4 panel slot titles
      expect(screen.getByText('Front Panel')).toBeInTheDocument();
      expect(screen.getByText('Nutrition Table')).toBeInTheDocument();
      expect(screen.getByText('Ingredients Panel')).toBeInTheDocument();
      expect(screen.getByText('Statutory Declarations')).toBeInTheDocument();
    });

    it('renders login prompt when user is not authenticated', () => {
      renderWithProviders(<ScanPage />, { isAuthenticated: false, token: null });

      expect(screen.getByText('Sign In to Scan')).toBeInTheDocument();
      expect(screen.getByText(/You need a LabelMitra account to analyse food labels/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Sign In/i })).toHaveAttribute('href', '/login?redirect=/scan');
    });
  });

  describe('2. Submission Behavior When No Panels Are Selected', () => {
    it('disables the Run OCR Scan button when no panel images are uploaded', () => {
      renderWithProviders(<ScanPage />);

      const scanButton = screen.getByRole('button', { name: /Run OCR Scan/i });
      expect(scanButton).toBeDisabled();
    });
  });

  describe('3. Successful Submission & OCR Result Rendering', () => {
    it('submits uploaded panels and renders extraction results, gauge and panel cards', async () => {
      // Mock successful OCR backend response with Phase 3 extracted data
      const mockScanResponse = {
        success: true,
        data: {
          scan: {
            id: 'scan-uuid-1234',
            status: 'COMPLETED',
            extractedData: {
              product_identity: {
                product_name: { value: 'Parle Glucose Biscuits', status: 'EXTRACTED' },
                brand: { value: 'Parle', status: 'EXTRACTED' },
                category: { value: 'Biscuits', status: 'INFERRED' },
                veg_status: { value: 'VEG', status: 'EXTRACTED' },
              },
              statutory_declarations: {
                fssai_license: { value: '10014047000120', status: 'EXTRACTED' },
                net_quantity: { value: 250, unit: 'g', status: 'EXTRACTED' },
                mrp: { value: 25.0, status: 'EXTRACTED' },
              },
              ingredients: {
                items: [{ name: 'Wheat Flour', percentage: 66 }, { name: 'Sugar' }],
                detected_ins_additives: [{ ins_code: 'INS 503(ii)', name: 'Ammonium carbonate', functional_class: 'Leavening' }],
              },
              allergens: {
                mandatory_declaration: { value: 'Contains Wheat, Milk and Soy.' },
                contains: ['Wheat', 'Milk', 'Soy'],
              },
              nutrition: {
                reference_unit: '100g',
                nutrients: {
                  energy: { value: 454, unit: 'kcal' },
                  protein: { value: 6.5, unit: 'g' },
                },
              },
              extraction_summary: { fields_extracted: 12 },
            },
          },
          compositeConfidence: 94.2,
          status: 'COMPLETED',
          ocrResults: [
            {
              id: 'ocr-1',
              imageSide: 'FRONT',
              engineUsed: 'NativeOCR-Adapter',
              confidenceScore: 95.0,
              rawText: 'LabelMitra Packaged Food Product\nRich Glucose Energy Biscuits',
              qualityMetrics: { quality_status: 'OPTIMAL' },
            },
            {
              id: 'ocr-2',
              imageSide: 'NUTRITION',
              engineUsed: 'NativeOCR-Adapter',
              confidenceScore: 93.4,
              rawText: 'NUTRITIONAL INFORMATION Per 100g\nEnergy: 454 kcal',
              qualityMetrics: { quality_status: 'OPTIMAL' },
            },
          ],
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockScanResponse,
      });

      // Mock URL.createObjectURL for file previews
      global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock-preview');

      renderWithProviders(<ScanPage />);

      // Simulate file selection for the Front Panel
      const fileInputs = document.querySelectorAll('input[type="file"]');
      expect(fileInputs.length).toBeGreaterThan(0);

      const dummyFile = new File(['dummy content'], 'front_label.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInputs[0], { target: { files: [dummyFile] } });

      // After adding a file, button should be enabled
      const scanButton = await screen.findByRole('button', { name: /Run OCR Scan/i });
      expect(scanButton).not.toBeDisabled();

      // Click submit
      fireEvent.click(scanButton);

      // Verify POST call was dispatched to /api/scans/upload with Authorization header
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/scans/upload', expect.objectContaining({
          method: 'POST',
          headers: { Authorization: 'Bearer mock-jwt-test-token' },
        }));
      });

      // Verify OCR Results view is displayed
      expect(await screen.findByText('OCR Extraction Results')).toBeInTheDocument();
      expect(screen.getByText('Scan ID: scan-uuid-1234 ·')).toBeInTheDocument();
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
      expect(screen.getByText('94%')).toBeInTheDocument(); // Composite score
      expect(screen.getByText('FRONT Panel')).toBeInTheDocument();
      expect(screen.getByText('NUTRITION Panel')).toBeInTheDocument();
      expect(screen.getByText(/Rich Glucose Energy Biscuits/)).toBeInTheDocument();
      expect(screen.getByText(/Energy: 454 kcal/)).toBeInTheDocument();

      // Phase 3: Verify Structured Product Information View is rendered
      expect(screen.getByText('Structured Product Information')).toBeInTheDocument();
      expect(screen.getByText('10014047000120')).toBeInTheDocument();
      expect(screen.getByText('Wheat Flour')).toBeInTheDocument();
      expect(screen.getByText('INS 503(ii)')).toBeInTheDocument();
    });
  });

  describe('4. Error Handling for Failed Requests', () => {
    it('displays error banner when the upload request fails with server error message', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Unsupported file format or corrupted image payload.',
        }),
      });

      global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock-preview');

      renderWithProviders(<ScanPage />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const dummyFile = new File(['dummy'], 'panel.png', { type: 'image/png' });
      fireEvent.change(fileInputs[0], { target: { files: [dummyFile] } });

      const scanButton = await screen.findByRole('button', { name: /Run OCR Scan/i });
      fireEvent.click(scanButton);

      expect(await screen.findByText('Unsupported file format or corrupted image payload.')).toBeInTheDocument();
    });
  });

  describe('5. Phase 4: Personalized Allergy Assessment Rendering', () => {
    it('renders personalized allergy warning, matched entity, reasoning, and disclaimer', async () => {
      const mockScanResponseWithAllergies = {
        success: true,
        data: {
          scan: {
            id: 'scan-allergy-456',
            status: 'COMPLETED',
            extractedData: {
              product_identity: {
                product_name: { value: 'Nutty Cookies', status: 'EXTRACTED' },
              },
              personalized_allergy_assessment: {
                status: 'CONFIRMED_MATCH',
                headline: 'Potential Allergen Warning',
                summary: 'Detected 1 allergen(s) on the label that match your personal allergy profile.',
                hasPrecautionaryAlert: false,
                disclaimer: 'Automated label evaluation is provided for informational purposes only and does not constitute medical advice.',
                matches: [
                  {
                    matchType: 'CONFIRMED_MATCH',
                    source: 'INGREDIENT_LIST',
                    userAllergy: { name: 'Peanut', severity: 'Severe' },
                    matchedEntity: 'Roasted Groundnuts',
                    canonicalName: 'Peanut',
                    allergenGroup: 'Peanut',
                    sourcePanel: 'INGREDIENTS',
                    evidenceText: 'Ingredients: Wheat Flour, Sugar, Roasted Groundnuts (12%)',
                    reason: 'Potential allergen detected: "Roasted Groundnuts" is a known form or synonym of Peanut, which matches your Peanut profile.',
                    confidence: 0.95,
                  },
                ],
              },
            },
          },
          compositeConfidence: 91.0,
          status: 'COMPLETED',
          ocrResults: [],
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockScanResponseWithAllergies,
      });

      global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock-preview');

      renderWithProviders(<ScanPage />);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      const dummyFile = new File(['dummy'], 'panel.png', { type: 'image/png' });
      fireEvent.change(fileInputs[0], { target: { files: [dummyFile] } });

      const scanButton = await screen.findByRole('button', { name: /Run OCR Scan/i });
      fireEvent.click(scanButton);

      // Verify allergy warning view rendered
      expect(await screen.findByText('Potential Allergen Warning')).toBeInTheDocument();
      expect(screen.getByText('CONFIRMED MATCH')).toBeInTheDocument();
      expect(screen.getByText('Roasted Groundnuts')).toBeInTheDocument();
      expect(screen.getByText(/Roasted Groundnuts.*known form or synonym of Peanut/i)).toBeInTheDocument();
      expect(screen.getByText('Severe Allergy')).toBeInTheDocument();
      expect(screen.getByText(/does not constitute medical advice/i)).toBeInTheDocument();

      // Test evidence expansion toggle
      const evidenceBtn = screen.getByRole('button', { name: /View Evidence/i });
      fireEvent.click(evidenceBtn);
      expect(screen.getByText(/Ingredients: Wheat Flour, Sugar, Roasted Groundnuts \(12%\)/)).toBeInTheDocument();
    });
  });
});
