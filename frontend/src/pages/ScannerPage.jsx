import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { gsap } from 'gsap'
import LoadingSpinner from '../components/LoadingSpinner'

const API_BASE = 'http://localhost:5000'

export default function ScannerPage() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    gsap.fromTo(videoRef.current, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6 })
    let stream

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch {
        setError('Unable to access camera.')
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) {
      return
    }

    setScanning(true)
    setResult(null)
    setError('')

    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    context.drawImage(video, 0, 0)

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setScanning(false)
        setError('Failed to capture image')
        return
      }

      const formData = new FormData()
      formData.append('image', blob, 'scan.jpg')

      try {
        const { data } = await axios.post(`${API_BASE}/scan-image`, formData)
        setResult(data)
      } catch {
        setError('Scan failed')
      } finally {
        setScanning(false)
      }
    }, 'image/jpeg')
  }

  return (
    <section className="bg-slate-800/60 p-6 rounded-xl border border-slate-700">
      <h2 className="text-2xl font-semibold mb-4">Live Scanner</h2>

      <video ref={videoRef} autoPlay playsInline className="w-full max-h-[400px] rounded-xl border border-slate-700 bg-black" />
      <canvas ref={canvasRef} className="hidden" />

      <button
        onClick={captureAndScan}
        disabled={scanning}
        className="mt-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 text-slate-900 rounded-lg px-5 py-3 font-semibold transition"
      >
        {scanning ? 'Scanning...' : 'Capture & Scan'}
      </button>

      {scanning && <LoadingSpinner />}

      {error && <p className="mt-4 text-red-300">{error}</p>}

      {result && (
        <div className="mt-4 p-4 rounded-lg bg-slate-900 border border-slate-700">
          {result.matched ? (
            <div>
              <h3 className="text-xl font-semibold mb-2">{result.product.name}</h3>
              <p>{result.product.description}</p>
              <p className="mt-2 text-cyan-300">Price: ${result.product.price}</p>
              <p>Category: {result.product.category || 'N/A'}</p>
              <p>SKU: {result.product.sku || 'N/A'}</p>
              <p>Distance Score: {result.distance}</p>
            </div>
          ) : (
            <p className="text-amber-300">No Match Found</p>
          )}
        </div>
      )}
    </section>
  )
}
