module.exports = {
  'env': {
    'browser': true,
    'es6': true,
  },
  'settings': {
    'react': {
      'version': 'detect'
    }
  },
  'extends': [
    'google',
    'plugin:react/recommended'
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parser': 'babel-eslint',
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
    },
    'ecmaVersion': 2018,
    'sourceType': 'module',
  },
  'plugins': [
    'react',
  ],
  'rules': {
    'arrow-spacing': 'warn',
    'camelcase': 'off',
    'generator-star-spacing': ['warn', { 'before': true, 'after': false}],
    'keyword-spacing': 'warn',
    'max-len': 'off',
    'new-cap': 'off',
    'no-invalid-this': 'off',
    'object-curly-spacing': ['error', 'always'],
    'prefer-promise-reject-errors': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'require-jsdoc': 'off',
    'semi': ['error', 'never'],
    'space-in-parens': 'warn',
    'space-infix-ops': 'warn',
    'valid-jsdoc': 'off',
  },
};
