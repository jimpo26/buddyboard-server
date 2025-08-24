CREATE TABLE "gift_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"full_name" text NOT NULL,
	"street_address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"postal_code" text NOT NULL,
	"country" text NOT NULL,
	"redeemed_at" timestamp DEFAULT now() NOT NULL,
	"shipped" boolean DEFAULT false NOT NULL,
	"shipped_at" timestamp,
	"tracking_number" text
);
--> statement-breakpoint
ALTER TABLE "gift_redemptions" ADD CONSTRAINT "gift_redemptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "gift_redemptions_user_id_idx" ON "gift_redemptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "gift_redemptions_redeemed_at_idx" ON "gift_redemptions" USING btree ("redeemed_at");