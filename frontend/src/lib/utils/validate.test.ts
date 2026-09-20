// src/lib/utils/validate.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { validateEmail, validatePassword, isLoggedIn, validatePasswordMatch } from './validate';

describe('validateEmail', () => {
    it('accepts a normal email', () => {
        expect(validateEmail('username@example.com')).toBe(true);
    })

    it('rejects a string with no @', () => {
        expect(validateEmail('usernameexample.com')).toBe(false);
    })

    it('rejects an empty string', () => {
        expect(validateEmail('')).toBe(false);
    })

    it('rejects a string with no prefix before @', () => {
        expect(validateEmail('@example.com')).toBe(false);
    })

    it('rejects a string with no period', () => {
        expect(validateEmail('username@examplecom')).toBe(false);
    })

    it('accepts an email exactly at the 254 character limit', () => {
        const local = 'a'.repeat(242);
        const testEmail = `${local}@example.com`; 
        expect(testEmail.length).toBe(254);
        expect(validateEmail(testEmail)).toBe(true);
    })
    
    it('rejects an email with more than 254 characters', () => {
        const local = 'a'.repeat(243);
        const testEmail = `${local}@example.com`; 
        expect(testEmail.length).toBe(255);
        expect(validateEmail(testEmail)).toBe(false);
    })
});

describe('validatePassword', () => {
    it('accepts a password meeting all requirements', () => {
        expect(validatePassword('Password123@')).toBe(true);
    })

    it('rejects a password missing a special character', () => {
        expect(validatePassword('Password123')).toBe(false);
    })

    it('rejects a password with no digits', () => {
        expect(validatePassword('Password@')).toBe(false);
    })

    it('rejects a password with no uppercase letters', () => {
        expect(validatePassword('password123@')).toBe(false);
    })

    it('rejects a password with no lowercase letters', () => {
        expect(validatePassword('PASSWORD123@')).toBe(false);
    })

    it('accepts a password exactly at the 8 character minimum length', () => {
        expect(validatePassword('Pord123@')).toBe(true);
    })

    it('rejects a password shorter than 8 characters', () => {
        expect(validatePassword('Pass1@')).toBe(false);
    })

    it('accepts a password exactly at the 128 character limit', () => {
        const repeat = 's'.repeat(118);
        const password = `Pa${repeat}word123@`;
        expect(password.length).toBe(128);
        expect(validatePassword(password)).toBe(true);
    })
    
    it('rejects a password longer than 128 characters', () => {
        const repeat = 's'.repeat(119);
        const password = `Pa${repeat}word123@`;
        expect(password.length).toBe(129);
        expect(validatePassword(password)).toBe(false);
    })
})

describe('validatePasswordsMatch', () => {
    it('accepts two matching password strings', () => {
        const password = 'Password123@';
        const confirmPassword = 'Password123@';
        expect(validatePasswordMatch(password, confirmPassword)).toBe(true);
    })

    it('rejects two non-matching password strings', () => {
        const password = 'Password123@';
        const confirmPassword = 'Password123@@@';
        expect(validatePasswordMatch(password, confirmPassword)).toBe(false);
    })

    it('accepts two empty password strings', () => {
        const password = '';
        const confirmPassword = '';
        expect(validatePasswordMatch(password, confirmPassword)).toBe(true);
    })

    it('accepts two matching invalid password strings', () => {
        const password = 'NoDigits@';
        const confirmPassword = 'NoDigits@';
        expect(validatePasswordMatch(password, confirmPassword)).toBe(true);
    })
})

describe('isLoggedIn', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('returns false when no access_token is stored', () => {
        expect(isLoggedIn()).toBe(false);
    })

    it ('returns true when an access_token is present', () => {
        localStorage.setItem('access_token', 'fake-test-token');
        expect(isLoggedIn()).toBe(true);
    })
})