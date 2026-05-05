export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="w-10 h-10 rounded-full border-4 border-cyan-300 border-t-transparent animate-spin" />
    </div>
  )
}
