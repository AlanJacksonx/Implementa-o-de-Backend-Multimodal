const fs = require('fs');
const path = require('path');

console.log('🔧 A corrigir o ChamadosService...');

const baseDir = fs.existsSync('./src/chamados') ? '.' : (fs.existsSync('./backend/src/chamados') ? './backend' : '.');
const chamadosFile = path.join(baseDir, 'src', 'chamados', 'chamados.service.ts');

if (fs.existsSync(chamadosFile)) {
    let content = fs.readFileSync(chamadosFile, 'utf8');
    
    // Substitui a linha que está a causar o erro
    if (content.includes('modelo: resultado.modelo }')) {
        content = content.replace(
            'modelo: resultado.modelo }', 
            "modelo: resultado.modelo ?? 'gemma3:4b' }"
        );
        fs.writeFileSync(chamadosFile, content, 'utf8');
        console.log('✅ Correção aplicada com sucesso!');
    } else if (content.includes("modelo: resultado.modelo ?? 'gemma3:4b'")) {
        console.log('⚠️ A correção já estava no ficheiro. Certifique-se de que o VS Code o guardou (Ctrl+S).');
    } else {
        console.log('❌ Não foi possível encontrar a linha exata. Verifique o ficheiro manualmente.');
    }
} else {
    console.log('❌ Ficheiro chamados.service.ts não encontrado.');
}