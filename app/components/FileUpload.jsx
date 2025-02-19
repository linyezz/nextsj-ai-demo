export default function FileUpload({ onFileSelect }) {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    onFileSelect(files)
  }

  return (
    <div className="mb-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <span className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg">
          选择文件
        </span>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  )
} 