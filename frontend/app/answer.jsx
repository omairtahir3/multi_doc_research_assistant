export default function Answer({ data }) {
  const { answer, sources } = data

  return (
    <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 shadow-lg animate-fade-in">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="font-bold text-2xl text-gray-800">Answer</h2>
      </div>
      
      <p className="text-gray-700 leading-relaxed text-lg mb-4 p-4 bg-white rounded-lg shadow-sm">
        {answer}
      </p>

      {sources && sources.length > 0 && (
        <div className="mt-4 pt-4 border-t-2 border-green-200">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
            </svg>
            Sources
          </h3>
          <ul className="space-y-2">
            {sources.map((source, i) => (
              <li key={i} className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold text-sm">{i + 1}</span>
                </div>
                <span className="font-medium text-gray-700">{source}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}