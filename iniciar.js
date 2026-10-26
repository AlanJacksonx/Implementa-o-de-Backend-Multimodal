const { execSync } = require('child_process');

console.log('🚀 A iniciar o ambiente Multimodal (NestJS + Ollama)...');

try {
    // 1. Iniciar os contentores (o --build garante que usa sempre o código mais recente)
    console.log('\n📦 1. A compilar e a subir os contentores Docker em background...');
    execSync('docker compose up -d --build', { stdio: 'inherit' });

    // 2. Mostrar o estado dos contentores
    console.log('\n✅ 2. Contentores iniciados! Estado atual:');
    execSync('docker compose ps', { stdio: 'inherit' });

    // 3. Garantir que o modelo visual está pronto a ser usado
    console.log('\n🧠 3. A verificar o modelo gemma3:4b no Ollama...');
    execSync('docker compose exec ollama ollama pull gemma3:4b', { stdio: 'inherit' });

    console.log('\n🌟 TUDO PRONTO! O sistema está a correr na porta 3000.');
    console.log('Pode testar a sua API no Thunder Client (http://127.0.0.1:3000/ia/analisar-arquivo).\n');
    console.log('👉 DICA: Para ver os logs do servidor em tempo real (erros ou console.log), execute no terminal:');
    console.log('   docker compose logs -f backend\n');

} catch (error) {
    console.error('\n❌ Erro ao iniciar as aplicações:', error.message);
}