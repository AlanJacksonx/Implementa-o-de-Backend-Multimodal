const fs = require('fs');

// 1. Criar o ficheiro de teste automaticamente
const conteudo = "O utilizador informa que consegue entrar no portal, mas a página de pagamentos mostra cobrança duplicada referente ao mês de outubro.";
fs.writeFileSync('chamado.txt', conteudo);
console.log('📝 Ficheiro chamado.txt criado com sucesso!');

// 2. Fazer o Upload simulando o comportamento exato do Frontend (Multipart/form-data)
async function testarAPI() {
  console.log('⏳ A enviar o ficheiro para o backend e a aguardar a análise da IA...');
  
  const formData = new FormData();
  formData.append('prompt', 'Resuma o problema e sugira uma categoria para este chamado.');
  
  // Lê o ficheiro e prepara o upload
  const fileBuffer = fs.readFileSync('chamado.txt');
  const blob = new Blob([fileBuffer], { type: 'text/plain' });
  formData.append('arquivo', blob, 'chamado.txt');

  try {
    // Correção: Uso de 127.0.0.1 em vez de localhost para contornar o bloqueio IPv6 do Node.js
    const response = await fetch('http://127.0.0.1:3000/ia/analisar-arquivo', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('\n✅ SUCESSO! Veja a resposta da IA abaixo:\n');
    console.dir(data, { depth: null, colors: true });
    
  } catch (error) {
    console.error('\n❌ Erro na comunicação:', error.message);
  }
}

testarAPI();