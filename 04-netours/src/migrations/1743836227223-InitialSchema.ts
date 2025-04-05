import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1743836227223 implements MigrationInterface {
    name = 'InitialSchema1743836227223'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "location" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying, "address" character varying, "day" integer, "coordinates" geometry(Point,4326) NOT NULL, "tourId" uuid, CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tour_difficulty_enum" AS ENUM('EASY', 'MEDIUM', 'DIFFICULT')`);
        await queryRunner.query(`CREATE TABLE "tour" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying, "duration" integer NOT NULL, "maxGroupSize" integer NOT NULL, "difficulty" "public"."tour_difficulty_enum" NOT NULL, "ratingsAverage" double precision NOT NULL DEFAULT '4.5', "ratingsQuantity" integer NOT NULL DEFAULT '0', "price" double precision NOT NULL, "priceDiscount" double precision, "summary" character varying NOT NULL, "description" character varying, "imageCover" character varying NOT NULL, "images" text array NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "startDates" TIMESTAMP array NOT NULL, "secretTour" boolean NOT NULL DEFAULT false, "startLocation" geometry(Point,4326) NOT NULL, CONSTRAINT "UQ_948c1044932dba70d131655953d" UNIQUE ("name"), CONSTRAINT "PK_972cd7fa4ec39286068130fa3f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "review" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "review" character varying NOT NULL, "rating" double precision NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "tourId" uuid, "userId" uuid, CONSTRAINT "UQ_13e4b0acb59be82cb546a5f035e" UNIQUE ("tourId", "userId"), CONSTRAINT "PK_2e4299a343a81574217255c00ca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('USER', 'GUIDE', 'LEAD_GUIDE', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "email" character varying(255) NOT NULL, "photo" character varying NOT NULL DEFAULT 'default.jpg', "role" "public"."user_role_enum" NOT NULL DEFAULT 'USER', "password" character varying NOT NULL, "passwordChangedAt" TIMESTAMP, "passwordResetToken" character varying, "passwordResetExpires" TIMESTAMP, "active" boolean NOT NULL DEFAULT true, "isVerified" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tour_guides" ("tourId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_c58600e597873a3ec39e8c29f04" PRIMARY KEY ("tourId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_72ab83431fdd4318ebedb3de28" ON "tour_guides" ("tourId") `);
        await queryRunner.query(`CREATE INDEX "IDX_5b9107eaffa50bf47a53c5bd9c" ON "tour_guides" ("userId") `);
        await queryRunner.query(`ALTER TABLE "location" ADD CONSTRAINT "FK_6d40068605546ded8b8a71844c0" FOREIGN KEY ("tourId") REFERENCES "tour"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "FK_de57b596937c3f0ee832dc2372a" FOREIGN KEY ("tourId") REFERENCES "tour"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "FK_1337f93918c70837d3cea105d39" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tour_guides" ADD CONSTRAINT "FK_72ab83431fdd4318ebedb3de28d" FOREIGN KEY ("tourId") REFERENCES "tour"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tour_guides" ADD CONSTRAINT "FK_5b9107eaffa50bf47a53c5bd9c9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tour_guides" DROP CONSTRAINT "FK_5b9107eaffa50bf47a53c5bd9c9"`);
        await queryRunner.query(`ALTER TABLE "tour_guides" DROP CONSTRAINT "FK_72ab83431fdd4318ebedb3de28d"`);
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_1337f93918c70837d3cea105d39"`);
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_de57b596937c3f0ee832dc2372a"`);
        await queryRunner.query(`ALTER TABLE "location" DROP CONSTRAINT "FK_6d40068605546ded8b8a71844c0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5b9107eaffa50bf47a53c5bd9c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_72ab83431fdd4318ebedb3de28"`);
        await queryRunner.query(`DROP TABLE "tour_guides"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "review"`);
        await queryRunner.query(`DROP TABLE "tour"`);
        await queryRunner.query(`DROP TYPE "public"."tour_difficulty_enum"`);
        await queryRunner.query(`DROP TABLE "location"`);
    }

}
