import { fetch_meta, fetch_meta_post } from '../util/fetch/meta'

export const UIValues = {
  'landing': async (values) => {
    let library_name
    if (values.library_name===undefined){
      console.warn("library name is undefined, using key_count values")
      const { response } = await fetch_meta({ endpoint: `/libraries/count`})
      const { response: fields } = await fetch_meta({
        endpoint: `/libraries/key_count`,
      })
      const field_candidate = Object.keys(fields).filter((key)=>fields[key]===response.count && key.indexOf("validator")===-1)
      if (field_candidate.length === 0){
        console.error("Error: No shared library key exist, please define library_name on your schema")
      }else {
        library_name = field_candidate[0]
      }
    }
    return(
      {
        LandingText: {
          header: values.header || "Signature Commons",
          text_1: values.text_1 || "Explore an extensive collection of well-annotated gene-sets and signatures",
          text_2: values.text_2 || "Search across a broad gathering of perturbations",
          text_3: values.text_3 || "Examine metadata:",
          text_4: values.text_4 || "Start using Signature Commons on your project",
          metadata_placeholder: values.metadata_placeholder || "Search over half a million signatures",
          geneset_placeholder: values.geneset_placeholder || "Genes that are regulated in signature or overlap with gene set",
          up_genes_placeholder: values.up_genes_placeholder || "Genes that are up-regulated in signature or overlap with gene set",
          down_genes_placeholder: values.down_genes_placeholder || "Genes that are down-regulated in signature or overlap with gene set",
          resource_pie_caption: values.resource_pie_caption || "Signatures per Resource",
          search_terms: values.search_terms,
          geneset_terms: values.geneset_terms,
          weighted_geneset_terms: values.weighted_geneset_terms,
          up_set_terms: values.up_set_terms,
          down_set_terms: values.down_set_terms
        },
        nav: {
          signature_search: values.signature_search !== undefined ? values.signature_search: true,
          metadata_search: values.metadata_search !== undefined ? values.metadata_search: true,
          resources: values.resources !== undefined ? values.resources: true
        },
        preferred_name_singular: values.preferred_name_singular || 
          {
            libraries: "Dataset",
            signatures: "Signature",
            entities: "Gene",
            resources: "Resource"
          },
        preferred_name: values.preferred_name || 
          {
            libraries: "Datasets",
            signatures: "Signatures",
            entities: "Genes",
            resources: "Resources"
          },
        deactivate_download: values.deactivate_download !== undefined ? values.deactivate_download : false,
        deactivate_wordcloud: values.deactivate_wordcloud !== undefined ? values.deactivate_wordcloud : false,
        bar_chart: values.bar_chart,
        library_name: values.library_name || library_name,
        resource_name_from_library: values.resource_name_from_library,
        resource_name: values.resource_name,
        counting_validator: values.counting_validator || "/dcic/signature-commons-schema/v5/meta/schema/counting.json",
        ui_schema: values.ui_schema || "/dcic/signature-commons-schema/v5/meta/schema/ui-schema.json",
      }
  )},
  'admin': async (values) => {
    let library_name
    if (values.library_name===undefined){
      console.warn("library name is undefined, using key_count values")
      const { response } = await fetch_meta({ endpoint: `/libraries/count`})
      const { response: fields } = await fetch_meta({
        endpoint: `/libraries/key_count`,
      })
      const field_candidate = Object.keys(fields).filter((key)=>fields[key]===response.count && key.indexOf("validator")===-1)
      if (field_candidate.length === 0){
        console.error("Error: No shared library key exist, please define library_name on your schema")
      }else {
        library_name = field_candidate[0]
      }
    }
    return(
      {
        LandingText: {
          header: values.header || "Signature Commons",
          resource_pie_caption: values.resource_pie_caption || "Signatures per Resource",
        },
        preferred_name_singular: values.preferred_name_singular || 
          {
            libraries: "Dataset",
            signatures: "Signature",
            entities: "Gene",
            resources: "Resource"
          },
        preferred_name: values.preferred_name || 
          {
            libraries: "Datasets",
            signatures: "Signatures",
            entities: "Genes",
            resources: "Resources"
          },
        bar_chart: values.bar_chart,
        library_name: values.library_name || library_name,
        resource_name: values.resource_name,
        counting_validator: values.counting_validator || "/dcic/signature-commons-schema/v5/meta/schema/counting.json",
      }
  )}
}