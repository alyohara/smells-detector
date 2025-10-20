module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  plugins: [],
  globals: {
    // Figma Plugin API globals
    figma: 'readonly',
    parent: 'readonly',
    __html__: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'script'
  },
  rules: {
    // Errores que deben corregirse
    'no-console': 'warn',
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-undef': 'error',
    'no-redeclare': 'error',
    'no-implicit-globals': 'error',
    
    // Mejores prácticas
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'brace-style': ['error', '1tbs'],
    
    // Estilo de código
    'indent': ['error', 2, {
      SwitchCase: 1,
      VariableDeclarator: 1,
      outerIIFEBody: 1
    }],
    'quotes': ['error', 'single', {
      avoidEscape: true,
      allowTemplateLiterals: true
    }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }],
    
    // Spacing
    'space-infix-ops': 'error',
    'space-unary-ops': 'error',
    'keyword-spacing': 'error',
    'comma-spacing': 'error',
    'key-spacing': 'error',
    
    // Nuevas líneas
    'eol-last': 'error',
    'no-multiple-empty-lines': ['error', {
      max: 2,
      maxEOF: 1
    }],
    
    // Complejidad
    'max-len': ['warn', {
      code: 100,
      tabWidth: 2,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true
    }],
    'max-params': ['warn', 5],
    'max-nested-callbacks': ['warn', 4],
    'complexity': ['warn', 15]
  },
  overrides: [
    {
      // Configuración específica para archivos del plugin
      files: ['code.js'],
      rules: {
        // Permitir console en el código principal del plugin
        'no-console': 'off',
        // El plugin puede necesitar acceso a globals de Figma
        'no-implicit-globals': 'off'
      }
    },
    {
      // Configuración para archivos de utilidades
      files: ['analysis-engine/**/*.js'],
      rules: {
        // Requerir JSDoc para funciones públicas
        'require-jsdoc': ['warn', {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true
          }
        }]
      }
    },
    {
      // Configuración para scripts de build
      files: ['scripts/**/*.js'],
      env: {
        node: true,
        browser: false
      },
      rules: {
        'no-console': 'off' // Los scripts pueden usar console
      }
    },
    {
      // Configuración para tests (cuando se implementen)
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
        node: true
      },
      rules: {
        'no-console': 'off',
        'max-len': 'off'
      }
    }
  ]
};