import { getToken } from './auth.js';

// La URL base ya no es necesaria. Usamos rutas relativas.
// El servidor que sirve el frontend también sirve la API.

async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        ...options.headers,
    };

    if (token) {
        headers['x-auth-token'] = token;
    }

    // El navegador establece el Content-Type automáticamente para FormData
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        // Usamos el endpoint directamente como una ruta relativa
        const response = await fetch(endpoint, {
            ...options,
            headers,
        });

        // Si la respuesta no tiene contenido, no intentes parsear JSON
        if (response.status === 204) {
            return null;
        }
        
        const data = await response.json();

        if (!response.ok) {
            // Si la respuesta no es OK, lanzamos un error con el mensaje del servidor
            const errorMessage = (data.errors && data.errors[0] && Object.values(data.errors[0])[0]) || data.msg || 'Error en la petición a la API';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error('Error en apiFetch:', error);
        // Re-lanzamos el error para que el código que llama a la función pueda manejarlo
        throw error;
    }
}

// --- Endpoints de la API ---

export const login = (username, password) => {
    return apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
};

export const getUsers = () => apiFetch('/api/users');

export const createUser = (username, password, role) => {
    return apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ username, password, role }),
    });
};

export const deleteUser = (id) => apiFetch(`/api/users/${id}`, { method: 'DELETE' });

export const getBooks = () => apiFetch('/api/books');

export const uploadBook = (formData) => {
    return apiFetch('/api/books', {
        method: 'POST',
        body: formData,
    });
};

export const deleteBook = (id) => apiFetch(`/api/books/${id}`, { method: 'DELETE' });

export const getBookById = (id) => apiFetch(`/api/books/${id}`);

// Simplificado para ser consistente con las otras funciones
export const updateBook = (id, formData) => {
    return apiFetch(`/api/books/${id}`, {
        method: 'PUT',
        body: formData,
    });
};
