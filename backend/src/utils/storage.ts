import AWS from 'aws-sdk';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import logger from './logger';

interface UploadOptions {
  folder?: string;
  filename?: string;
}

interface UploadResult {
  key: string;
  url: string;
}

class StorageService {
  private s3: AWS.S3 | null = null;
  private useLocal: boolean;
  private uploadDir: string;
  private s3Bucket: string;

  constructor() {
    this.useLocal = process.env.STORAGE_TYPE === 'local' || !process.env.AWS_ACCESS_KEY_ID;
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.s3Bucket = process.env.AWS_S3_BUCKET || 'remitos-storage';

    if (!this.useLocal) {
      const s3Config: AWS.S3.ClientConfiguration = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
      };

      if (process.env.AWS_S3_ENDPOINT) {
        Object.assign(s3Config, { endpoint: process.env.AWS_S3_ENDPOINT });
      }

      this.s3 = new AWS.S3(s3Config);
    }
  }

  async uploadFile(buffer: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    const { folder = 'misc', filename } = options;
    const fileKey = filename || `${folder}/${uuidv4()}`;

    if (this.useLocal) {
      return this.uploadLocal(buffer, fileKey);
    } else {
      return this.uploadS3(buffer, fileKey);
    }
  }

  private async uploadLocal(buffer: Buffer, key: string): Promise<UploadResult> {
    try {
      const filePath = path.join(this.uploadDir, key);
      const dir = path.dirname(filePath);

      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, buffer);

      logger.info(`Archivo guardado localmente: ${key}`);

      return {
        key,
        url: `/uploads/${key}`,
      };
    } catch (error: any) {
      logger.error('Error al subir archivo localmente:', { error: error.message, key });
      throw new Error('Error al guardar archivo');
    }
  }

  private async uploadS3(buffer: Buffer, key: string): Promise<UploadResult> {
    try {
      if (!this.s3) {
        throw new Error('S3 client no configurado');
      }

      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.s3Bucket,
        Key: key,
        Body: buffer,
      };

      await this.s3.upload(params).promise();
      logger.info(`Archivo subido a S3: ${key}`);

      // Generar URL firmada
      const getParams: AWS.S3.GetObjectRequest = {
        Bucket: this.s3Bucket,
        Key: key,
      };

      const url = this.s3.getSignedUrl('getObject', {
        ...getParams,
        Expires: 86400 * 7, // 7 días en segundos
      });

      return { key, url };
    } catch (error: any) {
      logger.error('Error al subir a S3:', { error: error.message, key });
      throw new Error('Error al subir archivo a S3');
    }
  }

  async deleteFile(key: string): Promise<void> {
    if (this.useLocal) {
      try {
        const filePath = path.join(this.uploadDir, key);
        await fs.unlink(filePath);
        logger.info(`Archivo eliminado: ${key}`);
      } catch (error: any) {
        logger.error('Error al eliminar archivo local:', { error: error.message, key });
      }
    } else {
      try {
        if (!this.s3) {
          throw new Error('S3 client no configurado');
        }
        const params: AWS.S3.DeleteObjectRequest = {
          Bucket: this.s3Bucket,
          Key: key,
        };
        await this.s3.deleteObject(params).promise();
        logger.info(`Archivo eliminado de S3: ${key}`);
      } catch (error: any) {
        logger.error('Error al eliminar de S3:', { error: error.message, key });
      }
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 86400): Promise<string> {
    if (this.useLocal) {
      return `/uploads/${key}`;
    }

    try {
      if (!this.s3) {
        throw new Error('S3 client no configurado');
      }

      return this.s3.getSignedUrl('getObject', {
        Bucket: this.s3Bucket,
        Key: key,
        Expires: expiresIn,
      });
    } catch (error: any) {
      logger.error('Error al generar URL firmada:', { error: error.message, key });
      throw new Error('Error al generar URL de acceso');
    }
  }
}

export default new StorageService();
