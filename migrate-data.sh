#!/bin/bash
set -e

# Safe data migration script from chimera-cms to payload-d1
# This script will export data from chimera-cms and import to payload-d1 local D1

CHIMERA_DB="/Users/mike/Sites/chimera-cms/chimera-cms.db"
D1_DB="/Users/mike/Sites/payload-d1/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/32005945036754a10a12ebbe1381482339f69f2eab74b15679d198e087c9dec7.sqlite"
BACKUP_DIR="/Users/mike/Sites/payload-d1/migration-backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "🔒 Creating backup directory..."
mkdir -p "$BACKUP_DIR"

echo "📦 Backing up payload-d1 D1 database..."
cp "$D1_DB" "$BACKUP_DIR/d1-before-migration-$TIMESTAMP.sqlite"

echo "📊 Creating data export from chimera-cms..."
# Export only the data tables (not payload internal tables)
sqlite3 "$CHIMERA_DB" <<EOF > "$BACKUP_DIR/data-export-$TIMESTAMP.sql"
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

echo "📝 Data export saved to: $BACKUP_DIR/data-export-$TIMESTAMP.sql"
echo ""
echo "⚠️  IMPORTANT: Before importing, you should:"
echo "   1. Review the export file: cat $BACKUP_DIR/data-export-$TIMESTAMP.sql"
echo "   2. Make sure dev server is stopped"
echo "   3. The current user in payload-d1 will be replaced"
echo ""
echo "To proceed with import, run:"
echo "   sqlite3 \"$D1_DB\" < \"$BACKUP_DIR/data-export-$TIMESTAMP.sql\""
echo ""
echo "If anything goes wrong, restore with:"
echo "   cp \"$BACKUP_DIR/d1-before-migration-$TIMESTAMP.sqlite\" \"$D1_DB\""
