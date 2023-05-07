export default function GenericModal({data, onClose, emailAddress}) {
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="bg-black border border-white rounded-lg px-4 pt-5 pb-4 shadow-xl transform transition-all sm:max-w-lg sm:w-full sm:p-6">
          <div className="text-center">
            <h3 className="text-lg leading-6 font-medium text-white">
              {data.title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-white">{data.message} </p>
            </div>
          </div>
          <div className="mt-5 sm:mt-6">
            <button
              onClick={onClose}
              className="bg-white text-black rounded-xl px-6 py-4 font-bold hover:scale-105 active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
