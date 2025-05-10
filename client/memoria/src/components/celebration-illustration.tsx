export default function CelebrationIllustration() {
  return (
    <div className="relative w-64 h-64">
      <div className="absolute top-10 right-10 w-8 h-8 bg-pink-500 rounded-full transform rotate-45"></div>
      <div className="absolute top-20 right-20 w-6 h-6 bg-yellow-400 rounded-full"></div>
      <div className="absolute top-30 right-5 w-4 h-4 bg-purple-400 rounded-full"></div>
      <div className="absolute bottom-10 right-30 w-10 h-10 bg-gray-200 rounded-full opacity-50"></div>
      <div className="absolute bottom-20 right-10 w-8 h-8 bg-gray-300 rounded-full opacity-50"></div>

      {/* Simple person illustration */}
      <div className="absolute bottom-0 right-20">
        <div className="relative">
          {/* Head */}
          <div className="w-12 h-12 bg-amber-600 rounded-full"></div>

          {/* Body */}
          <div className="w-20 h-24 bg-white rounded-t-lg mt-2 relative">
            {/* Arms */}
            <div className="absolute -left-8 top-0 w-8 h-4 bg-white rounded-full transform -rotate-45"></div>
            <div className="absolute -right-8 top-0 w-12 h-4 bg-white rounded-full transform rotate-45"></div>

            {/* Red flag */}
            <div className="absolute -right-16 -top-8 w-12 h-8 bg-red-600"></div>
            <div className="absolute -right-18 -top-8 w-2 h-20 bg-green-800"></div>
          </div>

          {/* Legs */}
          <div className="absolute -left-2 bottom-0 w-4 h-12 bg-blue-900 rounded-b-lg"></div>
          <div className="absolute left-10 bottom-0 w-4 h-12 bg-blue-900 rounded-b-lg"></div>

          {/* Shoes */}
          <div className="absolute -left-4 -bottom-4 w-8 h-4 bg-brown-700 rounded-l-full"></div>
          <div className="absolute left-8 -bottom-4 w-8 h-4 bg-brown-700 rounded-r-full"></div>
        </div>
      </div>
    </div>
  )
}
