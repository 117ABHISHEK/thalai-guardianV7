import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const HemoglobinChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-blue-600">Hemoglobin Trends</h3>
        <div className="text-center py-8 text-gray-500">No hemoglobin data available for chart visualization.</div>
      </div>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const chartData = data.map((item) => ({
    ...item,
    date: formatDate(item.date),
  }))

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-blue-600">Hemoglobin Trends</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
            <YAxis
              label={{ value: "Hemoglobin (g/dL)", angle: -90, position: "insideLeft" }}
              domain={["dataMin - 1", "dataMax + 1"]}
            />
            <Tooltip
              formatter={(value) => [`${value} g/dL`, "Hemoglobin"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="hemoglobin"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#2563eb", strokeWidth: 2 }}
            />
            {/* Normal range indicators */}
            <Line
              type="monotone"
              dataKey={() => 12}
              stroke="#10b981"
              strokeDasharray="5 5"
              dot={false}
              name="Normal Min (12 g/dL)"
            />
            <Line
              type="monotone"
              dataKey={() => 15.5}
              stroke="#10b981"
              strokeDasharray="5 5"
              dot={false}
              name="Normal Max (15.5 g/dL)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>Normal hemoglobin range: 12-15.5 g/dL (shown as green dashed lines)</p>
        <p>Values below 12 g/dL may indicate anemia and require medical attention.</p>
      </div>
    </div>
  )
}

export default HemoglobinChart
