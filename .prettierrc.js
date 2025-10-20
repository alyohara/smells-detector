module.exports = {
  // Configuración básica
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,
  printWidth: 80,
  
  // Configuración específica para diferentes tipos de archivo
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
        tabWidth: 2
      }
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
        tabWidth: 2
      }
    },
    {
      files: '*.html',
      options: {
        printWidth: 120,
        htmlWhitespaceSensitivity: 'css'
      }
    },
    {
      files: '*.js',
      options: {
        arrowParens: 'avoid',
        bracketSpacing: true,
        bracketSameLine: false,
        quoteProps: 'as-needed'
      }
    }
  ]
};