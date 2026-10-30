import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfileOwnership1792860000000 implements MigrationInterface {
  name = 'AddProfileOwnership1792860000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "profile" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "displayName" character varying NOT NULL, "email" character varying NOT NULL, CONSTRAINT "PK_profile_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile" ADD COLUMN IF NOT EXISTS "userId" uuid`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_profile_userId_unique" ON "profile" ("userId")`,
    );
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_profile_userId') THEN
          ALTER TABLE "profile"
          ADD CONSTRAINT "FK_profile_userId"
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profile" DROP CONSTRAINT IF EXISTS "FK_profile_userId"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_profile_userId_unique"`);
    await queryRunner.query(
      `ALTER TABLE "profile" DROP COLUMN IF EXISTS "userId"`,
    );
  }
}
