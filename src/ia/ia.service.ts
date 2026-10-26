import { BadRequestException, Inject, Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import { MODELO_PROVIDER, type ModeloProvider } from './providers/modelo.provider';

const TIPOS_IMAGEM = new Set(['image/png', 'image/jpeg', 'image/webp']);

@Injectable()
export class IaService {
  // CORREÇÃO: Adicionado o @Inject(MODELO_PROVIDER)
  constructor(@Inject(MODELO_PROVIDER) private readonly modelo: ModeloProvider) {}

  async analisarArquivo(prompt: string, arquivo?: Express.Multer.File) {
    if (!arquivo) throw new BadRequestException('O arquivo é obrigatório');

    if (TIPOS_IMAGEM.has(arquivo.mimetype)) {
      const resultado = await this.modelo.analisarArquivo({ prompt, imagemBase64: arquivo.buffer.toString('base64') });
      return this.criarRespostaPublica(resultado, arquivo, 'imagem');
    }

    if (arquivo.mimetype === 'text/plain') {
      const textoDocumento = arquivo.buffer.toString('utf8').trim();
      if (!textoDocumento) throw new BadRequestException('O documento de texto está vazio');
      if (textoDocumento.length > 20000) throw new BadRequestException('O documento ultrapassa o limite de caracteres');

      const resultado = await this.modelo.analisarArquivo({ prompt, textoDocumento });
      return this.criarRespostaPublica(resultado, arquivo, 'texto');
    }

    throw new UnsupportedMediaTypeException('Envie PNG, JPEG, WebP ou TXT');
  }

  private criarRespostaPublica(resultado: any, arquivo: Express.Multer.File, tipoEntrada: 'imagem' | 'texto') {
    return {
      resposta: resultado.resposta,
      modelo: resultado.modelo,
      tipoEntrada,
      arquivo: { nome: arquivo.originalname, mimeType: arquivo.mimetype },
      uso: { tokensEntrada: resultado.tokensEntrada, tokensSaida: resultado.tokensSaida },
    };
  }
}