import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { InheritanceType } from '../decorators/inheritance.decorator';

export class InheritanceQueryBuilder<T extends ObjectLiteral> {
  private inheritanceType: InheritanceType;
  private discriminatorColumn?: string;

  constructor(
    private queryBuilder: SelectQueryBuilder<T>,
    inheritanceType: InheritanceType,
    discriminatorColumn?: string
  ) {
    this.inheritanceType = inheritanceType;
    this.discriminatorColumn = discriminatorColumn;
  }

  whereType(type: string): this {
    if (this.inheritanceType === InheritanceType.SINGLE_TABLE && this.discriminatorColumn) {
      this.queryBuilder.andWhere(`${this.queryBuilder.alias}.${this.discriminatorColumn} = :type`, { type });
    }
    return this;
  }

  whereTypes(types: string[]): this {
    if (this.inheritanceType === InheritanceType.SINGLE_TABLE && this.discriminatorColumn) {
      this.queryBuilder.andWhere(`${this.queryBuilder.alias}.${this.discriminatorColumn} IN (:...types)`, { types });
    }
    return this;
  }

  withInheritanceJoins(): this {
    if (this.inheritanceType === InheritanceType.CLASS_TABLE) {
      // Add automatic joins for class table inheritance
      this.queryBuilder.leftJoinAndSelect(`${this.queryBuilder.alias}.parent`, 'parent');
    }
    return this;
  }

  selectPolymorphic(): this {
    if (this.inheritanceType === InheritanceType.SINGLE_TABLE && this.discriminatorColumn) {
      this.queryBuilder.addSelect(`${this.queryBuilder.alias}.${this.discriminatorColumn}`, 'entityType');
    }
    return this;
  }

  orderByInheritanceHierarchy(): this {
    if (this.inheritanceType === InheritanceType.SINGLE_TABLE && this.discriminatorColumn) {
      this.queryBuilder.addOrderBy(`${this.queryBuilder.alias}.${this.discriminatorColumn}`, 'ASC');
    }
    return this;
  }

  getQueryBuilder(): SelectQueryBuilder<T> {
    return this.queryBuilder;
  }
}
 