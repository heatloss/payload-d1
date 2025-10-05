'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'
import './ImageSizesUI.css'

interface ImageSizeData {
  url: string
  width: number
  height: number
  mimeType: string
  fileSize: number
  filename: string
}

export const ImageSizesUI: React.FC = () => {
  const imageSizes = useFormFields(([fields]) => fields.imageSizes?.value as Record<string, ImageSizeData> | undefined)

  if (!imageSizes || typeof imageSizes !== 'object' || Object.keys(imageSizes).length === 0) {
    return (
      <div className="image-sizes-empty">
        No image sizes generated yet. Upload an image to generate sizes automatically.
      </div>
    )
  }

  const sizes = Object.entries(imageSizes)

  return (
    <div className="image-sizes-container">
      <h3 className="image-sizes-heading">Generated Image Sizes</h3>
      <div className="image-sizes-grid">
        {sizes.map(([name, data]) => {
          if (!data || typeof data !== 'object') return null

          return (
            <div key={name} className="image-size-card">
              <div className="image-size-preview">
                <img
                  src={data.url}
                  alt={name}
                  className="image-size-img"
                />
              </div>
              <div className="image-size-meta">
                <div className="image-size-name">
                  {name.replace(/_/g, ' ')}
                </div>
                <div className="image-size-dimensions">
                  {data.width} × {data.height}
                </div>
                <div className="image-size-filesize">
                  {(data.fileSize / 1024).toFixed(1)} KB
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
