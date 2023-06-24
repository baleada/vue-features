module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'import',
  ],
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  rules: {
    'arrow-parens': ['error', 'as-needed'],
    'quote-props': ['error', 'as-needed'],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: 'options' },
    ],
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/order': [
      'error',
      { 'newlines-between': 'never' },
    ],
    'no-debugger': 'error',
    'no-console': 'error',
    'no-unsafe-negation': 'error',
    '@typescript-eslint/semi': ['error', 'never'],
    '@typescript-eslint/quotes': ['error', 'single'],
    '@typescript-eslint/comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'ignore',
        generics: 'never',
        tuples: 'always-multiline',
      },
    ],
    '@typescript-eslint/object-curly-spacing': ['error', 'always'],
    '@typescript-eslint/no-for-in-array': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports' },
    ],
  },
}
