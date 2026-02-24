// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  app: {
    head: {
      title: 'Prayer Times Wallpaper Generator | Islamic Salah Timetable',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Generate beautiful phone wallpapers with Islamic prayer (Salah) times. Supports 12+ calculation methods, Hijri calendar, customisable fonts, colours, and backgrounds.' },
        { name: 'keywords', content: 'prayer times, salah times, Islamic wallpaper, prayer timetable, Hijri calendar, Muslim prayer, fajr, dhuhr, asr, maghrib, isha, Ramadan timetable, phone wallpaper generator' },
        { name: 'author', content: 'Ardax' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Prayer Times Wallpaper Generator' },
        { property: 'og:description', content: 'Generate beautiful phone wallpapers with Islamic prayer times. Customise fonts, colours, highlights, and download as high-quality images.' },
        { property: 'og:site_name', content: 'Ardax' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Prayer Times Wallpaper Generator' },
        { name: 'twitter:description', content: 'Generate beautiful phone wallpapers with Islamic prayer times. Supports Hijri calendar, 12+ calculation methods, and full customisation.' },
        { name: 'theme-color', content: '#0891b2' },
      ],
      link: [
        { rel: 'canonical', href: 'https://prayer-times.ardax.dev' },
      ],
    },
  },
  runtimeConfig: {
    public: {
      googleApiKey: process.env.GOOGLE_API_KEY || '',
    },
  },
  modules: [
    'nuxt-swiper',
    "@vueuse/nuxt",
    '@nuxt/ui',
    'nuxt-gtag',
  ],
  css: ['~/assets/css/main.css'],
  nitro: {
    prerender: {
      autoSubfolderIndex: false
    }
  },
  fonts: {
    providers: {
      fontshare: false,
    },
  },
  colorMode: {
    preference: 'dark'
  },
  gtag: {
    id: 'G-5V36NE6QMX'
  }
})