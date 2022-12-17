module.exports = {
    root: true,
    'extends': [
        'plugin:vue/vue3-essential',
        'plugin:vue/vue3-strongly-recommended',
        'plugin:vue/vue3-recommended',
        'eslint:recommended',
        '@vue/eslint-config-typescript',
        '@vue/eslint-config-prettier',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    rules: {
        quotes: ['warn', 'single', { avoidEscape: true }],
        curly: 'error',
        eqeqeq: ['error', 'always', { 'null': 'ignore' }],
        'vue/component-name-in-template-casing': ['error', 'kebab-case'],
        'vue/v-on-event-hyphenation': ['error'],
        'vue/require-explicit-emits': 'error',
    },
}
