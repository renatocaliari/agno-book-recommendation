export default function LoadingMessage() {
  return (
    <div className="text-center py-8 animate-pulse">
      <p className="text-lg mb-4">
        This search takes 15-30 seconds... Time for a mini break! 🎬
      </p>
      <div className="space-y-2 text-gray-600">
        <p className="animate-bounce">💧 Grab some water</p>
        <p className="animate-bounce" style={{ animationDelay: "0.2s" }}>🚽 Bio break perhaps?</p>
        <p className="animate-bounce" style={{ animationDelay: "0.4s" }}>🧘‍♂️ Quick stretch session</p>
      </div>
    </div>
  )
}