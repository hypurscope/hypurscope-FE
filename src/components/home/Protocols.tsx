export default function Protocols() {
  return (
    <div className="py-6">
      <h3 className="text-xl font-semibold mb-4">Protocols</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Protocol cards, stats, etc. */}
        <div className="bg-white p-4 rounded-lg border">
          <p>Protocol 1</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p>Protocol 2</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p>Protocol 3</p>
        </div>
      </div>
    </div>
  );
}
