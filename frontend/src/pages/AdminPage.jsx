import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import axios from 'axios'

const API_BASE = 'http://localhost:5000'

export default function AdminPage() {
  const containerRef = useRef(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', sku: '', metadata: '{}' })
  const [images, setImages] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
  }, [])

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [images])

  const onSubmit = async (event) => {
    event.preventDefault()
    const body = new FormData()
    Object.entries(form).forEach(([key, value]) => body.append(key, value))
    images.forEach((file) => body.append('images', file))

    try {
      const { data } = await axios.post(`${API_BASE}/add-product`, body)
      setMessage(data.message)
      setForm({ name: '', description: '', price: '', category: '', sku: '', metadata: '{}' })
      setImages([])
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add product')
    }
  }

  return (
    <section ref={containerRef} className="bg-slate-800/60 p-6 rounded-xl border border-slate-700">
      <h2 className="text-2xl font-semibold mb-4">Admin Product Upload</h2>
      <form onSubmit={onSubmit} className="grid gap-4">
        {['name', 'description', 'price', 'category', 'sku', 'metadata'].map((field) => (
          <input
            key={field}
            required={['name', 'description', 'price'].includes(field)}
            placeholder={field}
            value={form[field]}
            onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
            className="rounded-lg p-3 bg-slate-900 border border-slate-700"
          />
        ))}

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImages(Array.from(e.target.files || []))}
          className="text-sm"
          required
        />

        {previewUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {previewUrls.map((url) => (
              <img key={url} src={url} alt="preview" className="h-24 w-full object-cover rounded-lg border border-slate-700" />
            ))}
          </div>
        )}

        <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-lg py-3 font-semibold transition">Save Product</button>
      </form>

      {message && <p className="mt-4 text-cyan-300">{message}</p>}
    </section>
  )
}
