import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';

// boostrap 5
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// components
import AppMain from './components/AppMain.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '',
            component: AppMain,
            children: [
                {
                    path: '',
                    name: 'home',
                    sensitive: true,
                    components: {
                        default: () => import('./components/AppHome.vue'),
                        navbar: () => import('./components/AppNavbar.vue'),
                        footer: () => import('./components/AppFooter.vue')
                    }
                },
                {
                    path: '/first-steps',
                    name: 'tutorial',
                    sensitive: true,
                    components: {
                        default: () => import('./components/AppTutorial.vue'),
                        navbar: () => import('./components/AppNavbar.vue'),
                        footer: () => import('./components/AppFooter.vue')
                    }
                },
                {
                    path: '/history',
                    name: 'history',
                    sensitive: true,
                    components: {
                        default: () => import('./components/AppHistory.vue'),
                        navbar: () => import('./components/AppNavbar.vue'),
                        footer: () => import('./components/AppFooter.vue')
                    }
                },
                {
                    path: '/about',
                    name: 'about',
                    sensitive: true,
                    components: {
                        default: () => import('./components/AppAbout.vue'),
                        navbar: () => import('./components/AppNavbar.vue'),
                        footer: () => import('./components/AppFooter.vue')
                    }
                },
                {
                    path: '/oauth',
                    name: 'oauth',
                    component: () => import('./components/partials/OauthCallback.vue')
                }
            ]
        },
    ],
});

createApp(App)
    .use(router)
    .mount('#app');