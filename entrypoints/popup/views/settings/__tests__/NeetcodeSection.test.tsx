/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { NeetcodeSection } from '../NeetcodeSection';

const mockContains = vi.fn<() => Promise<boolean>>();
const mockRequest = vi.fn<() => Promise<boolean>>();

beforeEach(() => {
  browser.permissions.contains = mockContains;
  browser.permissions.request = mockRequest;
  mockContains.mockReset();
  mockRequest.mockReset();
});

describe('NeetcodeSection', () => {
  it('renders nothing when permission already granted', async () => {
    mockContains.mockResolvedValue(true);

    await act(async () => {
      render(<NeetcodeSection />);
    });

    expect(screen.queryByText('NeetCode')).not.toBeInTheDocument();
  });

  it('renders enable button when permission not granted', async () => {
    mockContains.mockResolvedValue(false);

    await act(async () => {
      render(<NeetcodeSection />);
    });

    expect(screen.getByText('NeetCode')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enable/i })).toBeInTheDocument();
  });

  it('requests permission and hides when Enable clicked', async () => {
    mockContains.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    mockRequest.mockResolvedValue(true);

    await act(async () => {
      render(<NeetcodeSection />);
    });

    await act(async () => {
      screen.getByRole('button', { name: /enable/i }).click();
    });

    expect(mockRequest).toHaveBeenCalledWith({ origins: ['*://*.neetcode.io/*'] });
    expect(screen.queryByText('NeetCode')).not.toBeInTheDocument();
  });

  it('stays visible when user denies the permission prompt', async () => {
    mockContains.mockResolvedValue(false);
    mockRequest.mockResolvedValue(false);

    await act(async () => {
      render(<NeetcodeSection />);
    });

    await act(async () => {
      screen.getByRole('button', { name: /enable/i }).click();
    });

    expect(mockRequest).toHaveBeenCalled();
    expect(screen.getByText('NeetCode')).toBeInTheDocument();
  });
});
