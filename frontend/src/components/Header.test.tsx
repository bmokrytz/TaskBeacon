// src/components/Header.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Header from '@/components/Header';

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

describe('Header', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    })

    it('renders correctly with app title and logout button present', () => {
        render(<Header />, { wrapper: MemoryRouter });

        expect(screen.queryByText("Task Beacon")).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
    })
})
