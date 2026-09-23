import '../css/app.css';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { createRoot } from 'react-dom/client';
import { createInertiaApp, router } from '@inertiajs/react';
import Toaster from '@/Components/Toaster';

const appName = import.meta.env.VITE_APP_NAME || 'CodeMaster';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true });
        const page = pages[`./Pages/${name}.tsx`];
        if (!page) {
            throw new Error(`Page not found: ./Pages/${name}.tsx`);
        }
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <>
                <App {...props} />
                <Toaster />
            </>
        );

        // Scroll reveal animations (data-aos attributes); skipped when the user prefers reduced motion
        AOS.init({
            once: true,
            duration: 600,
            easing: 'ease-out-cubic',
            offset: 40,
            disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        });
        // Inertia swaps pages without a reload, so pick up the new page's elements after each visit
        router.on('navigate', () => window.setTimeout(() => AOS.refreshHard(), 50));
    },
    progress: {
        color: '#0a84ff', // primary-500
        showSpinner: true,
    },
});

