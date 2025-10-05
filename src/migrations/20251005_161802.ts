import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_reader_profile_favorite_genres\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` text NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_reader_profile_favorite_genres_order_idx\` ON \`users_reader_profile_favorite_genres\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`users_reader_profile_favorite_genres_parent_idx\` ON \`users_reader_profile_favorite_genres\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`comics_credits\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`role\` text NOT NULL,
  	\`custom_role\` text,
  	\`name\` text NOT NULL,
  	\`url\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`comics\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`comics_credits_order_idx\` ON \`comics_credits\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`comics_credits_parent_id_idx\` ON \`comics_credits\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`comics_genres\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` text NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`comics\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`comics_genres_order_idx\` ON \`comics_genres\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`comics_genres_parent_idx\` ON \`comics_genres\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`comics\` (
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`description\` text,
  	\`author_id\` text NOT NULL,
  	\`cover_image_id\` text,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`publish_schedule\` text DEFAULT 'irregular' NOT NULL,
  	\`is_n_s_f_w\` integer DEFAULT false,
  	\`seo_meta_meta_title\` text,
  	\`seo_meta_meta_description\` text,
  	\`seo_meta_social_image_id\` text,
  	\`stats_total_pages\` numeric DEFAULT 0,
  	\`stats_total_chapters\` numeric DEFAULT 0,
  	\`stats_last_page_published\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_meta_social_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`comics_slug_idx\` ON \`comics\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`comics_author_idx\` ON \`comics\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`comics_cover_image_idx\` ON \`comics\` (\`cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`comics_seo_meta_seo_meta_social_image_idx\` ON \`comics\` (\`seo_meta_social_image_id\`);`)
  await db.run(sql`CREATE INDEX \`comics_updated_at_idx\` ON \`comics\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`comics_created_at_idx\` ON \`comics\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`comics_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` text NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`comics\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`comics_texts_order_parent_idx\` ON \`comics_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`chapters\` (
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`comic_id\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`order\` numeric,
  	\`description\` text,
  	\`seo_meta_slug\` text,
  	\`seo_meta_meta_title\` text,
  	\`seo_meta_meta_description\` text,
  	\`stats_page_count\` numeric DEFAULT 0,
  	\`stats_first_page_number\` numeric,
  	\`stats_last_page_number\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`comic_id\`) REFERENCES \`comics\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`chapters_comic_idx\` ON \`chapters\` (\`comic_id\`);`)
  await db.run(sql`CREATE INDEX \`chapters_updated_at_idx\` ON \`chapters\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`chapters_created_at_idx\` ON \`chapters\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`pages_page_extra_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` text NOT NULL,
  	\`alt_text\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_page_extra_images_order_idx\` ON \`pages_page_extra_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_page_extra_images_parent_id_idx\` ON \`pages_page_extra_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_page_extra_images_image_idx\` ON \`pages_page_extra_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages\` (
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`comic_id\` text NOT NULL,
  	\`chapter_id\` text,
  	\`chapter_page_number\` numeric NOT NULL,
  	\`global_page_number\` numeric,
  	\`title\` text,
  	\`display_title\` text,
  	\`page_image_id\` text,
  	\`thumbnail_image_id\` text,
  	\`alt_text\` text,
  	\`author_notes\` text,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`published_date\` text,
  	\`navigation_previous_page_id\` text,
  	\`navigation_next_page_id\` text,
  	\`navigation_is_first_page\` integer DEFAULT false,
  	\`navigation_is_last_page\` integer DEFAULT false,
  	\`seo_meta_slug\` text,
  	\`seo_meta_meta_title\` text,
  	\`seo_meta_meta_description\` text,
  	\`stats_view_count\` numeric DEFAULT 0,
  	\`stats_first_viewed\` text,
  	\`stats_last_viewed\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`comic_id\`) REFERENCES \`comics\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`chapter_id\`) REFERENCES \`chapters\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`page_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`thumbnail_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`navigation_previous_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`navigation_next_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_comic_idx\` ON \`pages\` (\`comic_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_chapter_idx\` ON \`pages\` (\`chapter_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_page_image_idx\` ON \`pages\` (\`page_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_thumbnail_image_idx\` ON \`pages\` (\`thumbnail_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_navigation_navigation_previous_page_idx\` ON \`pages\` (\`navigation_previous_page_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_navigation_navigation_next_page_idx\` ON \`pages\` (\`navigation_next_page_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`media_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` text NOT NULL,
  	\`path\` text NOT NULL,
  	\`comics_id\` text,
  	\`pages_id\` text,
  	\`chapters_id\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`comics_id\`) REFERENCES \`comics\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`chapters_id\`) REFERENCES \`chapters\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`media_rels_order_idx\` ON \`media_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_parent_idx\` ON \`media_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_path_idx\` ON \`media_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_comics_id_idx\` ON \`media_rels\` (\`comics_id\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_pages_id_idx\` ON \`media_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_chapters_id_idx\` ON \`media_rels\` (\`chapters_id\`);`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_users_sessions\`("_order", "_parent_id", "id", "created_at", "expires_at") SELECT "_order", "_parent_id", "id", "created_at", "expires_at" FROM \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`ALTER TABLE \`__new_users_sessions\` RENAME TO \`users_sessions\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_users\` (
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`display_name\` text,
  	\`role\` text DEFAULT 'reader' NOT NULL,
  	\`status\` text DEFAULT 'active' NOT NULL,
  	\`creator_profile_bio\` text,
  	\`creator_profile_avatar_id\` text,
  	\`creator_profile_website\` text,
  	\`creator_profile_social_links_bluesky\` text,
  	\`creator_profile_social_links_instagram\` text,
  	\`creator_profile_social_links_tumblr\` text,
  	\`creator_profile_social_links_discord\` text,
  	\`creator_profile_social_links_patreon\` text,
  	\`creator_profile_social_links_kofi\` text,
  	\`creator_profile_preferences_email_notifications_new_comments\` integer DEFAULT true,
  	\`creator_profile_preferences_email_notifications_weekly_stats\` integer DEFAULT true,
  	\`creator_profile_preferences_email_notifications_system_updates\` integer DEFAULT true,
  	\`creator_profile_preferences_privacy_settings_show_email\` integer DEFAULT false,
  	\`creator_profile_preferences_privacy_settings_show_stats_public\` integer DEFAULT false,
  	\`reader_profile_reading_preferences_hide_n_s_f_w\` integer DEFAULT true,
  	\`reader_profile_reading_preferences_auto_subscribe\` integer DEFAULT false,
  	\`account_meta_joined_date\` text,
  	\`account_meta_last_active\` text,
  	\`account_meta_total_comics\` numeric DEFAULT 0,
  	\`account_meta_total_pages\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text,
  	FOREIGN KEY (\`creator_profile_avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_users\`("id", "display_name", "role", "status", "creator_profile_bio", "creator_profile_avatar_id", "creator_profile_website", "creator_profile_social_links_bluesky", "creator_profile_social_links_instagram", "creator_profile_social_links_tumblr", "creator_profile_social_links_discord", "creator_profile_social_links_patreon", "creator_profile_social_links_kofi", "creator_profile_preferences_email_notifications_new_comments", "creator_profile_preferences_email_notifications_weekly_stats", "creator_profile_preferences_email_notifications_system_updates", "creator_profile_preferences_privacy_settings_show_email", "creator_profile_preferences_privacy_settings_show_stats_public", "reader_profile_reading_preferences_hide_n_s_f_w", "reader_profile_reading_preferences_auto_subscribe", "account_meta_joined_date", "account_meta_last_active", "account_meta_total_comics", "account_meta_total_pages", "updated_at", "created_at", "email", "reset_password_token", "reset_password_expiration", "salt", "hash", "login_attempts", "lock_until") SELECT "id", "display_name", "role", "status", "creator_profile_bio", "creator_profile_avatar_id", "creator_profile_website", "creator_profile_social_links_bluesky", "creator_profile_social_links_instagram", "creator_profile_social_links_tumblr", "creator_profile_social_links_discord", "creator_profile_social_links_patreon", "creator_profile_social_links_kofi", "creator_profile_preferences_email_notifications_new_comments", "creator_profile_preferences_email_notifications_weekly_stats", "creator_profile_preferences_email_notifications_system_updates", "creator_profile_preferences_privacy_settings_show_email", "creator_profile_preferences_privacy_settings_show_stats_public", "reader_profile_reading_preferences_hide_n_s_f_w", "reader_profile_reading_preferences_auto_subscribe", "account_meta_joined_date", "account_meta_last_active", "account_meta_total_comics", "account_meta_total_pages", "updated_at", "created_at", "email", "reset_password_token", "reset_password_expiration", "salt", "hash", "login_attempts", "lock_until" FROM \`users\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`ALTER TABLE \`__new_users\` RENAME TO \`users\`;`)
  await db.run(sql`CREATE INDEX \`users_creator_profile_creator_profile_avatar_idx\` ON \`users\` (\`creator_profile_avatar_id\`);`)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`__new_media\` (
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`alt\` text,
  	\`caption\` text,
  	\`media_type\` text DEFAULT 'general' NOT NULL,
  	\`uploaded_by_id\` text NOT NULL,
  	\`is_public\` integer DEFAULT true,
  	\`comic_meta_related_comic_id\` text,
  	\`comic_meta_page_number\` numeric,
  	\`comic_meta_chapter_number\` numeric,
  	\`comic_meta_is_n_s_f_w\` integer DEFAULT false,
  	\`technical_meta_original_dimensions_width\` numeric,
  	\`technical_meta_original_dimensions_height\` numeric,
  	\`technical_meta_file_size\` numeric,
  	\`technical_meta_color_profile\` text,
  	\`usage_view_count\` numeric DEFAULT 0,
  	\`usage_download_count\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumbnail_url\` text,
  	\`sizes_thumbnail_width\` numeric,
  	\`sizes_thumbnail_height\` numeric,
  	\`sizes_thumbnail_mime_type\` text,
  	\`sizes_thumbnail_filesize\` numeric,
  	\`sizes_thumbnail_filename\` text,
  	\`sizes_thumbnail_small_url\` text,
  	\`sizes_thumbnail_small_width\` numeric,
  	\`sizes_thumbnail_small_height\` numeric,
  	\`sizes_thumbnail_small_mime_type\` text,
  	\`sizes_thumbnail_small_filesize\` numeric,
  	\`sizes_thumbnail_small_filename\` text,
  	\`sizes_webcomic_page_url\` text,
  	\`sizes_webcomic_page_width\` numeric,
  	\`sizes_webcomic_page_height\` numeric,
  	\`sizes_webcomic_page_mime_type\` text,
  	\`sizes_webcomic_page_filesize\` numeric,
  	\`sizes_webcomic_page_filename\` text,
  	\`sizes_webcomic_mobile_url\` text,
  	\`sizes_webcomic_mobile_width\` numeric,
  	\`sizes_webcomic_mobile_height\` numeric,
  	\`sizes_webcomic_mobile_mime_type\` text,
  	\`sizes_webcomic_mobile_filesize\` numeric,
  	\`sizes_webcomic_mobile_filename\` text,
  	\`sizes_cover_image_url\` text,
  	\`sizes_cover_image_width\` numeric,
  	\`sizes_cover_image_height\` numeric,
  	\`sizes_cover_image_mime_type\` text,
  	\`sizes_cover_image_filesize\` numeric,
  	\`sizes_cover_image_filename\` text,
  	\`sizes_social_preview_url\` text,
  	\`sizes_social_preview_width\` numeric,
  	\`sizes_social_preview_height\` numeric,
  	\`sizes_social_preview_mime_type\` text,
  	\`sizes_social_preview_filesize\` numeric,
  	\`sizes_social_preview_filename\` text,
  	\`sizes_avatar_url\` text,
  	\`sizes_avatar_width\` numeric,
  	\`sizes_avatar_height\` numeric,
  	\`sizes_avatar_mime_type\` text,
  	\`sizes_avatar_filesize\` numeric,
  	\`sizes_avatar_filename\` text,
  	FOREIGN KEY (\`uploaded_by_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`comic_meta_related_comic_id\`) REFERENCES \`comics\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_media\`("id", "alt", "caption", "media_type", "uploaded_by_id", "is_public", "comic_meta_related_comic_id", "comic_meta_page_number", "comic_meta_chapter_number", "comic_meta_is_n_s_f_w", "technical_meta_original_dimensions_width", "technical_meta_original_dimensions_height", "technical_meta_file_size", "technical_meta_color_profile", "usage_view_count", "usage_download_count", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height", "focal_x", "focal_y", "sizes_thumbnail_url", "sizes_thumbnail_width", "sizes_thumbnail_height", "sizes_thumbnail_mime_type", "sizes_thumbnail_filesize", "sizes_thumbnail_filename", "sizes_thumbnail_small_url", "sizes_thumbnail_small_width", "sizes_thumbnail_small_height", "sizes_thumbnail_small_mime_type", "sizes_thumbnail_small_filesize", "sizes_thumbnail_small_filename", "sizes_webcomic_page_url", "sizes_webcomic_page_width", "sizes_webcomic_page_height", "sizes_webcomic_page_mime_type", "sizes_webcomic_page_filesize", "sizes_webcomic_page_filename", "sizes_webcomic_mobile_url", "sizes_webcomic_mobile_width", "sizes_webcomic_mobile_height", "sizes_webcomic_mobile_mime_type", "sizes_webcomic_mobile_filesize", "sizes_webcomic_mobile_filename", "sizes_cover_image_url", "sizes_cover_image_width", "sizes_cover_image_height", "sizes_cover_image_mime_type", "sizes_cover_image_filesize", "sizes_cover_image_filename", "sizes_social_preview_url", "sizes_social_preview_width", "sizes_social_preview_height", "sizes_social_preview_mime_type", "sizes_social_preview_filesize", "sizes_social_preview_filename", "sizes_avatar_url", "sizes_avatar_width", "sizes_avatar_height", "sizes_avatar_mime_type", "sizes_avatar_filesize", "sizes_avatar_filename") SELECT "id", "alt", "caption", "media_type", "uploaded_by_id", "is_public", "comic_meta_related_comic_id", "comic_meta_page_number", "comic_meta_chapter_number", "comic_meta_is_n_s_f_w", "technical_meta_original_dimensions_width", "technical_meta_original_dimensions_height", "technical_meta_file_size", "technical_meta_color_profile", "usage_view_count", "usage_download_count", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height", "focal_x", "focal_y", "sizes_thumbnail_url", "sizes_thumbnail_width", "sizes_thumbnail_height", "sizes_thumbnail_mime_type", "sizes_thumbnail_filesize", "sizes_thumbnail_filename", "sizes_thumbnail_small_url", "sizes_thumbnail_small_width", "sizes_thumbnail_small_height", "sizes_thumbnail_small_mime_type", "sizes_thumbnail_small_filesize", "sizes_thumbnail_small_filename", "sizes_webcomic_page_url", "sizes_webcomic_page_width", "sizes_webcomic_page_height", "sizes_webcomic_page_mime_type", "sizes_webcomic_page_filesize", "sizes_webcomic_page_filename", "sizes_webcomic_mobile_url", "sizes_webcomic_mobile_width", "sizes_webcomic_mobile_height", "sizes_webcomic_mobile_mime_type", "sizes_webcomic_mobile_filesize", "sizes_webcomic_mobile_filename", "sizes_cover_image_url", "sizes_cover_image_width", "sizes_cover_image_height", "sizes_cover_image_mime_type", "sizes_cover_image_filesize", "sizes_cover_image_filename", "sizes_social_preview_url", "sizes_social_preview_width", "sizes_social_preview_height", "sizes_social_preview_mime_type", "sizes_social_preview_filesize", "sizes_social_preview_filename", "sizes_avatar_url", "sizes_avatar_width", "sizes_avatar_height", "sizes_avatar_mime_type", "sizes_avatar_filesize", "sizes_avatar_filename" FROM \`media\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`ALTER TABLE \`__new_media\` RENAME TO \`media\`;`)
  await db.run(sql`CREATE INDEX \`media_uploaded_by_idx\` ON \`media\` (\`uploaded_by_id\`);`)
  await db.run(sql`CREATE INDEX \`media_comic_meta_comic_meta_related_comic_idx\` ON \`media\` (\`comic_meta_related_comic_id\`);`)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumbnail_small_sizes_thumbnail_small_filena_idx\` ON \`media\` (\`sizes_thumbnail_small_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_webcomic_page_sizes_webcomic_page_filename_idx\` ON \`media\` (\`sizes_webcomic_page_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_webcomic_mobile_sizes_webcomic_mobile_filena_idx\` ON \`media\` (\`sizes_webcomic_mobile_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_cover_image_sizes_cover_image_filename_idx\` ON \`media\` (\`sizes_cover_image_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_social_preview_sizes_social_preview_filename_idx\` ON \`media\` (\`sizes_social_preview_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_avatar_sizes_avatar_filename_idx\` ON \`media\` (\`sizes_avatar_filename\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` text,
  	\`comics_id\` text,
  	\`chapters_id\` text,
  	\`pages_id\` text,
  	\`media_id\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`comics_id\`) REFERENCES \`comics\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`chapters_id\`) REFERENCES \`chapters\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "comics_id", "chapters_id", "pages_id", "media_id") SELECT "id", "order", "parent_id", "path", "users_id", "comics_id", "chapters_id", "pages_id", "media_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_comics_id_idx\` ON \`payload_locked_documents_rels\` (\`comics_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_chapters_id_idx\` ON \`payload_locked_documents_rels\` (\`chapters_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_preferences_rels\`("id", "order", "parent_id", "path", "users_id") SELECT "id", "order", "parent_id", "path", "users_id" FROM \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_preferences_rels\` RENAME TO \`payload_preferences_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_reader_profile_favorite_genres\`;`)
  await db.run(sql`DROP TABLE \`comics_credits\`;`)
  await db.run(sql`DROP TABLE \`comics_genres\`;`)
  await db.run(sql`DROP TABLE \`comics\`;`)
  await db.run(sql`DROP TABLE \`comics_texts\`;`)
  await db.run(sql`DROP TABLE \`chapters\`;`)
  await db.run(sql`DROP TABLE \`pages_page_extra_images\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`DROP TABLE \`media_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_users\`("id", "updated_at", "created_at", "email", "reset_password_token", "reset_password_expiration", "salt", "hash", "login_attempts", "lock_until") SELECT "id", "updated_at", "created_at", "email", "reset_password_token", "reset_password_expiration", "salt", "hash", "login_attempts", "lock_until" FROM \`users\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`ALTER TABLE \`__new_users\` RENAME TO \`users\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`__new_media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric
  );
  `)
  await db.run(sql`INSERT INTO \`__new_media\`("id", "alt", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height") SELECT "id", "alt", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height" FROM \`media\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`ALTER TABLE \`__new_media\` RENAME TO \`media\`;`)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_users_sessions\`("_order", "_parent_id", "id", "created_at", "expires_at") SELECT "_order", "_parent_id", "id", "created_at", "expires_at" FROM \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`ALTER TABLE \`__new_users_sessions\` RENAME TO \`users_sessions\`;`)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_preferences_rels\`("id", "order", "parent_id", "path", "users_id") SELECT "id", "order", "parent_id", "path", "users_id" FROM \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_preferences_rels\` RENAME TO \`payload_preferences_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
}
