import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SMSRegistration } from "./SMSRegistration";
import { useAuth } from "../hooks/useAuth";
import { useSMS } from "../hooks/useSMS";

vi.mock("../hooks/useAuth");
vi.mock("../hooks/useSMS");

const mockUseAuth = vi.mocked(useAuth);
const mockUseSMS = vi.mocked(useSMS);

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe("SMSRegistration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when no session ID", () => {
    mockUseAuth.mockReturnValue({ sessionId: null } as ReturnType<
      typeof useAuth
    >);
    mockUseSMS.mockReturnValue({
      status: undefined,
      isLoadingStatus: false,
      statusError: null,
      registerSMSNotification: vi.fn(),
      unregisterSMSNotification: vi.fn(),
      isRegistering: false,
      isUnregistering: false,
      registerError: null,
      unregisterError: null,
    });

    renderWithQueryClient(<SMSRegistration />);

    expect(
      screen.queryByText("📱 SMS Weather Notifications")
    ).not.toBeInTheDocument();
  });

  it("should render when session ID is available", () => {
    mockUseAuth.mockReturnValue({ sessionId: "test-session" } as ReturnType<
      typeof useAuth
    >);
    mockUseSMS.mockReturnValue({
      status: undefined,
      isLoadingStatus: false,
      statusError: null,
      registerSMSNotification: vi.fn(),
      unregisterSMSNotification: vi.fn(),
      isRegistering: false,
      isUnregistering: false,
      registerError: null,
      unregisterError: null,
    });

    renderWithQueryClient(<SMSRegistration />);

    expect(
      screen.getByText("📱 SMS Weather Notifications")
    ).toBeInTheDocument();
  });

  it("should show registration form when not registered", () => {
    mockUseAuth.mockReturnValue({ sessionId: "test-session" } as ReturnType<
      typeof useAuth
    >);
    mockUseSMS.mockReturnValue({
      status: { notificationsEnabled: false },
      isLoadingStatus: false,
      statusError: null,
      registerSMSNotification: vi.fn(),
      unregisterSMSNotification: vi.fn(),
      isRegistering: false,
      isUnregistering: false,
      registerError: null,
      unregisterError: null,
    });

    renderWithQueryClient(<SMSRegistration />);

    expect(screen.getByText("Enable")).toBeInTheDocument();
  });

  it("should handle registration", async () => {
    const mockRegisterSMS = vi.fn().mockResolvedValue(undefined);

    mockUseAuth.mockReturnValue({ sessionId: "test-session" } as ReturnType<
      typeof useAuth
    >);
    mockUseSMS.mockReturnValue({
      status: { notificationsEnabled: false },
      isLoadingStatus: false,
      statusError: null,
      registerSMSNotification: mockRegisterSMS,
      unregisterSMSNotification: vi.fn(),
      isRegistering: false,
      isUnregistering: false,
      registerError: null,
      unregisterError: null,
    });

    renderWithQueryClient(<SMSRegistration />);

    const input = screen.getByPlaceholderText("+33123456789 or 0123456789");
    const button = screen.getByText("Enable");

    fireEvent.change(input, { target: { value: "+33123456789" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockRegisterSMS).toHaveBeenCalledWith("+33123456789");
    });
  });

  it("should handle registration error", () => {
    mockUseAuth.mockReturnValue({ sessionId: "test-session" } as ReturnType<
      typeof useAuth
    >);
    mockUseSMS.mockReturnValue({
      status: { notificationsEnabled: false },
      isLoadingStatus: false,
      statusError: null,
      registerSMSNotification: vi.fn(),
      unregisterSMSNotification: vi.fn(),
      isRegistering: false,
      isUnregistering: false,
      registerError: new Error("Invalid phone number"),
      unregisterError: null,
    });

    renderWithQueryClient(<SMSRegistration />);

    expect(screen.getByText("Invalid phone number")).toBeInTheDocument();
  });
});
