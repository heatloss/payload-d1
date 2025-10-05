#!/bin/bash
set -e

# Full data migration from corrected chimera-cms to payload-d1
CHIMERA_DB="/Users/mike/Sites/chimera-cms/chimera-cms.db"
D1_DB="/Users/mike/Sites/payload-d1/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/32005945036754a10a12ebbe1381482339f69f2eab74b15679d198e087c9dec7.sqlite"
BACKUP_DIR="/Users/mike/Sites/payload-d1/migration-backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "🔍 Verifying source database..."
MEDIA_COUNT=$(sqlite3 "$CHIMERA_DB" "SELECT COUNT(*) FROM media;")
echo "   Found $MEDIA_COUNT media records"

echo ""
echo "📊 Exporting complete data from chimera-cms..."
sqlite3 "$CHIMERA_DB" > "$BACKUP_DIR/full-export-$TIMESTAMP.sql" <<'EOF'
.mode insert users
SELECT * FROM users;
.mode insert comics
SELECT * FROM comics;
.mode insert comics_credits
SELECT * FROM comics_credits;
.mode insert comics_genres
SELECT * FROM comics_genres;
.mode insert comics_texts
SELECT * FROM comics_texts;
.mode insert chapters
SELECT * FROM chapters;
.mode insert pages
SELECT * FROM pages;
.mode insert pages_page_extra_images
SELECT * FROM pages_page_extra_images;
.mode insert media
SELECT * FROM media;
.mode insert media_rels
SELECT * FROM media_rels;
EOF

echo "✅ Export saved to: $BACKUP_DIR/full-export-$TIMESTAMP.sql"
echo ""
echo "⚠️  Ready to import. First, STOP your dev server (Ctrl+C)"
echo ""
echo "Then run these commands:"
echo ""
echo "# 1. Clear existing data:"
echo "sqlite3 \"$D1_DB\" \"DELETE FROM pages_page_extra_images; DELETE FROM pages; DELETE FROM chapters; DELETE FROM comics_credits; DELETE FROM comics_genres; DELETE FROM comics_texts; DELETE FROM comics; DELETE FROM media_rels; DELETE FROM media; DELETE FROM users_sessions; DELETE FROM users;\""
echo ""
echo "# 2. Import new data:"
echo "sqlite3 \"$D1_DB\" < \"$BACKUP_DIR/full-export-$TIMESTAMP.sql\""
echo ""
echo "# 3. Restart dev server:"
echo "pnpm dev"
echo ""
echo "If anything goes wrong, restore with:"
echo "cp \"$BACKUP_DIR/d1-before-full-migration-*.sqlite\" \"$D1_DB\""
