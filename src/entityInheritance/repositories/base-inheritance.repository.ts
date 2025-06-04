import { Repository, SelectQueryBuilder, EntityTarget, ObjectLiteral, FindOptionsWhere } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InheritanceType } from '../decorators/inheritance.decorator';

@Injectable()
export abstract class BaseInheritanceRepository<T extends ObjectLiteral> {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly inheritanceType: InheritanceType
  ) {}

  async findByType<K extends T>(
    type: string,
    options?: FindOptionsWhere<K>
  ): Promise<K[]> {
    const queryBuilder = this.repository.createQueryBuilder('entity');
    
    if (this.inheritanceType === InheritanceType.SINGLE_TABLE) {
      queryBuilder.where('entity.type = :type', { type });
    }
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
      });
    }
    
    return queryBuilder.getMany() as Promise<K[]>;
  }

  async findWithInheritance(id: string): Promise<T | null> {
    const queryBuilder = this.repository.createQueryBuilder('entity');
    
    if (this.inheritanceType === InheritanceType.CLASS_TABLE) {
      // Add joins for class table inheritance
      queryBuilder.leftJoinAndSelect('entity.parent', 'parent');
    }
    
    queryBuilder.where('entity.id = :id', { id });
    return queryBuilder.getOne();
  }

  createInheritanceAwareQueryBuilder(alias: string): SelectQueryBuilder<T> {
    const queryBuilder = this.repository.createQueryBuilder(alias);
    
    if (this.inheritanceType === InheritanceType.CLASS_TABLE) {
      // Add automatic joins for class table inheritance
      queryBuilder.leftJoinAndSelect(`${alias}.parent`, 'parent');
    }
    
    return queryBuilder;
  }

  async countByType(type: string): Promise<number> {
    const queryBuilder = this.repository.createQueryBuilder('entity');
    
    if (this.inheritanceType === InheritanceType.SINGLE_TABLE) {
      queryBuilder.where('entity.type = :type', { type });
    }
    
    return queryBuilder.getCount();
  }

  async findPolymorphic<K extends T>(
    types: string[],
    options?: FindOptionsWhere<K>
  ): Promise<K[]> {
    const queryBuilder = this.repository.createQueryBuilder('entity');
    
    if (this.inheritanceType === InheritanceType.SINGLE_TABLE) {
      queryBuilder.where('entity.type IN (:...types)', { types });
    }
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
      });
    }
    
    return queryBuilder.getMany() as Promise<K[]>;
  }
}

