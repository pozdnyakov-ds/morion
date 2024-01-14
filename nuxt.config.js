export default defineNuxtConfig({
  ssr: false,
  components: [
    { path: '~/components' },
    { path: '~/components/navigation' },
  ],
  devServer: {
    port: 3000,
  },
  app: {
    //pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: "Morion - панель управления",
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      script: [],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap' },
      ],
      style: [],
      noscript: []
    }
  },
  css: ['vuetify/lib/styles/main.sass'],
  build: {
    transpile: ['vuetify', 'vue-resizer'],
  },
  runtimeConfig: {
    MYSQL_HOST: process.env.MYSQL_HOST,
    MYSQL_PORT: process.env.MYSQL_PORT,
    MYSQL_DATABASE: process.env.MYSQL_DATABASE,
    MYSQL_USER: process.env.MYSQL_USER,
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,

    RECAPTCHA_SERVER_KEY: process.env.RECAPTCHA_SERVER_KEY,
    RECAPTCHA_SCORE: process.env.RECAPTCHA_SCORE,

    MAIL_HOST: process.env.MAIL_HOST,
    MAIL_PORT: process.env.MAIL_PORT,
    MAIL_SECURE: process.env.MAIL_SECURE,
    MAIL_AUTH_USER: process.env.MAIL_AUTH_USER,
    MAIL_AUTH_PASS: process.env.MAIL_AUTH_PASS,
    MAIL_DOMAIN_NAME: process.env.MAIL_DOMAIN_NAME,
    MAIL_TOKEN_SECRET: process.env.MAIL_TOKEN_SECRET,

    JWT_SECRET: process.env.JWT_SECRET,
    JWT_ACCESS_TOKEN_EXPIRATION: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
    JWT_ACCESS_TOKEN_EXPIRATION_DAYS: process.env.JWT_ACCESS_TOKEN_EXPIRATION_DAYS,

    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    OKDESK_TOKEN: process.env.OKDESK_TOKEN,

    PDF_FILENAME: process.env.PDF_FILENAME,
    MORION_UL: process.env.MORION_UL,
    MORION_INN: process.env.MORION_INN,
    MORION_KPP: process.env.MORION_KPP,
    MORION_ACCOUNT: process.env.MORION_ACCOUNT,
    MORION_ADDRESS: process.env.MORION_ADDRESS,
    MORION_STAMP: process.env.MORION_STAMP,

    MORION_BANK_NAME: process.env.MORION_BANK_NAME,
    MORION_BANK_BIC: process.env.MORION_BANK_BIC,
    MORION_BANK_ACCOUNT: process.env.MORION_BANK_ACCOUNT,

    MORION_SIGN_1_POSITION: process.env.MORION_SIGN_1_POSITION,
    MORION_SIGN_1_FIO: process.env.MORION_SIGN_1_FIO,
    MORION_SIGN_1_FACSIMILE: process.env.MORION_SIGN_1_FACSIMILE,

    MORION_SIGN_2_POSITION: process.env.MORION_SIGN_2_POSITION,
    MORION_SIGN_2_FIO: process.env.MORION_SIGN_2_FIO,
    MORION_SIGN_2_FACSIMILE: process.env.MORION_SIGN_2_FACSIMILE,

    public: {
      BASE_URL: process.env.NODE_ENV === "development"
      ? "https://localhost:3000"
      : "https://display24.ru",
      RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY,
      REDIRECT_URI: process.env.REDIRECT_URI,
      SPREAD_SHEET_ID: process.env.SPREAD_SHEET_ID
    }  
  },
  modules: [
    '@vueuse/nuxt',
    '@nuxtjs/robots',
    'nuxt-highcharts',
    [
      '@pinia/nuxt',
      {
        autoImports: ['defineStore', 'acceptHMRUpdate'],
      },
    ],
  ],
  robots: {
    UserAgent: '*',
    Disallow: '/*?'
  },
  vite: {
    plugins: [
      require('dotenv').config()
    ]
  },
  imports: {
    dirs: ['stores'],
  }
})