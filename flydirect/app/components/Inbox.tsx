export default function Inbox(props: any) {
  console.log(props);
  return (
      <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                  <th scope="col" className="px-6 py-3">
                      Sender
                  </th>
                  <th scope="col" className="px-6 py-3">
                      Subject
                  </th>
                  <th scope="col" className="px-6 py-3">
                  </th>
              </tr>
              </thead>
              <tbody>
              <tr className="bg-white border-b">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      0x34df838F26565EbF832B7d7c1094D081679E8fe1

                  </th>
                  <td className="px-6 py-4">
                      Red patches on skin
                  </td>
                  <td className="px-6 py-4">
                      <a href="#" className="font-medium text-blue-600 hover:underline">Read</a>
                  </td>
              </tr>
              <tr className="bg-white border-b">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      0xhf6383fhhg723hdh7rhfh836354hfhhdghFDGF12
                  </th>
                  <td className="px-6 py-4">
                      White
                  </td>
                  <td className="px-6 py-4">
                      <a href="#" className="font-medium text-blue-600 hover:underline">Read</a>
                  </td>
              </tr>
              <tr className="bg-white">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      0xGH12gh45GYTY44FGHH9776HGgghhjgf5f$dfr0FG
                  </th>
                  <td className="px-6 py-4">
                      Sore throat
                  </td>
                  <td className="px-6 py-4">
                      <a href="#" className="font-medium text-blue-600 hover:underline">Read</a>
                  </td>
              </tr>
              </tbody>
          </table>
      </div>
  );
}
