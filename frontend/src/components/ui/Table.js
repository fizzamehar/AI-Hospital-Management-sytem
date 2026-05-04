export default function Table({ headers = [], data = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-white/10">

        <thead className="bg-white/10">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="p-3">{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t border-white/10">
              {Object.values(row).map((val, j) => (
                <td key={j} className="p-3">{val}</td>
              ))}
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}