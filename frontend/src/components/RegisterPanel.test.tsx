// src/components/RegisterPanel.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import RegisterPanel from './RegisterPanel';
import * as authApi from '@/lib/api/auth';
import { ValidationError } from '@/lib/utils/validate';
import Register from '@/pages/Register';

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));

vi.mock('react-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router')>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

beforeEach(() => {
    vi.clearAllMocks();
})

describe('Register', () => {
    // Test 1
    it('renders correctly with the register panel present', async () => {
        render(<Register />, { wrapper: MemoryRouter });

        expect(screen.getByRole('heading', { name: "Create an Account" })).toBeInTheDocument();
    })

    // Test 2
    it('renders success message when registration succeeds', async () => {
        vi.spyOn(authApi, 'register').mockReturnValue(Promise.resolve(true));
        vi.spyOn(authApi, 'login').mockReturnValue(Promise.resolve(true));

        render(<Register />, { wrapper: MemoryRouter });

        const user = userEvent.setup();
        await user.type(screen.getByRole('textbox', { name: "Email:*" }), "email@example.com");
        await user.type(screen.getByLabelText("Password:*"), "Password123@");
        await user.type(screen.getByLabelText("Confirm Password:*"), "Password123@");
        await user.click(screen.getByRole('button', { name: "Register" }));

        expect(screen.getByRole('heading', { name: "Account created. Welcome to Task Beacon!" })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: "Go to Dashboard" })).toBeInTheDocument();
    })

    // Test 3
    it('navigates to the dashboard page when user clicks the "Go to Dashboard" button', async () => {
        vi.spyOn(authApi, 'register').mockReturnValue(Promise.resolve(true));
        vi.spyOn(authApi, 'login').mockReturnValue(Promise.resolve(true));
        expect(mockNavigate).not.toHaveBeenCalled();

        render(<Register />, { wrapper: MemoryRouter });

        const user = userEvent.setup();
        await user.type(screen.getByLabelText("Email:*"), "email@example.com");
        await user.type(screen.getByLabelText("Password:*"), "Password123@");
        await user.type(screen.getByLabelText("Confirm Password:*"), "Password123@");
        await user.click(screen.getByRole('button', { name: "Register" }));
        expect(mockNavigate).toHaveBeenCalledTimes(0);
        await user.click(screen.getByRole('button', { name: "Go to Dashboard" }));
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    })
})

describe('RegisterPanel', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    })

    // Test 4
    it('renders correctly with all form fields and buttons/links present', async () => {
        // - Check title, email, password, confirmPassword inputs, register button, sign-in link
        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });

        expect(screen.getByText("Create an Account")).toBeInTheDocument();
        expect(screen.getByText("Email:")).toBeInTheDocument();
        expect(screen.getByLabelText("Email:*")).toBeInTheDocument();
        expect(screen.getByText("Password:")).toBeInTheDocument();
        expect(screen.getByLabelText("Password:*")).toBeInTheDocument();
        expect(screen.getByText("Confirm Password:")).toBeInTheDocument();
        expect(screen.getByLabelText("Confirm Password:*")).toBeInTheDocument();
        expect(screen.getByRole('button', { name: "Register" })).toBeInTheDocument();
        expect(screen.getByText("Already have an account?")).toBeInTheDocument();
        expect(screen.getByText("Sign in")).toBeInTheDocument();
    })

    // Test 5
    it('Email input has focus on page render', async () => {
        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });

        expect(screen.getByLabelText("Email:*")).toHaveFocus();
    })

    // Test 6
    it('navigates to the landing page when user clicks the \"Sign in\" button', async () => {
        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });

        const user = userEvent.setup();
        expect(mockNavigate).toHaveBeenCalledTimes(0);
        await user.click(screen.getByText("Sign in"));
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/');
    })

    // Test 7
    it('shows the invalid email tooltip when register() rejects with an invalid email error', async () => {
        vi.spyOn(authApi, 'register').mockRejectedValue(new ValidationError("Invalid email"));

        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });

        const user = userEvent.setup();
        await user.type(screen.getByLabelText("Email:*"), 'bad-email');
        await user.type(screen.getByLabelText("Password:*"), 'Password123@');
        await user.type(screen.getByLabelText("Confirm Password:*"), 'Password123@');
        await user.click(screen.getByRole('button', { name: "Register" }));

        expect(await screen.findByText(/Use a valid email format. Example: user@example.com/i)).toBeInTheDocument();
    })

    // Test 8
    it('shows the email required tooltip when register() rejects with no email input (empty string)', async () => {
        vi.spyOn(authApi, 'register').mockRejectedValue(new ValidationError("No email"));

        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });

        const user = userEvent.setup();
        await user.type(screen.getByLabelText("Password:*"), 'Password123@');
        await user.type(screen.getByLabelText("Confirm Password:*"), 'Password123@');
        await user.click(screen.getByRole('button', { name: "Register" }));

        expect(await screen.findByText(/An email address is required to create an account./i)).toBeInTheDocument();
    })

    // Test 9
    it('\"Email\" label and input show error styling when register() rejects with an \"invalid email\" error', async () => {
        vi.spyOn(authApi, 'register').mockRejectedValue(new ValidationError("Invalid email"));
        
        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });

        const user = userEvent.setup();
        const emailInput = screen.getByRole('textbox', { name: "Email:*" });
        expect(emailInput).toHaveClass('border-gray-300');
        const emailAsterisk = await screen.findByTestId("email-error-asterisk");
        expect(emailAsterisk).toHaveClass('hidden');
        await user.type(emailInput, 'bademailexample');
        await user.type(screen.getByLabelText("Password:*"), "Password123@");
        await user.type(screen.getByLabelText("Confirm Password:*"), "Password123@");
        await user.click(screen.getByRole('button', { name: "Register" }));

        expect(emailAsterisk).not.toHaveClass('hidden');
        expect(emailAsterisk).toHaveClass('text-red-500');
        expect(emailInput).toHaveClass('border-red-300');
    })

    // Test 10
    it('\"Password\" label and input show error styling when register() rejects with an \"invalid password\" error', async () => {
        vi.spyOn(authApi, 'register').mockRejectedValue(new ValidationError("Invalid password"));
        
        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });

        const user = userEvent.setup();
        const passwordInput = screen.getByLabelText("Password:*");
        expect(passwordInput).toHaveClass('border-gray-300');
        const passwordAsterisk = await screen.findByTestId("password-error-asterisk");
        expect(passwordAsterisk).toHaveClass('hidden');
        await user.type(screen.getByRole('textbox', { name: 'Email:*' }), 'you@example.com');
        await user.type(passwordInput, "Password123"); // No special symbol
        await user.type(screen.getByLabelText("Confirm Password:*"), "Password123");
        await user.click(screen.getByRole('button', { name: "Register" }));

        expect(passwordAsterisk).not.toHaveClass('hidden');
        expect(passwordAsterisk).toHaveClass('text-red-500');
        expect(passwordInput).toHaveClass('border-red-300');
    })

    // Test 11
    it('\"Confirm Password\" label and input show error styling when register() rejects with an \"invalid password\" error', async () => {
        vi.spyOn(authApi, 'register').mockRejectedValue(new ValidationError("Invalid password"));
        
        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });

        const user = userEvent.setup();
        const confirmPasswordInput = screen.getByLabelText("Confirm Password:*");
        expect(confirmPasswordInput).toHaveClass('border-gray-300');
        const confirmPasswordAsterisk = await screen.findByTestId("confirm-password-error-asterisk");
        expect(confirmPasswordAsterisk).toHaveClass('hidden');
        await user.type(screen.getByRole('textbox', { name: 'Email:*' }), 'you@example.com');
        await user.type(confirmPasswordInput, "Password123"); // No special symbol
        await user.type(screen.getByLabelText("Confirm Password:*"), "Password123");
        await user.click(screen.getByRole('button', { name: "Register" }));

        expect(confirmPasswordAsterisk).not.toHaveClass('hidden');
        expect(confirmPasswordAsterisk).toHaveClass('text-red-500');
        expect(confirmPasswordInput).toHaveClass('border-red-300');
    })

    // Test 12
    it('shows invalid password tooltip when register() returns with \"Invalid password\" error', async () => {
        vi.spyOn(authApi, 'register').mockRejectedValue(new ValidationError("Invalid password"));
        
        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });

        const user = userEvent.setup();
        await user.type(screen.getByRole('textbox', { name: "Email:*" }), 'user@example.com');
        await user.type(screen.getByLabelText("Password:*"), "PasswordWithNoDigits@");
        await user.type(screen.getByLabelText("Confirm Password:*"), "PasswordWithNoDigits@");
        await user.click(screen.getByRole('button', { name: "Register" }));

        expect(screen.getByText("Password must contain:")).toBeInTheDocument();
    })

    // Test 13
    it('displays the \"Passwords do not match\" message when register() returns with a \"Passwords do not match\" error', async () => {
        vi.spyOn(authApi, 'register').mockRejectedValue(new ValidationError("Passwords do not match"));
        
        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });

        const user = userEvent.setup();
        await user.type(screen.getByRole('textbox', { name: "Email:*" }), 'user@example.com');
        await user.type(screen.getByLabelText("Password:*"), "Password123@");
        await user.type(screen.getByLabelText("Confirm Password:*"), "Password123@@");
        await user.click(screen.getByRole('button', { name: "Register" }));
        
        expect(screen.getByText("The passwords do not match.")).toBeInTheDocument();
    })

    // Test 14
    it('displays the conflict message when register() returns with a "Conflict" error', async () => {
        vi.spyOn(authApi, 'register').mockRejectedValue(new ValidationError("Conflict"));
        
        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });

        const user = userEvent.setup();
        await user.type(screen.getByRole('textbox', { name: "Email:*" }), 'user@example.com');
        await user.type(screen.getByLabelText("Password:*"), "Password123@");
        await user.type(screen.getByLabelText("Confirm Password:*"), "Password123@");
        await user.click(screen.getByRole('button', { name: "Register" }));

        expect(screen.getByText("The email provided is already associated")).toBeInTheDocument();
    })

    // Test 15
    it('shows invalid email and invalid password tooltips when register() returns with "Invalid email and invalid password" error', async () => {
        vi.spyOn(authApi, 'register').mockRejectedValue(new ValidationError("Invalid email and invalid password"));
        
        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });

        const user = userEvent.setup();
        await user.type(screen.getByRole('textbox', { name: "Email:*" }), 'bademailexample');
        await user.type(screen.getByLabelText("Password:*"), "PasswordWithNoDigits@");
        await user.type(screen.getByLabelText("Confirm Password:*"), "PasswordWithNoDigits@");
        await user.click(screen.getByRole('button', { name: "Register" }));

        expect(screen.getByText("Use a valid email format. Example: user@example.com")).toBeInTheDocument();
        expect(screen.getByText("Password must contain:")).toBeInTheDocument();
    })

    // Test 16
    it('shows email label with red asterisk and email input border is red when register() rejects with an "no email" error', async () => {
        vi.spyOn(authApi, 'register').mockRejectedValue(new ValidationError("No email"));
        
        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });

        const user = userEvent.setup();
        const emailInput = screen.getByRole('textbox', { name: "Email:*" });
        const emailAsterisk = await screen.findByTestId("email-error-asterisk");
        expect(emailAsterisk).toHaveClass("hidden");
        await user.type(screen.getByLabelText("Password:*"), "Password123@");
        await user.type(screen.getByLabelText("Confirm Password:*"), "Password123@");
        await user.click(screen.getByRole('button', { name: "Register" }));

        expect(emailInput).toHaveClass("border-red-300");
        expect(emailAsterisk).not.toHaveClass("hidden");
        expect(emailAsterisk).toHaveClass("text-red-500");
    })

    // Test 17
    it('shows both the email required and password tooltips when a user submits without entering any input', async () => {
        vi.spyOn(authApi, 'register').mockRejectedValue(new ValidationError("No email and invalid password"));

        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });

        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: "Register" }));

        expect (screen.getByText("An email address is required to create an account.")).toBeInTheDocument();
        expect (screen.getByText("Password must contain:")).toBeInTheDocument();
    })

    it('removes error styling from \"Email\" label and input when user types into email input', async () => {
        vi.spyOn(authApi, 'register').mockRejectedValueOnce(new ValidationError("No email and invalid password"));

        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });

        const user = userEvent.setup();
        const emailErrorAsterisk = await screen.findByTestId("email-error-asterisk");
        const emailInput = screen.getByRole('textbox', { name: "Email:*" });
        expect(emailErrorAsterisk).toHaveClass('hidden');
        expect(emailErrorAsterisk).not.toHaveClass('text-red-500');
        await user.type(screen.getByLabelText("Password:*"), 'Password123'); // No special character
        await user.type(screen.getByLabelText("Confirm Password:*"), 'Password123');
        await user.click(screen.getByRole('button', { name: "Register" }));
        expect(emailErrorAsterisk).not.toHaveClass('hidden');
        expect(emailErrorAsterisk).toHaveClass('text-red-500');

        // Type into "Email" input
        await user.type(emailInput, 'you@example.com');
        expect(emailErrorAsterisk).toHaveClass('hidden');
        expect(emailErrorAsterisk).not.toHaveClass('text-red-500');
    })

    it('removes error styling from \"Password\" label and input when user types into email input', async () => {
        vi.spyOn(authApi, 'register').mockRejectedValueOnce(new ValidationError("No email and invalid password"));

        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });

        const user = userEvent.setup();
        const passwordErrorAsterisk = await screen.findByTestId("password-error-asterisk");
        const passwordInput = screen.getByLabelText("Password:*");
        expect(passwordErrorAsterisk).toHaveClass('hidden');
        expect(passwordErrorAsterisk).not.toHaveClass('text-red-500');
        expect(passwordInput).toHaveClass('border-gray-300');
        expect(passwordInput).not.toHaveClass('border-red-300');
        await user.type(screen.getByLabelText("Password:*"), 'Password123'); // No special character
        await user.type(screen.getByLabelText("Confirm Password:*"), 'Password123');
        await user.click(screen.getByRole('button', { name: "Register" }));
        expect(passwordErrorAsterisk).not.toHaveClass('hidden');
        expect(passwordErrorAsterisk).toHaveClass('text-red-500');
        expect(passwordInput).not.toHaveClass('border-gray-300');
        expect(passwordInput).toHaveClass('border-red-300');

        // Type into "Password" input
        await user.type(passwordInput, 'Password123@');
        expect(passwordErrorAsterisk).toHaveClass('hidden');
        expect(passwordErrorAsterisk).not.toHaveClass('text-red-500');
        expect(passwordInput).toHaveClass('border-gray-300');
        expect(passwordInput).not.toHaveClass('border-red-300');
    })

    it('removes error styling from \"Confirm Password\" label and input when user types into email input', async () => {
        vi.spyOn(authApi, 'register').mockRejectedValueOnce(new ValidationError("No email and invalid password"));

        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });

        const user = userEvent.setup();
        const confirmPasswordErrorAsterisk = await screen.findByTestId("confirm-password-error-asterisk");
        const confirmPasswordInput = screen.getByLabelText("Confirm Password:*");
        expect(confirmPasswordErrorAsterisk).toHaveClass('hidden');
        expect(confirmPasswordErrorAsterisk).not.toHaveClass('text-red-500');
        expect(confirmPasswordInput).toHaveClass('border-gray-300');
        expect(confirmPasswordInput).not.toHaveClass('border-red-300');
        await user.type(screen.getByLabelText("Password:*"), 'Password123'); // No special character
        await user.type(screen.getByLabelText("Confirm Password:*"), 'Password123');
        await user.click(screen.getByRole('button', { name: "Register" }));
        expect(confirmPasswordErrorAsterisk).not.toHaveClass('hidden');
        expect(confirmPasswordErrorAsterisk).toHaveClass('text-red-500');
        expect(confirmPasswordInput).not.toHaveClass('border-gray-300');
        expect(confirmPasswordInput).toHaveClass('border-red-300');

        // Type into "Confirm Password" input
        await user.type(confirmPasswordInput, 'Password123@');
        expect(confirmPasswordErrorAsterisk).toHaveClass('hidden');
        expect(confirmPasswordErrorAsterisk).not.toHaveClass('text-red-500');
        expect(confirmPasswordInput).toHaveClass('border-gray-300');
        expect(confirmPasswordInput).not.toHaveClass('border-red-300');
    })

    // Need 3 more tests for removing error tooltips

    // Test 18
    it('removes error UI elements from input fields when user types into them', async () => {
        vi.spyOn(authApi, 'register').mockRejectedValueOnce(new ValidationError("No email and invalid password"));

        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });

        const emailErrorAsterisk = await screen.findByTestId("email-asterisk");
        const emailInput = screen.getByRole('textbox', { name: "Email:*" });
        const passwordErrorAsterisk = await screen.findByTestId("password-asterisk");
        const passwordInput = screen.getByLabelText("Password:*");
        const confirmPasswordErrorAsterisk = await screen.findByTestId("confirmPassword-asterisk");
        const confirmPasswordInput = screen.getByLabelText("Confirm Password:*");

        expect(emailErrorAsterisk).toHaveClass('hidden');
        expect(emailInput).not.toHaveClass('border-red-300');
        expect(passwordErrorAsterisk).toHaveClass('hidden');
        expect(passwordInput).not.toHaveClass('border-red-300');
        expect(confirmPasswordErrorAsterisk).toHaveClass('hidden');
        expect(confirmPasswordInput).not.toHaveClass('border-red-300');
        expect(screen.queryByText(/Password must contain:/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/An email address is required to/i)).not.toBeInTheDocument();
        
        const user = userEvent.setup();
        const registerButton = await screen.findByTestId("register-button");
        await user.click(registerButton);
        
        expect(emailErrorAsterisk).toHaveClass('text-red-500');
        expect(emailInput).toHaveClass('border-red-300');
        expect(passwordErrorAsterisk).toHaveClass('text-red-500');
        expect(passwordInput).toHaveClass('border-red-300');
        expect(confirmPasswordErrorAsterisk).toHaveClass('text-red-500');
        expect(confirmPasswordInput).toHaveClass('border-red-300');
        expect(screen.queryByText(/Password must contain:/i)).toBeInTheDocument();
        expect(screen.queryByText(/An email address is required/i)).toBeInTheDocument();

        await user.type(emailInput, 'user@example.com');
        await user.type(passwordInput, 'Passsssword123@');
        await user.type(confirmPasswordInput, 'Password123@@');

        expect(emailErrorAsterisk).toHaveClass('hidden');
        expect(emailInput).not.toHaveClass('border-red-300');
        expect(passwordErrorAsterisk).toHaveClass('hidden');
        expect(passwordInput).not.toHaveClass('border-red-300');
        expect(confirmPasswordErrorAsterisk).toHaveClass('hidden');
        expect(confirmPasswordInput).not.toHaveClass('border-red-300');

        vi.spyOn(authApi, 'register').mockRejectedValueOnce(new ValidationError("Passwords do not match"));
        await user.click(registerButton);

        expect(screen.queryByText(/The passwords do not match./i)).toBeInTheDocument();
        await user.type(passwordInput, 'Password123@@');
        expect(screen.queryByText(/The passwords do not match./i)).not.toBeInTheDocument();
    })

    it('navigates to the landing page if register() succeeds but login() fails', async () => {
        vi.spyOn(authApi, 'register').mockReturnValue(Promise.resolve(true));
        vi.spyOn(authApi, 'login').mockReturnValue(Promise.resolve(false));

        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });
        expect(mockNavigate).not.toHaveBeenCalled();

        const user = userEvent.setup();
        await user.type(screen.getByRole('textbox', { name: "Email:*" }), 'user@example.com');
        await user.type(screen.getByLabelText("Password:*"), 'Password123@');
        await user.type(screen.getByLabelText("Confirm Password:*"), 'Password123@');
        await user.click(await screen.findByTestId("register-button"));

        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/');
    })

    it('shows registration failure tooltip if register() returns false and does not throw an error', async () => {
        vi.spyOn(authApi, 'register').mockReturnValue(Promise.resolve(false));

        render(<RegisterPanel onSuccess={() => {}} />, { wrapper: MemoryRouter });

        const user = userEvent.setup();
        const confirmPasswordInput = screen.getByLabelText("Confirm Password:*");
        await user.type(screen.getByRole('textbox', { name: "Email:*" }), 'user@example.com');
        await user.type(screen.getByLabelText("Password:*"), 'Password123@');
        await user.type(confirmPasswordInput, 'Password123@');

        expect(screen.queryByText(/An error occurred while trying to register/i)).not.toBeInTheDocument();
        await user.click(await screen.findByTestId("register-button"));
        expect(screen.queryByText(/An error occurred while trying to register/i)).toBeInTheDocument();
        await user.type(confirmPasswordInput, 'Password123@');
        expect(screen.queryByText(/An error occurred while trying to register/i)).not.toBeInTheDocument();
    })
})