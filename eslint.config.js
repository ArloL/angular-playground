// @ts-check
import angularEslint from 'angular-eslint';
import tsEslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default tsEslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      ...tsEslint.configs.recommended,
      ...angularEslint.configs.tsRecommended,
    ],
    processor: angularEslint.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: ['apezzi', 'app'], style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: ['apezzi', 'app'], style: 'kebab-case' },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          overrides: { constructors: 'no-public' },
        },
      ],
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angularEslint.configs.templateRecommended],
    rules: {},
  },
  eslintConfigPrettier,
);
