import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261006191647 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "pattern" drop constraint if exists "pattern_handle_unique";`);
    this.addSql(`create table if not exists "pattern" ("id" text not null, "handle" text not null, "name" text not null, "description" text null, "badge" text null, "tag" text null, "image_url" text null, "rank" integer not null default 0, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pattern_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pattern_handle_unique" ON "pattern" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pattern_deleted_at" ON "pattern" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pattern" cascade;`);
  }

}
