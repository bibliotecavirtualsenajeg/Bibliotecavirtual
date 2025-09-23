// Exportamos referencias a los elementos principales del DOM
export const loginView = document.getElementById('login-view');
export const adminView = document.getElementById('admin-view');
export const profesorView = document.getElementById('profesor-view');
export const estudianteView = document.getElementById('estudiante-view');
export const logoutButton = document.getElementById('logout-button');

// Referencias al Modal de Edición
export const editBookModalEl = document.getElementById('editBookModal');
export const editBookForm = document.getElementById('edit-book-form');
export const editBookIdInput = document.getElementById('edit-book-id');
export const editBookTitleInput = document.getElementById('edit-book-title');
export const editBookAreaInput = document.getElementById('edit-book-area');
export const editBookImageInput = document.getElementById('edit-book-image'); // Corrected export

// Instancia del Modal de Bootstrap
const editModal = new bootstrap.Modal(editBookModalEl);

// --- Funciones de UI/UX ---

export function showNotification(message, isError = true) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${isError ? 'is-danger' : 'is-success'}`;
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 4000);
}

export function renderLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading-message">Cargando...</div>';
    }
}

// --- Funciones de renderizado de vistas principales ---

export function showView(role, onAdminLoad, onProfesorLoad, onEstudianteLoad) {
    loginView.classList.add('d-none');
    adminView.classList.add('d-none');
    profesorView.classList.add('d-none');
    estudianteView.classList.add('d-none');
    logoutButton.classList.remove('d-none');

    if (role === 'Admin') {
        adminView.classList.remove('d-none');
        if (onAdminLoad) onAdminLoad();
    } else if (role === 'Profesor') {
        profesorView.classList.remove('d-none');
        if (onProfesorLoad) onProfesorLoad();
    } else if (role === 'Estudiante') {
        estudianteView.classList.remove('d-none');
        if (onEstudianteLoad) onEstudianteLoad();
    }
}

// --- Renderizado de componentes reutilizables ---

export function renderBookCatalog(elementId, books) {
    const bookList = document.getElementById(elementId);
    if (!bookList) return;
    bookList.innerHTML = '';
    if (books.length === 0) {
        bookList.innerHTML = '<p class="text-muted">No hay libros en el catálogo.</p>';
        return;
    }
    books.forEach(book => {
        // Con los cambios en el backend, filePath y imagePath son solo los nombres de archivo.
        // Usamos rutas relativas para que funcionen tanto en desarrollo como en producción.
        const bookUrl = `/uploads/${book.filePath}`;
        const imageUrl = book.imagePath ? `/uploads/${book.imagePath}` : 'https://via.placeholder.com/150?text=No+Image';

        const bookCard = `
            <div class="col-md-4">
                <div class="card mb-4">
                    <img src="${imageUrl}" class="card-img-top" alt="Portada del libro" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${book.titulo}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${book.area}</h6>
                        <a href="${bookUrl}" class="btn btn-primary" target="_blank">Leer</a>
                    </div>
                </div>
            </div>`;
        bookList.innerHTML += bookCard;
    });
}

export function renderUserList(elementId, users) {
    const userList = document.getElementById(elementId);
    if (!userList) return;
    userList.innerHTML = '';
    if (users.length === 0) {
        userList.innerHTML = '<li class="list-group-item">No hay usuarios registrados.</li>';
        return;
    }
    users.forEach(user => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <span>${user.username} - <strong>${user.role}</strong></span>
            <button class="btn-delete-user btn btn-danger btn-sm" data-id="${user._id}">Eliminar</button>`;
        userList.appendChild(li);
    });
}

export function renderBookManagementList(elementId, books) {
    const bookList = document.getElementById(elementId);
    if (!bookList) return;
    bookList.innerHTML = '';
    if (books.length === 0) {
        bookList.innerHTML = '<li class="list-group-item">No has subido ningún libro.</li>';
        return;
    }
    books.forEach(book => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <span>${book.titulo} - <strong>${book.area}</strong></span>
            <div>
                <button class="btn-edit-book btn btn-secondary btn-sm" data-id="${book._id}">Editar</button>
                <button class="btn-delete-book btn btn-danger btn-sm" data-id="${book._id}">Eliminar</button>
            </div>`;
        bookList.appendChild(li);
    });
}

// --- Renderizado de Vistas Específicas ---

export function renderAdminView() {
    adminView.innerHTML = `
        <h2>Panel de Administrador</h2>
        <div class="my-4 p-4 border rounded">
            <h4>Gestión de Usuarios</h4>
            <form id="create-user-form" class="mb-4">
                <h5>Crear Nuevo Usuario</h5>
                <div class="row">
                    <div class="col-md-4"><input type="text" id="new-username" class="form-control" placeholder="Nombre de usuario" required></div>
                    <div class="col-md-3"><input type="password" id="new-password" class="form-control" placeholder="Contraseña" required></div>
                    <div class="col-md-3"><select id="new-role" class="form-select"><option value="Estudiante">Estudiante</option><option value="Profesor">Profesor</option></select></div>
                    <div class="col-md-2"><button type="submit" class="btn btn-primary">Crear</button></div>
                </div>
            </form>
            <h5>Lista de Usuarios</h5>
            <ul id="user-list" class="list-group"></ul>
        </div>
        <div class="my-4 p-4 border rounded">
            <h4>Gestión de Libros</h4>
            <form id="upload-book-form-admin" enctype="multipart/form-data" class="mb-4">
                <h5>Subir Nuevo Libro</h5>
                <div class="row">
                    <div class="col-md-4"><input type="text" id="book-title-admin" name="titulo" class="form-control" placeholder="Título del libro" required></div>
                    <div class="col-md-3"><input type="text" id="book-area-admin" name="area" class="form-control" placeholder="Área del libro" required></div>
                    <div class="col-md-3"><input type="file" id="book-file-admin" name="file" class="form-control" accept=".pdf" required></div>
                    <div class="col-md-3"><input type="file" id="book-image-admin" name="image" class="form-control" accept="image/*"></div> <!-- New image input -->
                    <div class="col-md-2"><button type="submit" class="btn btn-primary">Subir</button></div>
                </div>
            </form>
            <h5>Lista de Libros (Gestión)</h5>
            <ul id="book-list-admin" class="list-group"></ul>
        </div>
        <div class="my-4 p-4 border rounded">
            <h4>Catálogo de Libros (Vista de Lectura)</h4>
            <div id="book-catalog-admin" class="row"></div>
        </div>
    `;
}

export function renderProfesorView() {
    profesorView.innerHTML = `
        <h2>Panel de Profesor</h2>
        <div class="my-4 p-4 border rounded">
            <h4>Gestión de Libros</h4>
            <form id="upload-book-form-profesor" enctype="multipart/form-data" class="mb-4">
                <h5>Subir Nuevo Libro</h5>
                <div class="row">
                    <div class="col-md-4"><input type="text" id="book-title-profesor" name="titulo" class="form-control" placeholder="Título del libro" required></div>
                    <div class="col-md-3"><input type="text" id="book-area-profesor" name="area" class="form-control" placeholder="Área del libro" required></div>
                    <div class="col-md-3"><input type="file" id="book-file-profesor" name="file" class="form-control" accept=".pdf" required></div>
                    <div class="col-md-3"><input type="file" id="book-image-profesor" name="image" class="form-control" accept="image/*"></div> <!-- New image input -->
                    <div class="col-md-2"><button type="submit" class="btn btn-primary">Subir</button></div>
                </div>
            </form>
            <h5>Mis Libros (Gestión)</h5>
            <ul id="book-list-profesor" class="list-group"></ul>
        </div>
        <div class="my-4 p-4 border rounded">
            <h4>Catálogo de Libros (Vista de Lectura)</h4>
            <div id="book-catalog-profesor" class="row"></div>
        </div>
    `;
}

export function renderEstudianteView() {
    estudianteView.innerHTML = `
        <h2>Catálogo de Libros</h2>
        <div id="book-catalog-estudiante" class="row"></div>`;
}

// --- Funciones del Modal de Edición ---

export function showEditBookModal(book) {
  if (!book) return;
  editBookIdInput.value = book._id;
  editBookTitleInput.value = book.titulo;
  editBookAreaInput.value = book.area;
  editBookImageInput.value = ''; // Clear the file input
  editModal.show();
}

export function hideEditBookModal() {
  editModal.hide();
}