import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { EducationContent } from '../entities/education-content.entity';

@Injectable()
export class EducationService {
  constructor(
    @InjectRepository(EducationContent)
    private educationRepository: Repository<EducationContent>,
  ) {}

  async getAllContent() {
    return this.educationRepository.find({
      where: { isPublished: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getContentByCategory(category: string) {
    return this.educationRepository.find({
      where: { category, isPublished: true },
      order: { createdAt: 'DESC' },
    });
  }

  async searchContent(query: string) {
    return this.educationRepository.find({
      where: [
        { title: Like(`%${query}%`), isPublished: true },
        { content: Like(`%${query}%`), isPublished: true },
      ],
      order: { readCount: 'DESC' },
    });
  }

  async getContent(id: number) {
    const content = await this.educationRepository.findOne({ where: { id } });
    if (content) {
      await this.educationRepository.increment({ id }, 'readCount', 1);
    }
    return content;
  }

  async getPopularContent() {
    return this.educationRepository.find({
      where: { isPublished: true },
      order: { readCount: 'DESC' },
      take: 10,
    });
  }
}
