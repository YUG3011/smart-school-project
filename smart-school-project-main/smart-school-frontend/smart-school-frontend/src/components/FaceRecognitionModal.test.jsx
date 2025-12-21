import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FaceRecognitionModal from './FaceRecognitionModal';

describe('FaceRecognitionModal', () => {
  const mockOnClose = jest.fn();
  const mockOnMarked = jest.fn();

  beforeEach(() => {
    // Mock navigator.mediaDevices.getUserMedia
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn().mockResolvedValue({
          getTracks: () => [{ stop: jest.fn() }],
        }),
      },
      writable: true,
    });
  });

  test('renders nothing when open is false', () => {
    render(<FaceRecognitionModal open={false} onClose={mockOnClose} onMarked={mockOnMarked} />);
    expect(screen.queryByText('Face Recognition')).not.toBeInTheDocument();
  });

  test('renders the modal when open is true', () => {
    render(<FaceRecognitionModal open={true} onClose={mockOnClose} onMarked={mockOnMarked} />);
    expect(screen.getByText('Face Recognition')).toBeInTheDocument();
    expect(screen.getByText('Starting camera...')).toBeInTheDocument();
  });

  test('calls onClose when the close button is clicked', () => {
    render(<FaceRecognitionModal open={true} onClose={mockOnClose} onMarked={mockOnMarked} />);
    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
