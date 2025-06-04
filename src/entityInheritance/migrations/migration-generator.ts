import { MigrationInterface, QueryRunner, Table, Column, Index, ForeignKey } from 'typeorm';
import { InheritanceType } from '../decorators/inheritance.decorator';

export interface InheritanceMigrationConfig {
  parentTable: string;
  childTables: string[];
  inheritanceType: InheritanceType;
  discriminatorColumn?: string;
  parentColumns: Column[];
  childColumns: { [tableName: string]: Column[] };
}

export class InheritanceMigrationGenerator {
  static generateSingleTableMigration(config: InheritanceMigrationConfig): string {
    const { parentTable, discriminatorColumn, parentColumns, childColumns } = config;
    
    // Collect all unique columns from all child tables
    const allChildColumns = new Map<string, Column>();
    Object.values(childColumns).forEach(columns => {
      columns.forEach(col => {
        if (!allChildColumns.has(col.name)) {
          allChildColumns.set(col.name, { ...col, isNullable: true }); // Child columns are nullable in single table
        }
      });
    });

    const allColumns = [
      ...parentColumns,
      new Column({ name: discriminatorColumn!, type: 'varchar', length: 50 }),
      ...Array.from(allChildColumns.values())
    ];

    return `
import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class Create${parentTable}${Date.now()} implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: '${parentTable}',
        columns: ${JSON.stringify(allColumns, null, 10)},
        indices: [
          new Index({
            name: 'IDX_${parentTable}_${discriminatorColumn}',
            columnNames: ['${discriminatorColumn}']
          })
        ]
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('${parentTable}');
  }
}`;
  }

  static generateClassTableMigration(config: InheritanceMigrationConfig): string {
    const { parentTable, childTables, parentColumns, childColumns } = config;
    
    let upMigrations = `
    // Create parent table
    await queryRunner.createTable(
      new Table({
        name: '${parentTable}',
        columns: ${JSON.stringify(parentColumns, null, 8)}
      }),
      true
    );`;

    let downMigrations = '';

    childTables.forEach(childTable => {
      const childCols = [
        new Column({ name: 'id', type: 'uuid', isPrimary: true }),
        ...(childColumns[childTable] || [])
      ];

      upMigrations += `
    
    // Create child table: ${childTable}
    await queryRunner.createTable(
      new Table({
        name: '${childTable}',
        columns: ${JSON.stringify(childCols, null, 8)},
        foreignKeys: [
          new ForeignKey({
            columnNames: ['id'],
            referencedTableName: '${parentTable}',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          })
        ]
      }),
      true
    );`;

      downMigrations = `await queryRunner.dropTable('${childTable}');\n    ` + downMigrations;
    });

    downMigrations += `await queryRunner.dropTable('${parentTable}');`;

    return `
import { MigrationInterface, QueryRunner, Table, ForeignKey } from 'typeorm';

export class Create${parentTable}Inheritance${Date.now()} implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {${upMigrations}
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    ${downMigrations}
  }
}`;
  }

  static generateConcreteTableMigration(config: InheritanceMigrationConfig): string {
    const { childTables, parentColumns, childColumns } = config;
    
    let upMigrations = '';
    let downMigrations = '';

    childTables.forEach(childTable => {
      const allColumns = [...parentColumns, ...(childColumns[childTable] || [])];
      
      upMigrations += `
    await queryRunner.createTable(
      new Table({
        name: '${childTable}',
        columns: ${JSON.stringify(allColumns, null, 8)}
      }),
      true
    );
`;

      downMigrations = `await queryRunner.dropTable('${childTable}');\n    ` + downMigrations;
    });

    return `
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateConcreteTableInheritance${Date.now()} implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {${upMigrations}
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    ${downMigrations}
  }
}`;
  }
}

