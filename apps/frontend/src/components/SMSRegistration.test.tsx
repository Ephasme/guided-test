import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { SMSRegistration } from "./SMSRegistration";
import { useAuth } from "../hooks/useAuth";

vi.mock("../hooks/useAuth");
vi.mock("../utils/getPublicIP", () => ({
  getPublicIP: vi.fn().mockResolvedValue("192.168.1.1"),
}));

const mockUseAuth = vi.mocked(useAuth);

describe("SMSRegistration", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it("should not render when no session ID", () => {
    mockUseAuth.mockReturnValue({ sessionId: null } as ReturnType<
      typeof useAuth
    >);

    render(<SMSRegistration />);

    expect(
      screen.queryByText("📱 SMS Weather Notifications")
    ).not.toBeInTheDocument();
  });

  it("should render when session ID is available", () => {
    mockUseAuth.mockReturnValue({ sessionId: "test-session" } as ReturnType<
      typeof useAuth
    >);

    render(<SMSRegistration />);

    expect(
      screen.getByText("📱 SMS Weather Notifications")
    ).toBeInTheDocument();
  });

  it("should show registration form when not registered", () => {
    mockUseAuth.mockReturnValue({ sessionId: "test-session" } as ReturnType<
      typeof useAuth
    >);

    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notificationsEnabled: false }),
    } as Response);

    render(<SMSRegistration />);

    expect(screen.getByText("Enable")).toBeInTheDocument();
  });

  it("should handle registration", async () => {
    mockUseAuth.mockReturnValue({ sessionId: "test-session" } as ReturnType<
      typeof useAuth
    >);

    const mockFetch = vi.mocked(fetch);
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notificationsEnabled: false }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notificationsEnabled: true }),
      } as Response);

    render(<SMSRegistration />);

    const input = screen.getByPlaceholderText("+33123456789 or 0123456789");
    const button = screen.getByText("Enable");

    fireEvent.change(input, { target: { value: "+33123456789" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText("SMS number registered successfully!")
      ).toBeInTheDocument();
    });
  });

  it("should handle registration error", async () => {
    mockUseAuth.mockReturnValue({ sessionId: "test-session" } as ReturnType<
      typeof useAuth
    >);

    const mockFetch = vi.mocked(fetch);
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notificationsEnabled: false }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Invalid phone number" }),
      } as Response);

    render(<SMSRegistration />);

    const input = screen.getByPlaceholderText("+33123456789 or 0123456789");
    const button = screen.getByText("Enable");

    fireEvent.change(input, { target: { value: "+33123456789" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Invalid phone number")).toBeInTheDocument();
    });
  });
});
