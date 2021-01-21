import React from 'react'
import { AutoSize, Table, Column } from 'react-virtualized'

export function VirtualizedTable({ data: { header, data } }) {
  return (
    <div>
    <AutoSize>
      {({ height, width }) => (
        <Table
          rowCount={data.length}
          rowGetter={({ index }) => data[index]}
          rowHeight={75}
          height={height}
          width={width}
        >
          {header.map(h =>
            <Column
              key={h}
              dataKey={h}
              label={h}
              width={50}
            />
          )}
        </Table>
      )}
    </AutoSize>
    </div>
  )
}
