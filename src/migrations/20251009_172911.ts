import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_media\` (
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`alt\` text,
  	\`caption\` text,
  	\`media_type\` text DEFAULT 'general' NOT NULL,
  	\`uploaded_by_id\` text,
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
  await db.run(sql`PRAGMA foreign_keys=ON;`)
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
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
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
  await db.run(sql`PRAGMA foreign_keys=ON;`)
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
}
