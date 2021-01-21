import React, { useState, useEffect } from 'react'
import { ScatterBoard } from './react_scatter_board'
import { read_tsv } from './utils'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';

import 'ag-grid-community';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

function DirectionRenderer({ value }) {
  if (value === 'up') {
    return '<b style="font-size:200%;">&uarr;</b style="font-size:200%;">'
  } else {
    return '<b style="font-size:200%;">&darr;</b style="font-size:200%;">'
  }
}

function App() {
  const [plotData, setPlotData] = useState(undefined)
  const [tableData, setTableData] = useState(undefined)
  const [selectedCluster, setSelectedCluster] = useState(undefined)
  const [gridApi, setGridApi] = useState(undefined)
  const [gridColumnApi, setGridColumnApi] = useState(undefined)

  function onGridReady(params) {
    setGridApi(params.api)
    setGridColumnApi(params.columnApi)
    params.columnApi.autoSizeAllColumns()
    params.api.setFilterModel({
      adjusted_pvalue: {
        filterType: 'number',
        type: 'lessThan',
        filter: 0.05,
      }
    })
    params.columnApi.applyColumnState({
      state: [
        { colId: 'rank', sort: 'asc' },
        { colId: 'adjusted_pvalue', sort: 'asc' },
      ],
      defaultState: { sort: null },
    })
  }

  useEffect(() => {
    ;(async () => {
      const { data } = await read_tsv('LM2_Deidentified_UMAP.tsv')
      const _data = []
      for (const row of data) {
        const [pid, type, cluster, visit] = row.sid.split('-')
        _data.push({
          x: row['UMAP-1']*1.0,
          y: row['UMAP-2']*1.0,
          sid: row.sid,
          pid: pid.slice(1),
          type,
          cluster: cluster.slice(1),
          visit: visit.slice(1),
        })
      }
      setPlotData(_data)
    })()

    ;(async () => {
      setTableData(await read_tsv('LM2_Cluster_Enrich.tsv'))
    })()
  }, [])

  return (
    <div className="App">
      <div className="header">
      <h2 style={{ textDecoration: 'underline', fontSize: "21.994px" }}>Interactive supplement for:</h2>
        <h1 style={{ fontSize: "25.998px" }}>Predicting Lyme Disease from Patients’ Peripheral Blood Mononuclear Cells Profiled with RNA-sequencing</h1>
        <span style={{ fontSize: 14 }}><b>Daniel J.B. Clarke<sup>1,+</sup>, Alison W. Rebman<sup>2,+</sup>, Allison Bailey<sup>1</sup>, Megan L. Wojciechowicz<sup>1</sup>, Sherry L. Jenkins<sup>1</sup>, John E. Evangelista<sup>1</sup>, Matteo Danieletto<sup>3</sup>, Jinshui Fan<sup>2</sup>, Mark Eshoo<sup>4</sup>, Michael Mosel<sup>5</sup>, William Robinson<sup>6</sup>, Nitya Ramadoss<sup>6</sup>, Jason Bobe<sup>3</sup>, Mark J. Soloski<sup>2,*</sup>, John N. Aucott<sup>2,*</sup>, Avi Ma’ayan<sup>1,*</sup></b></span>
        <p/>
        <p style={{ fontSize: 14 }}>
        <sup>1</sup> Department of Pharmacological Sciences; Mount Sinai Center for Bioinformatics; Icahn School of Medicine at Mount Sinai, One Gustave L. Levy Place, Box 1603, New York, NY 10029, USA< br/>
        <sup>2</sup> Lyme Disease Research Center, Division of Rheumatology, Department of Medicine, Johns Hopkins University School of Medicine, Baltimore, MD, United States< br/>
        <sup>3</sup> Department of Genetics and Genomic Sciences; Icahn School of Medicine at Mount Sinai, One Gustave L. Levy Place, Box 1498, New York, NY 10029, USA< br/>
        <sup>4</sup> BlueArc Biosciences, San Diego< br/>
        <sup>5</sup> Janus-I Science Inc. Vista, California< br/>
        <sup>6</sup> Department of Medicine, Division of Immunology and Rheumatology, Stanford University School of Medicine< br/>
        <sup>+</sup> Contributed equally< br/>
        </p>
        <p className="description">
          This interactive viewer enables you to explore the <a href="https://www.lymemind.org/">LymeMIND2</a> patient cohort in gene expression space. Each point on the map corresponds to a participant where the position of each participant was computed based on a UMAP projection of their PMBC mRNA RNA-seq expression vector. Enrichment analysis is applied to explore enriched terms for each cluster. You can explore these enriched terms by clicking on a cluster to review the table below. These enrichment results were computed by performing differential expression between clusters and using the most significantly up and down regulated genes to query with <a href="http://maayanlab.cloud/Enrichr/">Enrichr</a>. The <a href="https://maayanlab.github.io/react-scatter-board/">react scatter board widget</a> is used to render this plot.
        </p>
      </div>
      <div className="canvas">
        {plotData === undefined ? (
          <div>Loading...</div>
        ) : (
          <ScatterBoard
            style={{ position: 'relative', width: '100%', height: '100%' }}
            data={plotData}
            shapeKey="type"
            colorKey="cluster"
            labelKeys={['pid', 'type', 'cluster', 'visit']}
            is3d={false}
            onClick={(evt, datum) => {
              if (datum === undefined) return
              setSelectedCluster(datum.cluster)
              gridApi.setFilterModel({
                ...(gridApi.getFilterModel() || {}),
                cluster: {
                  filterType: 'text',
                  type: 'equals',
                  filter: datum.cluster,
                },
              })
            }}
          />
          )}
      </div>
      <div className="table ag-theme-material">
        <h2 style={{ margin: 0 }}>Enriched terms for {selectedCluster === undefined ? 'all clusters' : `cluster ${selectedCluster}`}</h2>
        {tableData === undefined ? (
          <div>Loading...</div>
        ) : (
          <AgGridReact
            onGridReady={onGridReady}
            rowData={tableData.data}>
            {['rank', 'direction', 'library', 'term', 'adjusted_pvalue', 'category', 'cluster']
              .map((h, ind) =>
              <AgGridColumn
                key={h}
                colId={h}
                field={h}
                sortable
                cellStyle={{
                  'string': {textAlign: 'left'}
                }[tableData.dtype[h]]}
                filter={{
                  'int': 'agNumberColumnFilter',
                  'float': 'agNumberColumnFilter',
                  'string': 'agTextColumnFilter',
                }[tableData.dtype[h]]}
                type={{
                  'int': 'numericColumn',
                  'float': 'numericColumn',
                  'string': 'stringColumn'
                }[tableData.dtype[h]]}
                resizable
                valueFormatter={{
                  'int': undefined,
                  'float': ({ value }) => value.toPrecision(3),
                }[tableData.dtype[h]]}
                cellRenderer={{
                  'direction': DirectionRenderer,
                }[tableData.dtype[h]]}
                comparator={(valueA, valueB) => {
                  if (tableData.dtype[h] === 'int') {
                    return valueA - valueB
                  } else if (tableData.dtype[h] === 'float') {
                    return valueA - valueB
                  } else {
                    if (valueA > valueB) return 1
                    else if (valueA < valueB) return -1
                    else return 0
                  }
                }}
              />
            )}
          </AgGridReact>
        )}
      </div>
    </div>
  );
}

export default App;
