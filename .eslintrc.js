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
    'object-curly-spacing': ['error', 'always'],
    'semi': ['error', 'never'],
    'react/prop-types': 'off',
    'max-len': 'off',
    'camelcase': 'off',
    'valid-jsdoc': 'off',
    'require-jsdoc': 'off',
    'new-cap': 'off',
    'no-invalid-this': 'off',
    'prefer-promise-reject-errors': 'off'
  },
};
