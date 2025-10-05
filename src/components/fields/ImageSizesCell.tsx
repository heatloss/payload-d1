'use client'

import React from 'react'
import './ImageSizesCell.css'

interface ImageSizeData {
  url: string
  width: number
  height: number
  mimeType: string
  fileSize: number
  filename: string
}

interface CellProps {
  cellData?: Record<string, ImageSizeData>
}

export const ImageSizesCell: React.FC<CellProps> = ({ cellData }) => {
  if (!cellData || typeof cellData !== 'object' || Object.keys(cellData).length === 0) {
    return <span className="image-sizes-cell-empty">No sizes</span>
  }

  const sizeCount = Object.keys(cellData).length
  const firstSize = Object.values(cellData)[0]

  return (
    <div className="image-sizes-cell">
      {firstSize && (
        <img
          src={firstSize.url}
          alt="thumbnail"
          className="image-sizes-cell-thumbnail"
        />
      )}
      <span className="image-sizes-cell-count">
        {sizeCount} size{sizeCount !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
