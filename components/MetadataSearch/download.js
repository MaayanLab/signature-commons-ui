import DataProvider from "../../util/fetch/model";
import fileDownload from 'js-file-download';

export async function download_signature_json(signature) {
  const provider = new DataProvider()
  const data = await provider.serialize_signature(signature, {
    resource: true,
    library: true,
    data: true,
  })
  fileDownload(JSON.stringify(data), 'signatures.json')
}

export async function download_library_json(library) {
  const provider = new DataProvider()
  const data = await provider.serialize_library(library, {
    resource: true,
    library: true,
    signatures: true,
    data: true,
  })
  fileDownload(JSON.stringify(data), 'library.json')
}

export async function download_resource_json(resource) {
  const provider = new DataProvider()
  const data = await provider.serialize_resource(resource, {
    libraries: true,
    signatures: true,
    data: true,
  })
  fileDownload(JSON.stringify(data), 'resource.json')
}

export async function download_tsv(lib) {
  const provider = new DataProvider()
  const library = provider.resolve_library(lib)
  const signatures = library.signatures

  const col_labels = new Set(['id'])
  const col_headers = {}
  const row_labels = new Set(['id'])
  const row_headers = {}

  for (const signature of signatures) {
    const signature_id = await signature.id
    const signature_meta = await signature.meta
    col_headers[signature_id] = {}
    for (const key of Object.keys(signature_meta)) {
      col_labels.add(key)
      col_headers[signature_id][key] = JSON.stringify(signature_meta[key])
    }

    const signature_data = await signature.data
    
    for (const entity of signature_data) {
      const entity_id = await entity.id
      if (row_headers[entity_id] !== undefined)
        continue
      row_headers.id = entity_id
      row_headers[entity_id] = {}
      const entity_meta = await entity.meta
      for (const key of Object.keys(entity_meta)) {
        row_labels.add(key)
        row_headers[key] = JSON.stringify(entity_meta[key])
      }
    }
  }

  let result = ''
  for (const col_label of col_labels) {
    result += `${'\t'.repeat(row_labels.length)}\t${col_headers[col_label].join('\t')}\n`
  }
  result += `${row_labels.join('\t')}\t${'\t'.repeat(signatures.length)}\n`
  for (const row of row_headers) {
    result += `${row_labels.map((row_label) => row[row_label]).join('\t')}\t${'1'.repeat(row.length)}\n`
  }

  fileDownload(result, 'data.tsv')
}
