import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameTables1736695161697 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_8e913e288156c133999341156ad"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" RENAME TO "refresh_tokens"`);
        await queryRunner.renameTable("user", "users");
        await queryRunner.query(
            `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_8e913e288156c133999341156ad" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_8e913e288156c133999341156ad"`,
        );

        await queryRunner.renameTable("users", "user");
        await queryRunner.renameTable("refresh_tokens", "refresh_token");
    }

}
