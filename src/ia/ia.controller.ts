import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AnalisarArquivoDto } from './dto/analisar-arquivo.dto';
import { IaService } from './ia.service';

@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Post('analisar-arquivo')
  @UseInterceptors(
    FileInterceptor('arquivo', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    }),
  )
  analisarArquivo(
    @Body() dto: AnalisarArquivoDto,
    @UploadedFile() arquivo?: Express.Multer.File,
  ) {
    return this.iaService.analisarArquivo(dto.prompt, arquivo);
  }
}
