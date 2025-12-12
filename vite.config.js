import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/style.css', 
                'resources/css/sign-in.css', 
                'resources/js/main.js',
                'resources/js/sign-up.js',
                'resources/js/sign-in.js',
                'resources/js/top-category.js',
                'resources/js/top-products.js',
                'resources/js/top-stores.js',
                'resources/js/filter-component.js',
                'resources/js/overview.js'
            ],
            refresh: true,
        }),
        tailwindcss(),
    ],
});
