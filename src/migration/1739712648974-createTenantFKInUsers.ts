import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTenantFKInUsers1739712648974 implements MigrationInterface {
    name = 'CreateTenantFKInUsers1739712648974'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "tenantId" integer`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "refresh_tokens_id_seq" OWNED BY "refresh_tokens"."id"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "id" SET DEFAULT nextval('"refresh_tokens_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_c58f7e88c286e5e3478960a998b" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_c58f7e88c286e5e3478960a998b"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "refresh_tokens_id_seq"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tenantId"`);
    }

}
