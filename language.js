class LanguageManager {
    constructor() {
        // Intenta obtener el idioma guardado, si no existe, usa 'es' por defecto
        this.currentLang = localStorage.getItem('language') || 'es';
        this.translations = {};
        this.init();
    }

    async init() {
        await this.loadTranslations();
        this.createLanguageSelector();
        this.applyTranslations();
    }

    async loadTranslations() {
        try {
            // Busca el archivo json en la carpeta translations
            const response = await fetch(`translations/${this.currentLang}.json`);
            if (!response.ok) {
                throw new Error(`No se pudo cargar el archivo de idioma: ${response.statusText}`);
            }
            this.translations = await response.json();
        } catch (error) {
            console.error('Error cargando las traducciones:', error);
        }
    }

    createLanguageSelector() {
            const container = document.getElementById('lang-container');
            if (!container) return;

            if (document.getElementById('language-selector')) return;

            const select = document.createElement('select');
            select.id = 'language-selector';
            
            select.innerHTML = `
                <option value="es" ${this.currentLang === 'es' ? 'selected' : ''}>ES</option>
                <option value="en" ${this.currentLang === 'en' ? 'selected' : ''}>EN</option>
            `;

            container.appendChild(select);

            select.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
    }

    async changeLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('language', lang); // Guarda la preferencia
        document.documentElement.lang = lang;   // Cambia el idioma en la etiqueta html
        await this.loadTranslations();
        this.applyTranslations();
    }

    applyTranslations() {
        if (!this.translations) return;

        // Traducir texto normal
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getNestedTranslation(key);
            if (translation) {
                element.textContent = translation;
            }
        });

        // Traducir HTML (si hay etiquetas dentro del texto)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = this.getNestedTranslation(key);
            if (translation) {
                element.innerHTML = translation;
            }
        });

        // Traducir Placeholders (para inputs si los hubiera)
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.getNestedTranslation(key);
            if (translation) {
                element.placeholder = translation;
            }
        });
    }

    getNestedTranslation(key) {
        // Convierte "nav.nacimiento" en la búsqueda dentro del objeto JSON
        return key.split('.').reduce((obj, k) => (obj && obj[k] !== 'undefined') ? obj[k] : null, this.translations);
    }
}

// Inicializar la clase cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    new LanguageManager();
});