const eslintConfig = [
  {
    ignores: ['dist/*'],
    files: [
      '**/*.js',
      '**/*.jsx',
      '**/*.mjs',
      '**/*.ts',
      '**/*.tsx',
      '**/*.mts',
    ],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    plugins: {
      import: require('eslint-plugin-import'),
    },
    rules: {
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            {
              pattern: '{react,react-dom/**,next,next/**}',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
];

module.exports = eslintConfig;
