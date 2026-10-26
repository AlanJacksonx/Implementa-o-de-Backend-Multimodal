const fs = require('fs');
const path = require('path');

const baseDir = fs.existsSync('./src/ia') ? '.' : (fs.existsSync('./backend/src/ia') ? './backend' : '.');
const providerFile = path.join(baseDir, 'src', 'ia', 'providers', 'modelo.provider.ts');

const codigoCorreto = `export const MODELO_PROVIDER = 'MODELO_PROVIDER';

export interface ModeloMensagem {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GerarRespostaInput {
  mensagem: string;
  system?: string;
}

export interface GerarRespostaOutput {
  resposta: string;
  modelo: string;
}

export interface ConversarInput {
  messages: ModeloMensagem[];
}

export interface ConversarOutput {
  resposta: string;
  modelo: string;
}

export interface AnalisarArquivoInput {
  prompt: string;
  imagemBase64?: string;
  textoDocumento?: string;
}

export interface AnalisarArquivoOutput {
  resposta: string;
  modelo: string;
  tokensEntrada?: number;
  tokensSaida?: number;
}

export abstract class ModeloProvider {
  abstract gerar(input: GerarRespostaInput): Promise<GerarRespostaOutput>;
  abstract conversar(input: ConversarInput): Promise<ConversarOutput>;
  abstract analisarArquivo(input: AnalisarArquivoInput): Promise<AnalisarArquivoOutput>;
}
`;

try {
    fs.writeFileSync(providerFile, codigoCorreto, 'utf8');
    console.log('✅ O ficheiro modelo.provider.ts foi reescrito com as exportações corretas!');
} catch (error) {
    console.error('❌ Erro ao escrever o ficheiro:', error.message);
}