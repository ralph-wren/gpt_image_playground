import { useMemo, useRef } from 'react'
import { DOCUMENTED_IMAGE_ASPECT_RATIOS, normalizeDocumentedImageAspectRatio } from '../lib/size'
import { usePreventBackgroundScroll } from '../hooks/usePreventBackgroundScroll'

interface Props {
  currentSize: string
  onSelect: (size: string) => void
  onClose: () => void
  allowAuto?: boolean
}

const RATIOS = DOCUMENTED_IMAGE_ASPECT_RATIOS.map((value) => ({ label: value, value }))

function getRatioPreview(value: string) {
  const [w, h] = value.split(':').map(Number)
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null
  const isHorizontal = w > h
  const isSquare = w === h
  return {
    width: isHorizontal || isSquare ? '100%' : `${(w / h) * 100}%`,
    height: !isHorizontal || isSquare ? '100%' : `${(h / w) * 100}%`,
  }
}

export default function SizePickerModal({ currentSize, onSelect, onClose, allowAuto = true }: Props) {
  usePreventBackgroundScroll(true)

  const modalRef = useRef<HTMLDivElement>(null)
  const mouseDownTargetRef = useRef<EventTarget | null>(null)
  const normalizedCurrentSize = useMemo(
    () => normalizeDocumentedImageAspectRatio(currentSize) || (allowAuto ? 'auto' : '1:1'),
    [allowAuto, currentSize],
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownTargetRef.current = e.target
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    const mouseDownTarget = mouseDownTargetRef.current
    const mouseUpTarget = e.target

    if (
      modalRef.current &&
      mouseDownTarget &&
      !modalRef.current.contains(mouseDownTarget as Node) &&
      mouseUpTarget &&
      !modalRef.current.contains(mouseUpTarget as Node)
    ) {
      onClose()
    }
    mouseDownTargetRef.current = null
  }

  const applySize = (value: string) => {
    onSelect(value)
    onClose()
  }

  return (
    <div
      data-no-drag-select
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-overlay-in" />
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/50 bg-white/95 p-5 shadow-2xl ring-1 ring-black/5 animate-modal-in dark:border-white/[0.08] dark:bg-gray-900/95 dark:ring-white/10"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">设置图像比例</h3>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">当前：{normalizedCurrentSize}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/[0.06] dark:hover:text-gray-200"
            aria-label="关闭"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {allowAuto && (
            <button
              onClick={() => applySize('auto')}
              className={`w-full rounded-xl border px-3 py-3 text-sm transition ${
                normalizedCurrentSize === 'auto'
                  ? 'border-blue-400 bg-blue-50 text-blue-600 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-300'
                  : 'border-gray-200/70 bg-white/60 text-gray-600 hover:bg-gray-50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06]'
              }`}
            >
              自动
            </button>
          )}

          <div className="grid grid-cols-4 gap-2">
            {RATIOS.map((item) => {
              const preview = getRatioPreview(item.value)
              return (
                <button
                  key={item.value}
                  onClick={() => applySize(item.value)}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm transition ${
                    normalizedCurrentSize === item.value
                      ? 'border-blue-400 bg-blue-50 text-blue-600 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-300'
                      : 'border-gray-200/70 bg-white/60 text-gray-600 hover:bg-gray-50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex h-5 w-5 items-center justify-center">
                    <div
                      className="border-[1.5px] border-current rounded-[3px] opacity-60"
                      style={preview ? { width: preview.width, height: preview.height } : undefined}
                    />
                  </div>
                  <span className="text-xs">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
