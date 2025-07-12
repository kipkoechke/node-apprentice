import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReviewsSchema1744529632713 implements MigrationInterface {
    name = 'CreateReviewsSchema1744529632713'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."tour_difficulty_enum" RENAME TO "tour_difficulty_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."tour_difficulty_enum" AS ENUM('easy', 'medium', 'difficult')`);
        await queryRunner.query(`ALTER TABLE "tour" ALTER COLUMN "difficulty" TYPE "public"."tour_difficulty_enum" USING "difficulty"::"text"::"public"."tour_difficulty_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tour_difficulty_enum_old"`);
        await queryRunner.query(`ALTER TABLE "tour" ALTER COLUMN "images" SET DEFAULT '{}'`);
        await queryRunner.query(`CREATE INDEX "IDX_8ea60097c7fe7d31fb2c26b6e6" ON "tour" USING GiST ("startLocation") `);
        await queryRunner.query(`CREATE INDEX "IDX_977f1da07ba1cf4a613e1d3991" ON "tour" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_5efb6ef48481c2ae0a96b0debf" ON "tour" ("price", "ratingsAverage") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_5efb6ef48481c2ae0a96b0debf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_977f1da07ba1cf4a613e1d3991"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8ea60097c7fe7d31fb2c26b6e6"`);
        await queryRunner.query(`ALTER TABLE "tour" ALTER COLUMN "images" DROP DEFAULT`);
        await queryRunner.query(`CREATE TYPE "public"."tour_difficulty_enum_old" AS ENUM('EASY', 'MEDIUM', 'DIFFICULT')`);
        await queryRunner.query(`ALTER TABLE "tour" ALTER COLUMN "difficulty" TYPE "public"."tour_difficulty_enum_old" USING "difficulty"::"text"::"public"."tour_difficulty_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."tour_difficulty_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."tour_difficulty_enum_old" RENAME TO "tour_difficulty_enum"`);
    }

}
