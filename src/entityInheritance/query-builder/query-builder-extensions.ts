import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { InheritanceQueryBuilder } from './inheritance-query-builder';
import { InheritanceType } from '../decorators/inheritance.decorator';

declare module 'typeorm' {
  interface SelectQueryBuilder<Entity> {
    withInheritance(
      type: InheritanceType,
      discriminatorColumn?: string
    ): InheritanceQueryBuilder<Entity>;
  }
}

SelectQueryBuilder.prototype.withInheritance = function<T extends ObjectLiteral>(
  this: SelectQueryBuilder<T>,
  type: InheritanceType,
  discriminatorColumn?: string
): InheritanceQueryBuilder<T> {
  return new InheritanceQueryBuilder(this, type, discriminatorColumn);
};
