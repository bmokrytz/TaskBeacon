export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase();
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
}

export function toDateInputValue(dateString: string | null | undefined): string | null | undefined {
    return dateString ? dateString.slice(0, 10) : dateString;
}