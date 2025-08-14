export default function TVLOverview() {
  return (
    <div className="py-6">
      <h3 className="text-xl font-semibold mb-4">Total Value Locked Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TVL charts, trends, etc. */}
        <div className="bg-white p-4 rounded-lg border">
          <p>TVL Chart Component</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p>TVL Metrics</p>
        </div>
      </div>
    </div>
  );
}