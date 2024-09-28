module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@stylistic',
    '@stylistic/ts',
    '@typescript-eslint',
    'import',
    'import-newlines',
  ],
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  rules: {
    'no-debugger': 'error',
    'no-console': 'error',
    'no-unsafe-negation': 'error',
    '@stylistic/arrow-parens': ['error', 'as-needed'],
    '@stylistic/quote-props': ['error', 'as-needed'],
    '@stylistic/ts/comma-spacing': 'error',
    '@stylistic/no-trailing-spaces': 'error',
    '@stylistic/ts/indent': [
      'error',
      2,
      {
        VariableDeclarator: { var: 2, let: 2, const: 3 },
        SwitchCase: 1,
        CallExpression: { arguments: 'first' },
        ObjectExpression: 'first',
        CallExpression: { arguments: 'first' },
      },
    ],
    'import/first': 'error',
    'no-duplicate-imports': 'error',
    'import/no-duplicates': 'error',
    'import/newline-after-import': 'error',
    'import/order': [
      'error',
      { 'newlines-between': 'never' },
    ],
    'import-newlines/enforce': [
      'error',
      {
        'max-len': 65,
        semi: false,
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: 'options',
        destructuredArrayIgnorePattern: '^_',
      },
    ],
    '@stylistic/ts/semi': ['error', 'never'],
    '@stylistic/ts/member-delimiter-style': [
      'error',
      {
        multiline: { delimiter: 'comma', requireLast: true },
        singleline: { delimiter: 'comma', requireLast: false },
      },
    ],
    '@stylistic/ts/quotes': ['error', 'single'],
    '@stylistic/ts/comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'ignore',
        generics: 'always-multiline',
        tuples: 'always-multiline',
      },
    ],
    '@stylistic/ts/object-curly-spacing': ['error', 'always'],
    '@typescript-eslint/no-for-in-array': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
  },
}
