import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PathologyImage, ImageType, ImageFormat, StainType } from '../entities/pathology-image.entity';
import { CreateImageDto, UpdateImageDto, ImageFilterDto } from '../dto/pathology-image.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class DigitalPathologyService {
  private readonly baseStoragePath = process.env.PATHOLOGY_STORAGE_PATH || './uploads/pathology';

  constructor(
    @InjectRepository(PathologyImage)
    private imageRepository: Repository<PathologyImage>,
  ) {}

  async uploadImage(file: Express.Multer.File, createDto: CreateImageDto): Promise<PathologyImage> {
    const filename = this.generateFilename(file.originalname);
    const filePath = path.join(this.baseStoragePath, filename);
    
    await this.ensureDirectoryExists(path.dirname(filePath));
    await fs.writeFile(filePath, file.buffer);

    const metadata = await this.extractImageMetadata(filePath);
    const thumbnailPath = await this.generateThumbnail(filePath, filename);

    const image = this.imageRepository.create({
      ...createDto,
      filename,
      originalFilename: file.originalname,
      filePath,
      fileSize: file.size,
      format: this.getImageFormat(file.mimetype),
      metadata,
      thumbnailPath,
    });

    return await this.imageRepository.save(image);
  }

  async findAll(filters?: ImageFilterDto): Promise<PathologyImage[]> {
    const query = this.imageRepository.createQueryBuilder('image')
      .leftJoinAndSelect('image.pathologyCase', 'pathologyCase')
      .leftJoinAndSelect('image.capturedBy', 'capturedBy');

    if (filters) {
      if (filters.pathologyCaseId) {
        query.andWhere('image.pathologyCaseId = :pathologyCaseId', { pathologyCaseId: filters.pathologyCaseId });
      }
      if (filters.imageType) {
        query.andWhere('image.imageType = :imageType', { imageType: filters.imageType });
      }
      if (filters.stainType) {
        query.andWhere('image.stainType = :stainType', { stainType: filters.stainType });
      }
      if (filters.isKeyImage !== undefined) {
        query.andWhere('image.isKeyImage = :isKeyImage', { isKeyImage: filters.isKeyImage });
      }
      if (filters.magnificationMin && filters.magnificationMax) {
        query.andWhere('image.magnification BETWEEN :min AND :max', {
          min: filters.magnificationMin,
          max: filters.magnificationMax
        });
      }
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<PathologyImage> {
    const image = await this.imageRepository.findOne({
      where: { id },
      relations: ['pathologyCase', 'capturedBy'],
    });

    if (!image) {
      throw new NotFoundException(`Pathology image with ID ${id} not found`);
    }

    return image;
  }

  async update(id: string, updateDto: UpdateImageDto): Promise<PathologyImage> {
    const image = await this.findOne(id);
    Object.assign(image, updateDto);
    return await this.imageRepository.save(image);
  }

  async delete(id: string): Promise<void> {
    const image = await this.findOne(id);
    
    try {
      await fs.unlink(image.filePath);
      if (image.thumbnailPath) {
        await fs.unlink(image.thumbnailPath);
      }
    } catch (error) {
      console.warn(`Failed to delete file: ${error.message}`);
    }

    await this.imageRepository.remove(image);
  }

  async addAnnotation(imageId: string, annotation: any): Promise<PathologyImage> {
    const image = await this.findOne(imageId);
    
    if (!image.annotations) {
      image.annotations = [];
    }

    const newAnnotation = {
      id: this.generateAnnotationId(),
      ...annotation,
      createdAt: new Date(),
    };

    image.annotations.push(newAnnotation);
    return await this.imageRepository.save(image);
  }

  async updateAnnotation(imageId: string, annotationId: string, updateData: any): Promise<PathologyImage> {
    const image = await this.findOne(imageId);
    
    if (!image.annotations) {
      throw new NotFoundException(`Annotation with ID ${annotationId} not found`);
    }

    const annotationIndex = image.annotations.findIndex(ann => ann.id === annotationId);
    if (annotationIndex === -1) {
      throw new NotFoundException(`Annotation with ID ${annotationId} not found`);
    }

    Object.assign(image.annotations[annotationIndex], updateData);
    return await this.imageRepository.save(image);
  }

  async deleteAnnotation(imageId: string, annotationId: string): Promise<PathologyImage> {
    const image = await this.findOne(imageId);
    
    if (!image.annotations) {
      throw new NotFoundException(`Annotation with ID ${annotationId} not found`);
    }

    image.annotations = image.annotations.filter(ann => ann.id !== annotationId);
    return await this.imageRepository.save(image);
  }

  async getImagesByCase(caseId: string): Promise<PathologyImage[]> {
    return await this.imageRepository.find({
      where: { pathologyCase: { id: caseId } },
      relations: ['capturedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  async getKeyImages(caseId: string): Promise<PathologyImage[]> {
    return await this.imageRepository.find({
      where: { 
        pathologyCase: { id: caseId },
        isKeyImage: true 
      },
      relations: ['capturedBy']
    });
  }

  async setKeyImage(imageId: string, isKey: boolean): Promise<PathologyImage> {
    const image = await this.findOne(imageId);
    image.isKeyImage = isKey;
    return await this.imageRepository.save(image);
  }

  async analyzeImageQuality(imageId: string): Promise<any> {
    const image = await this.findOne(imageId);
    
    try {
      const imageData = sharp(image.filePath);
      const metadata = await imageData.metadata();
      const stats = await imageData.stats();

      const qualityMetrics = {
        focusScore: this.calculateFocusScore(stats),
        brightnessLevel: this.calculateBrightness(stats),
        contrastLevel: this.calculateContrast(stats),
        colorBalance: this.assessColorBalance(stats),
        artifactPresence: this.detectArtifacts(stats)
      };

      image.qualityMetrics = qualityMetrics;
      await this.imageRepository.save(image);

      return qualityMetrics;
    } catch (error) {
      throw new BadRequestException(`Failed to analyze image quality: ${error.message}`);
    }
  }

  async getImageStatistics(): Promise<any> {
    const totalImages = await this.imageRepository.count();
    const keyImages = await this.imageRepository.count({ where: { isKeyImage: true } });
    const archivedImages = await this.imageRepository.count({ where: { isArchived: true } });

    const imagesByType = await this.imageRepository
      .createQueryBuilder('image')
      .select('image.imageType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('image.imageType')
      .getRawMany();

    const imagesByStain = await this.imageRepository
      .createQueryBuilder('image')
      .select('image.stainType', 'stain')
      .addSelect('COUNT(*)', 'count')
      .where('image.stainType IS NOT NULL')
      .groupBy('image.stainType')
      .getRawMany();

    const storageUsage = await this.imageRepository
      .createQueryBuilder('image')
      .select('SUM(image.fileSize)', 'totalSize')
      .getRawOne();

    return {
      totalImages,
      keyImages,
      archivedImages,
      imagesByType,
      imagesByStain,
      storageUsage: parseInt(storageUsage.totalSize) || 0
    };
  }

  private generateFilename(originalName: string): string {
    const timestamp = new Date().getTime();
    const extension = path.extname(originalName);
    return `PATH_${timestamp}_${Math.random().toString(36).substr(2, 9)}${extension}`;
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  private async extractImageMetadata(filePath: string): Promise<any> {
    try {
      const metadata = await sharp(filePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        resolution: `${metadata.width}x${metadata.height}`,
        colorDepth: metadata.channels * 8,
        compressionType: metadata.compression || 'unknown',
        acquisitionDate: new Date(),
        scannerModel: 'Unknown',
        objective: 'Unknown'
      };
    } catch (error) {
      return null;
    }
  }

  private async generateThumbnail(filePath: string, filename: string): Promise<string> {
    try {
      const thumbnailFilename = `thumb_${filename}`;
      const thumbnailPath = path.join(this.baseStoragePath, 'thumbnails', thumbnailFilename);
      
      await this.ensureDirectoryExists(path.dirname(thumbnailPath));
      
      await sharp(filePath)
        .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      return thumbnailPath;
    } catch (error) {
      return null;
    }
  }

  private getImageFormat(mimeType: string): ImageFormat {
    switch (mimeType) {
      case 'image/jpeg': return ImageFormat.JPEG;
      case 'image/png': return ImageFormat.PNG;
      case 'image/tiff': return ImageFormat.TIFF;
      default: return ImageFormat.JPEG;
    }
  }

  private generateAnnotationId(): string {
    return `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateFocusScore(stats: any): number {
    return Math.random() * 100;
  }

  private calculateBrightness(stats: any): number {
    return Math.random() * 100;
  }

  private calculateContrast(stats: any): number {
    return Math.random() * 100;
  }

  private assessColorBalance(stats: any): string {
    const balance = ['Good', 'Fair', 'Poor'];
    return balance[Math.floor(Math.random() * balance.length)];
  }

  private detectArtifacts(stats: any): boolean {
    return Math.random() > 0.8;
  }
}