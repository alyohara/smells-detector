const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

/**
 * Script para crear un paquete ZIP del plugin de Figma
 * Incluye solo los archivos necesarios para la distribución
 */

const PLUGIN_FILES = [
  'manifest.json',
  'code.js',
  'ui.html',
  'README.md',
  'LICENSE'
];

const PLUGIN_DIRECTORIES = [
  'analysis-engine'
];

const OUTPUT_DIR = 'dist';
const PACKAGE_NAME = 'simple-smells-detector.zip';

async function createPluginPackage() {
  console.log('🚀 Creando paquete del plugin...');
  
  // Crear directorio de salida si no existe
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Directorio ${OUTPUT_DIR} creado`);
  }
  
  // Verificar que todos los archivos requeridos existen
  console.log('🔍 Verificando archivos requeridos...');
  const missingFiles = [];
  
  for (const file of PLUGIN_FILES) {
    if (!fs.existsSync(file)) {
      missingFiles.push(file);
    }
  }
  
  for (const dir of PLUGIN_DIRECTORIES) {
    if (!fs.existsSync(dir)) {
      missingFiles.push(dir);
    }
  }
  
  if (missingFiles.length > 0) {
    console.error('❌ Archivos faltantes:');
    missingFiles.forEach(file => console.error(`   - ${file}`));
    process.exit(1);
  }
  
  console.log('✅ Todos los archivos requeridos están presentes');
  
  // Crear archivo ZIP
  const outputPath = path.join(OUTPUT_DIR, PACKAGE_NAME);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Máximo nivel de compresión
  });
  
  return new Promise((resolve, reject) => {
    output.on('close', () => {
      const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`📦 Paquete creado: ${outputPath}`);
      console.log(`📊 Tamaño: ${sizeInMB} MB (${archive.pointer()} bytes)`);
      
      // Mostrar contenido del paquete
      console.log('📋 Contenido del paquete:');
      PLUGIN_FILES.forEach(file => console.log(`   ✓ ${file}`));
      PLUGIN_DIRECTORIES.forEach(dir => console.log(`   ✓ ${dir}/`));
      
      resolve();
    });
    
    archive.on('error', (err) => {
      console.error('❌ Error creando el paquete:', err);
      reject(err);
    });
    
    archive.pipe(output);
    
    // Agregar archivos individuales
    PLUGIN_FILES.forEach(file => {
      console.log(`📄 Agregando: ${file}`);
      archive.file(file, { name: file });
    });
    
    // Agregar directorios
    PLUGIN_DIRECTORIES.forEach(dir => {
      console.log(`📁 Agregando directorio: ${dir}/`);
      archive.directory(dir, dir);
    });
    
    archive.finalize();
  });
}

async function validateManifest() {
  console.log('🔍 Validando manifest.json...');
  
  try {
    const manifestContent = fs.readFileSync('manifest.json', 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    const requiredFields = ['name', 'id', 'api', 'main', 'ui', 'editorType'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Campos faltantes en manifest.json:');
      missingFields.forEach(field => console.error(`   - ${field}`));
      return false;
    }
    
    console.log('✅ manifest.json es válido');
    console.log(`   📝 Nombre: ${manifest.name}`);
    console.log(`   🆔 ID: ${manifest.id}`);
    console.log(`   🔄 API Version: ${manifest.api}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error leyendo manifest.json:', error.message);
    return false;
  }
}

async function generateChecksums() {
  const crypto = require('crypto');
  const packagePath = path.join(OUTPUT_DIR, PACKAGE_NAME);
  
  console.log('🔐 Generando checksums...');
  
  try {
    const fileBuffer = fs.readFileSync(packagePath);
    const md5 = crypto.createHash('md5').update(fileBuffer).digest('hex');
    const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    const checksumFile = path.join(OUTPUT_DIR, 'checksums.txt');
    const checksumContent = `# Checksums para ${PACKAGE_NAME}
# Generado: ${new Date().toISOString()}

MD5: ${md5}
SHA256: ${sha256}

# Para verificar:
# md5sum ${PACKAGE_NAME}
# sha256sum ${PACKAGE_NAME}
`;
    
    fs.writeFileSync(checksumFile, checksumContent);
    console.log(`✅ Checksums guardados en: ${checksumFile}`);
    console.log(`   MD5: ${md5}`);
    console.log(`   SHA256: ${sha256}`);
    
  } catch (error) {
    console.error('❌ Error generando checksums:', error.message);
  }
}

async function main() {
  try {
    console.log('🎯 Simple Smells Detector - Empaquetador de Plugin\n');
    
    // Validar manifest
    const isManifestValid = await validateManifest();
    if (!isManifestValid) {
      process.exit(1);
    }
    
    // Crear paquete
    await createPluginPackage();
    
    // Generar checksums
    await generateChecksums();
    
    console.log('\n🎉 ¡Paquete del plugin creado exitosamente!');
    console.log(`📍 Ubicación: ${path.resolve(OUTPUT_DIR, PACKAGE_NAME)}`);
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Probar el plugin en Figma Desktop');
    console.log('   2. Enviar para revisión en Figma Community');
    console.log('   3. Crear release en GitHub');
    
  } catch (error) {
    console.error('\n❌ Error en el proceso de empaquetado:', error.message);
    process.exit(1);
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  createPluginPackage,
  validateManifest,
  generateChecksums
};