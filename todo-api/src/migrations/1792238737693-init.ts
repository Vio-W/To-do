import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1792238737693 implements MigrationInterface {
    name = 'Init1792238737693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "todo" ADD "starred" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "todo" DROP COLUMN "starred"`);
    }

}
