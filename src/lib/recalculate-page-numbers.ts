import type { Payload } from 'payload'

export interface RecalculationResult {
  success: boolean
  message: string
  comicId: string
  totalPages: number
  totalChapters: number
  updates: Array<{
    pageId: string
    title: string
    chapterPageNumber: number
    oldGlobalPageNumber: number
    newGlobalPageNumber: number
  }>
  error?: string
}

export async function recalculateGlobalPageNumbers(
  payload: Payload,
  comicId: string
): Promise<RecalculationResult> {
  try {
    console.log(`🔢 Starting global page number recalculation for comic: ${comicId}`)

    // Step 1: Get all chapters for this comic, sorted by order
    const chapters = await payload.find({
      collection: 'chapters',
      where: {
        comic: { equals: comicId }
      },
      sort: 'order',
      limit: 100
    })

    console.log(`📚 Found ${chapters.docs.length} chapters`)

    let globalPageCounter = 1
    const updatesPerformed = []

    // Step 2: For each chapter, get pages and assign global numbers
    for (const chapter of chapters.docs) {
      // Get all pages in this chapter, sorted by chapter page number
      const pagesInChapter = await payload.find({
        collection: 'pages',
        where: {
          chapter: { equals: chapter.id }
        },
        sort: 'chapterPageNumber',
        limit: 1000
      })

      console.log(`📖 Processing chapter: ${chapter.title} (${pagesInChapter.docs.length} pages)`)

      // Step 3: Assign global page numbers to each page
      for (const page of pagesInChapter.docs) {
        // All pages (including covers) get sequential numbering - no fractional system
        const newGlobalPageNumber = globalPageCounter
        globalPageCounter++

        // Update the page with new global page number - WITH GUARD FLAG
        await payload.update({
          collection: 'pages',
          id: page.id,
          data: {
            globalPageNumber: newGlobalPageNumber
          },
          req: {
            skipGlobalPageCalculation: true // Prevent triggering global page calculation hooks
          }
        })

        updatesPerformed.push({
          pageId: page.id,
          title: page.title || `Chapter ${chapter.order}, Page ${page.chapterPageNumber}`,
          chapterPageNumber: page.chapterPageNumber,
          oldGlobalPageNumber: page.globalPageNumber,
          newGlobalPageNumber: newGlobalPageNumber
        })

        console.log(`📝 Updated page "${page.title || 'Untitled'}" - Chapter ${page.chapterPageNumber} -> Global ${newGlobalPageNumber}`)
      }
    }

    console.log(`✅ Recalculation complete! Updated ${updatesPerformed.length} pages`)

    return {
      success: true,
      message: `Successfully recalculated global page numbers for ${updatesPerformed.length} pages`,
      comicId,
      totalPages: updatesPerformed.length,
      totalChapters: chapters.docs.length,
      updates: updatesPerformed
    }

  } catch (error) {
    console.error('❌ Error recalculating page numbers:', error)
    return {
      success: false,
      message: 'Failed to recalculate page numbers',
      comicId,
      totalPages: 0,
      totalChapters: 0,
      updates: [],
      error: error.message
    }
  }
}