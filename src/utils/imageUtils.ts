import { environment } from '../environments/environment';

/**
 * Utility to get the full URL for an image.
 * Handles:
 * 1. Absolute URLs (Cloudinary, external links)
 * 2. Data URLs (Base64)
 * 3. Relative paths (Legacy local uploads)
 */
export const getImageUrl = (urlToUse?: string | null): string => {
    if (!urlToUse) return '';

    if (typeof urlToUse !== 'string') return '';

    // Devolver tal cual si ya es absoluta o es data URL
    if (urlToUse.startsWith('http') || urlToUse.startsWith('data:')) {
        return urlToUse;
    }

    // Manejar rutas relativas
    const baseUrl = environment.apiUrl.replace('/api', '');
    let path = urlToUse;

    // Ensure path starts with /
    if (!path.startsWith('/')) path = '/' + path;

    // Don't prefix /uploads if it's already there or if it's a local asset
    if (!path.startsWith('/uploads') && !path.startsWith('/assets')) {
        path = '/uploads' + path;
    }

    return `${baseUrl}${path}`;
};
