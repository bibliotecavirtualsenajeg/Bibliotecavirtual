const saveToken = (token) => {
  localStorage.setItem('token', token);
};

const getToken = () => {
  return localStorage.getItem('token');
};

const clearToken = () => {
  localStorage.removeItem('token');
};

const getUserRole = () => {
  const token = getToken();
  if (!token) {
    return null;
  }
  try {
    // Decodificar el payload del token para obtener el rol
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user.role;
  } catch (e) {
    console.error('Invalid token:', e);
    clearToken();
    return null;
  }
};

export { saveToken, getToken, clearToken, getUserRole };
