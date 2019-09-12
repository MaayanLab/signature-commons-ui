import { fetch_meta } from '../util/fetch/meta'

export const UIValues = {
  'landing': (values) => {
    return (
      {
        LandingText: {
          header: values.header || 'Signature Commons',
          text_1: values.text_1 || 'Explore an extensive collection of well-annotated gene-sets and signatures',
          text_2: values.text_2 || 'Search across a broad gathering of perturbations',
          text_3: values.text_3 || 'Examine metadata:',
          text_4: values.text_4 || 'Start using Signature Commons in your project',
          metadata_placeholder: values.metadata_placeholder || 'Search over half a million signatures',
          geneset_placeholder: values.geneset_placeholder || 'Genes that are regulated in signature or overlap with gene set',
          up_genes_placeholder: values.up_genes_placeholder || 'Genes that are up-regulated in signature or overlap with gene set',
          down_genes_placeholder: values.down_genes_placeholder || 'Genes that are down-regulated in signature or overlap with gene set',
          resource_pie_caption: values.resource_pie_caption || 'Signatures per Resource',
          search_terms: values.search_terms || ['MCF10A', 'Imatinib', 'ZNF830', 'STAT3', 'Neuropathy'],
          geneset_terms: values.geneset_terms,
          weighted_geneset_terms: values.weighted_geneset_terms,
          up_set_terms: values.up_set_terms,
          down_set_terms: values.down_set_terms,
        },
        nav: {
          signature_search: values.signature_search !== undefined ? values.signature_search : true,
          metadata_search: values.metadata_search !== undefined ? values.metadata_search : true,
          resources: values.resources !== undefined ? values.resources : true,
        },
        preferred_name_singular: values.preferred_name_singular ||
          {
            libraries: 'Dataset',
            signatures: 'Signature',
            entities: 'Gene',
            resources: 'Resource',
          },
        preferred_name: values.preferred_name ||
          {
            libraries: 'Datasets',
            signatures: 'Signatures',
            entities: 'Genes',
            resources: 'Resources',
          },
        deactivate_download: values.deactivate_download !== undefined ? values.deactivate_download : false,
        deactivate_wordcloud: values.deactivate_wordcloud !== undefined ? values.deactivate_wordcloud : false,
        bar_chart: values.bar_chart,
        bar_chart_style: values.bar_chart_style ||
          {
            ResponsiveContainer: {
              width: '100%',
              height: 420,
            },
            Chart: {
              margin: {
                right: 50,
                left: 50,
                top: 20,
                bottom: 20,
              },
            },
            XAxis: {
              axisLine: false,
              angle: 45,
              height: 50,
              textAnchor: 'start',
              interval: 0,
              tick: {
                fontSize: 10,
              },
              tickLine: false,
            },
            Bar: {
              fill: '#75bef5',
            },
          },
        pie_chart_style: {
          ResponsiveContainer: {
            width: '100%',
            height: 420,
          },
          Chart: {
            width: 420,
            height: 420,
          },
          Pie: {
            fill: '#75bef5',
          },
          Text_Label: {
            fontSize: 10,
          },
        },
        pie_caption: values.pie_caption || 'Signatures per',
        entity_name: values.entity_name,
        entity_synonyms: values.entity_synonyms,
        counting_validator: values.counting_validator || '/dcic/signature-commons-schema/v5/meta/schema/counting.json',
        ui_schema: values.ui_schema || '/dcic/signature-commons-schema/v5/meta/schema/ui-schema.json',
        maxResourcesBeforeCollapse: values.maxResourcesBeforeCollapse || 60,
        maxResourcesToShow: values.maxResourcesToShow || 40,
        score_icon: values.score_icon || 'mdi-trophy-award',
        downloads: values.downloads || {
          gmt: 'Download gmt file',
          tsv: 'Download tsv file',
          geneset: 'Download gene set',
          ranked: 'Download ranked signature',
          signature_json: 'Download signature as json',
          library_json: 'Download library as json',
          resource_json: 'Download resource as json',
          sigcom: false,
          enrichr: true,
        },
      }
    )
  },
  'admin': (values) => {
    return (
      {
        LandingText: {
          header: values.header || 'Signature Commons',
          resource_pie_caption: values.resource_pie_caption || 'Signatures per Resource',
        },
        preferred_name_singular: values.preferred_name_singular ||
          {
            libraries: 'Dataset',
            signatures: 'Signature',
            entities: 'Gene',
            resources: 'Resource',
          },
        preferred_name: values.preferred_name ||
          {
            libraries: 'Datasets',
            signatures: 'Signatures',
            entities: 'Genes',
            resources: 'Resources',
          },
        bar_chart: values.bar_chart,
        bar_chart_style: values.bar_chart_style ||
          {
            ResponsiveContainer: {
              width: '100%',
              height: 350,
            },
            Chart: {
              margin: {
                right: 50,
                left: 50,
                top: 20,
                bottom: 20,
              },
            },
            XAxis: {
              axisLine: false,
              angle: 45,
              height: 50,
              textAnchor: 'start',
              interval: 0,
              tick: {
                fontSize: 10,
              },
              tickLine: false,
            },
            Bar: {
              fill: '#75bef5',
            },
          },
        pie_chart_style: {
          ResponsiveContainer: {
            width: '100%',
            height: 350,
          },
          Chart: {
            width: 420,
            height: 420,
          },
          Pie: {
            fill: '#75bef5',
          },
          Text_Label: {
            fontSize: 10,
          },
        },
        pie_caption: values.pie_caption || 'Signatures per',
        entity_name: values.entity_name,
        entity_synonyms: values.entity_synonyms,
        counting_validator: values.counting_validator || '/dcic/signature-commons-schema/v5/meta/schema/counting.json',
      }
    )
  },
}
