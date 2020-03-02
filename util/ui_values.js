import merge from 'deepmerge'

const default_values = {
  'landing': {
    font_families: [
      "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
    ],
    favicon: {
      src: "${PREFIX}/static/favicon.ico",
      alt: "Signature Commons",
      title: "Signature Commons"
    },
    header_info: {
      header_left: '',
      header_right: ' Signature Commons',
      icon: {
        src: "${PREFIX}/static/favicon.ico",
        alt: "Signature Commons",
        style: {
          width: 30
      }
      }
    },
    text_1: 'Explore an extensive collection of well-annotated gene-sets and signatures',
    text_2: 'Search across a broad gathering of perturbations',
    text_3: 'By',
    text_4: 'Start using Signature Commons in your project',
    metadata_placeholder: 'Search over half a million signatures',
    geneset_placeholder: 'Genes that are regulated in signature or overlap with gene set',
    up_genes_placeholder: 'Genes that are up-regulated in signature or overlap with gene set',
    down_genes_placeholder: 'Genes that are down-regulated in signature or overlap with gene set',
    resource_pie_caption: 'Signatures per Resource',
    search_terms: ['MCF10A', 'Imatinib', 'ZNF830', 'STAT3', 'Neuropathy'],
    nav: {
      MetadataSearch: {
        active: true,
        endpoint: '/MetadataSearch',
      },
      SignatureSearch: {
        active: false,
        endpoint: '/SignatureSearch',
      },
      Resources: {
        active: true,
        endpoint: '/Resources',
      },
      API: {
        active: true,
        endpoint: '/API',
      },
    },
    preferred_name_singular: {
      libraries: 'Dataset',
      signatures: 'Signature',
      entities: 'Gene',
      resources: 'Resource',
    },
    preferred_name: {
      libraries: 'Datasets',
      signatures: 'Signatures',
      entities: 'Genes',
      resources: 'Resources',
    },
    footer_links: [],
    theme_mod: {},
    powered: true,
    github: 'https://github.com/dcic/signature-commons-ui',
    github_issues: 'https://github.com/dcic/signature-commons-ui/issues',
    deactivate_download: true,
    bar_chart_style: {
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
    counting_validator: '/dcic/signature-commons-schema/v5/meta/schema/counting.json',
    ui_schema: '/dcic/signature-commons-schema/v5/meta/schema/ui-schema.json',
    maxResourcesBeforeCollapse: 60,
    maxResourcesToShow: 40,
    showNonResource: true,
    downloads: {
      gmt: 'Download gmt file',
      tsv: 'Download tsv file',
      geneset: 'Download gene set',
      ranked: 'Download ranked signature',
      signature_json: 'Download signature as json',
      library_json: 'Download library as json',
      resource_json: 'Download resource as json',
      sigcom: true,
      enrichr: true,
    },
    helper_tooltip: {
      "term1": "imatinib",
      "term2": "stat3",
      "term3": "Disease: Neuropathy",
      "term4": "PMID: 123456"
    }
  }
}

// from deepmerge
const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray

export const UIValues = {
  'landing': (values) => {
    const ui_value = merge(default_values['landing'], values,  { arrayMerge: overwriteMerge })
    return (ui_value)
  },
  'admin': (values) => {
    return (
      {
        LandingText: {
          header: 'Signature Commons',
          resource_pie_caption: 'Signatures per Resource',
        },
        preferred_name_singular:           {
            libraries: 'Dataset',
            signatures: 'Signature',
            entities: 'Gene',
            resources: 'Resource',
          },
        preferred_name:           {
            libraries: 'Datasets',
            signatures: 'Signatures',
            entities: 'Genes',
            resources: 'Resources',
          },
        bar_chart: values.bar_chart,
        bar_chart_style:           {
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
        pie_caption: 'Signatures per',
        entity_name: values.entity_name,
        entity_synonyms: values.entity_synonyms,
        counting_validator: '/dcic/signature-commons-schema/v5/meta/schema/counting.json',
      }
    )
  },
}
