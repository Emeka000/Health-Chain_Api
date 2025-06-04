import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { 
  INHERITANCE_TYPE, 
  DISCRIMINATOR_COLUMN, 
  DISCRIMINATOR_VALUE, 
  INHERITANCE_PARENT,
  InheritanceType 
} from '../decorators/inheritance.decorator';

export interface InheritanceMetadata {
  type: InheritanceType;
  discriminatorColumn?: string;
  discriminatorValue?: string;
  parent?: Function;
}

@Injectable()
export class InheritanceMetadataService {
  constructor(private reflector: Reflector) {}

  getInheritanceMetadata(target: Function): InheritanceMetadata | null {
    const type = this.reflector.get<InheritanceType>(INHERITANCE_TYPE, target);
    if (!type) return null;

    return {
      type,
      discriminatorColumn: this.reflector.get<string>(DISCRIMINATOR_COLUMN, target),
      discriminatorValue: this.reflector.get<string>(DISCRIMINATOR_VALUE, target),
      parent: this.reflector.get<Function>(INHERITANCE_PARENT, target)
    };
  }

  isInheritanceEntity(target: Function): boolean {
    return !!this.getInheritanceMetadata(target);
  }

  getInheritanceType(target: Function): InheritanceType | null {
    return this.reflector.get<InheritanceType>(INHERITANCE_TYPE, target);
  }

  getDiscriminatorColumn(target: Function): string | null {
    return this.reflector.get<string>(DISCRIMINATOR_COLUMN, target);
  }

  getDiscriminatorValue(target: Function): string | null {
    return this.reflector.get<string>(DISCRIMINATOR_VALUE, target);
  }

  getParentEntity(target: Function): Function | null {
    return this.reflector.get<Function>(INHERITANCE_PARENT, target);
  }

  buildInheritanceHierarchy(entities: Function[]): Map<Function, Function[]> {
    const hierarchy = new Map<Function, Function[]>();
    
    entities.forEach(entity => {
      const parent = this.getParentEntity(entity);
      if (parent) {
        if (!hierarchy.has(parent)) {
          hierarchy.set(parent, []);
        }
        hierarchy.get(parent)!.push(entity);
      }
    });
    
    return hierarchy;
  }
}