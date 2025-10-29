CREATE TABLE "allowed_members_private_group" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"private_group_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "groups" ALTER COLUMN "public_link" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "icon" text;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "color" char(7);--> statement-breakpoint
ALTER TABLE "allowed_members_private_group" ADD CONSTRAINT "allowed_members_private_group_private_group_id_groups_id_fk" FOREIGN KEY ("private_group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allowed_members_private_group" ADD CONSTRAINT "allowed_members_private_group_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "allowed_members_private_group_group_user_idx" ON "allowed_members_private_group" USING btree ("private_group_id","user_id");--> statement-breakpoint
CREATE INDEX "allowed_members_private_group_group_id_idx" ON "allowed_members_private_group" USING btree ("private_group_id");--> statement-breakpoint
CREATE INDEX "allowed_members_private_group_user_id_idx" ON "allowed_members_private_group" USING btree ("user_id");