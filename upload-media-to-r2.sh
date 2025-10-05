#!/bin/bash
set -e

MEDIA_DIR="/Users/mike/Sites/chimera-cms/media"
cd "$MEDIA_DIR"

echo "📤 Uploading media files to local R2 bucket..."
echo ""

COUNT=0
find . -maxdepth 1 -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" \) | while read filepath; do
  filename=$(basename "$filepath")
  echo "Uploading: $filename"
  cd /Users/mike/Sites/payload-d1
  pnpm wrangler r2 object put "payload-d1/$filename" --file="$MEDIA_DIR/$filename" --local
  COUNT=$((COUNT + 1))
done

echo ""
echo "✅ Upload complete!"
echo ""
echo "Now restart your dev server and the images should display correctly."
