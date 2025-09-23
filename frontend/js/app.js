import * as auth from './modules/auth.js';
import * as api from './modules/api.js';
import * as ui from './modules/ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Manejadores de Eventos Principales ---
    const handleLogin = async (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const button = e.target.querySelector('button');
        button.disabled = true;

        try {
            const data = await api.login(usernameInput.value, passwordInput.value);
            auth.saveToken(data.token);
            initializeApp(); // Recargar la vista después del login
        } catch (error) {
            ui.showNotification(error.message, true);
        } finally {
            button.disabled = false;
        }
    };

    const handleLogout = () => {
        auth.clearToken();
        window.location.reload();
    };

    // --- Lógica de Carga de Vistas ---

    const loadAdminData = async () => {
        ui.renderAdminView();
        // Añadir listeners a los formularios y botones recién creados
        document.getElementById('create-user-form').addEventListener('submit', handleCreateUser);
        document.getElementById('upload-book-form-admin').addEventListener('submit', (e) => handleUploadBook(e, 'admin'));

        // Mostrar estado de carga
        ui.renderLoading('user-list');
        ui.renderLoading('book-list-admin');
        ui.renderLoading('book-catalog-admin');

        try {
            const [users, books] = await Promise.all([api.getUsers(), api.getBooks()]);
            ui.renderUserList('user-list', users);
            ui.renderBookManagementList('book-list-admin', books);
            ui.renderBookCatalog('book-catalog-admin', books);
        } catch (error) {
            ui.showNotification(error.message, true);
        }
    };

    const loadProfesorData = async () => {
        ui.renderProfesorView();
        document.getElementById('upload-book-form-profesor').addEventListener('submit', (e) => handleUploadBook(e, 'profesor'));

        ui.renderLoading('book-list-profesor');
        ui.renderLoading('book-catalog-profesor');

        try {
            const books = await api.getBooks();
            ui.renderBookManagementList('book-list-profesor', books);
            ui.renderBookCatalog('book-catalog-profesor', books);
        } catch (error) {
            ui.showNotification(error.message, true);
        }
    };

    const loadEstudianteData = async () => {
        ui.renderEstudianteView();
        ui.renderLoading('book-catalog-estudiante');

        try {
            const books = await api.getBooks();
            ui.renderBookCatalog('book-catalog-estudiante', books);
        } catch (error) {
            ui.showNotification(error.message, true);
        }
    };

    // --- Manejadores de Acciones ---

    const handleCreateUser = async (e) => {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('button');
        button.disabled = true;

        const username = document.getElementById('new-username').value;
        const password = document.getElementById('new-password').value;
        const role = document.getElementById('new-role').value;

        try {
            await api.createUser(username, password, role);
            ui.showNotification('Usuario creado exitosamente', false);
            form.reset(); // Limpiar formulario
            const users = await api.getUsers(); // Recargar lista de usuarios
            ui.renderUserList('user-list', users);
        } catch (error) {
            ui.showNotification(error.message, true);
        } finally {
            button.disabled = false;
        }
    };

    const handleUploadBook = async (e) => {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('button');
        button.disabled = true;

        const formData = new FormData(form);

        try {
            await api.uploadBook(formData);
            ui.showNotification('Libro subido exitosamente', false);
            form.reset(); // Limpiar formulario
            initializeApp(); // Recargar toda la vista para ver los cambios
        } catch (error) {
            ui.showNotification(error.message, true);
        } finally {
            button.disabled = false;
        }
    };

    const handleUpdateBook = async (e) => {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;

        const bookId = ui.editBookIdInput.value;
        const formData = new FormData(form);

        try {
            await api.updateBook(bookId, formData);
            ui.hideEditBookModal();
            ui.showNotification('Libro actualizado exitosamente', false);
            initializeApp(); // Recargar la vista para ver los cambios
        } catch (error) {
            ui.showNotification(error.message, true);
        } finally {
            button.disabled = false;
        }
    };

    const handleViewClick = async (e) => {
        const target = e.target;
        const id = target.dataset.id;

        if (target.classList.contains('btn-delete-user')) {
            if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
                target.disabled = true;
                try {
                    await api.deleteUser(id);
                    ui.showNotification('Usuario eliminado', false);
                    const users = await api.getUsers(); // Recargar solo la lista de usuarios
                    ui.renderUserList('user-list', users);
                } catch (error) {
                    ui.showNotification(error.message, true);
                    target.disabled = false;
                }
            }
        } else if (target.classList.contains('btn-delete-book')) {
            if (confirm('¿Estás seguro de que quieres eliminar este libro?')) {
                target.disabled = true;
                try {
                    await api.deleteBook(id);
                    ui.showNotification('Libro eliminado', false);
                    initializeApp(); // Recargar la vista
                } catch (error) {
                    ui.showNotification(error.message, true);
                    target.disabled = false;
                }
            }
        } else if (target.classList.contains('btn-edit-book')) {
            try {
                const book = await api.getBookById(id);
                ui.showEditBookModal(book);
            } catch (error) {
                ui.showNotification(error.message, true);
            }
        }
    };

    // --- Inicialización de la Aplicación ---

    const initializeApp = () => {
        const userRole = auth.getUserRole();
        if (userRole) {
            ui.showView(userRole, loadAdminData, loadProfesorData, loadEstudianteData);
        } else {
            // Asegurarse de que solo se muestre la vista de login
            ui.loginView.classList.remove('d-none');
            ui.adminView.classList.add('d-none');
            ui.profesorView.classList.add('d-none');
            ui.estudianteView.classList.add('d-none');
            ui.logoutButton.classList.add('d-none');
        }
    };

    // Asignación de Eventos
    ui.logoutButton.addEventListener('click', handleLogout);
    const loginForm = document.getElementById('login-form');
    if(loginForm) loginForm.addEventListener('submit', handleLogin);

    // Listener para el formulario del modal de edición
    ui.editBookForm.addEventListener('submit', handleUpdateBook);

    // Usamos delegación de eventos en los contenedores de las vistas
    ui.adminView.addEventListener('click', handleViewClick);
    ui.profesorView.addEventListener('click', handleViewClick);

    // Iniciar la aplicación
    initializeApp();
});
