import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly imgurClientId: string;

  constructor(private configService: ConfigService) {
    // Client ID do Imgur (pode ser obtido em https://api.imgur.com/oauth2/addclient)
    // Por enquanto, vamos usar um client ID público/anônimo
    // Para produção, crie sua própria conta e use um Client ID próprio
    this.imgurClientId = this.configService.get<string>('IMGUR_CLIENT_ID') || '546c25a59c58ad7';
  }

  async uploadToImgur(file: Express.Multer.File): Promise<string> {
    try {
      // Converte o buffer para base64
      const base64Image = file.buffer.toString('base64');

      // Faz upload para Imgur
      const response = await axios.post(
        'https://api.imgur.com/3/image',
        {
          image: base64Image,
          type: 'base64',
        },
        {
          headers: {
            Authorization: `Client-ID ${this.imgurClientId}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        return response.data.data.link;
      }

      throw new Error('Falha ao fazer upload para Imgur');
    } catch (error: any) {
      console.error('Erro ao fazer upload para Imgur:', error.response?.data || error.message);
      throw new Error('Erro ao fazer upload da imagem. Tente novamente.');
    }
  }
}
