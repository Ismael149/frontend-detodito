export const getLevenshteinDistance = (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
};

export const findBestMatch = (input: string, patterns: string[]): { match: string; score: number } | null => {
    let bestMatch = null;
    let bestScore = Infinity;

    // Normalizar entrada
    const normalizedInput = input.toLowerCase().trim();

    for (const pattern of patterns) {
        // Si el patrón es una expresión regular compleja, usarla tal cual
        if (pattern.includes('|')) {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(normalizedInput)) {
                return { match: pattern, score: 0 }; // Match exacto/regex
            }
            continue;
        }

        // Para palabras simples o frases cortas, usar Levenshtein
        const distance = getLevenshteinDistance(normalizedInput, pattern);

        // Calcular score relativo al largo (para permitir más errores en frases largas)
        // Score menor es mejor
        if (distance < bestScore) {
            bestScore = distance;
            bestMatch = pattern;
        }
    }

    return { match: bestMatch!, score: bestScore };
};
