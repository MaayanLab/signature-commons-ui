import blue from '@material-ui/core/colors/blue'
import red from '@material-ui/core/colors/red'
import amber from '@material-ui/core/colors/amber'
import grey from '@material-ui/core/colors/grey'
import green from '@material-ui/core/colors/green'
import yellow from '@material-ui/core/colors/yellow'

export const defaultUIValues = {
  'landing': {
    font_families: [
      'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap',
    ],
    favicon: {
      src: '${PREFIX}/static/favicon.ico',
      alt: 'Signature Commons',
      title: 'Signature Commons',
    },
    header_info: {
      header_left: '',
      header_right: ' Signature Commons',
      icon: {
        src: '${PREFIX}/static/favicon.ico',
        alt: 'Signature Commons',
        style: {
          width: 30,
        },
      },
      menu_props: {
        style: {
          display: 'flex',
          whiteSpace: 'nowrap',
        },
      },
    },
    background_props: {},
    nav: {
      MetadataSearch: {
        active: true,
        endpoint: '/MetadataSearch',
        navName: "Metadata Search",
        props: {
          placeholder: 'Search for any term, i.e. drug, side effects, or a disease',
          examples: ['MCF10A', 'Imatinib', 'ZNF830', 'STAT3', 'Neuropathy'],
        }
      },
      SignatureSearch: {
        active: false,
        endpoint: '/SignatureSearch',
        navName: "Signature Search",
        props: {
          entity_strategy: 'upper', // lower, none
          synonym_strategy: 'none',
          types: {
            Overlap: {
              active: true,
              placeholder: 'Genes that are regulated in signature or overlap with gene set',
              switch: 'Gene Set or Full Signature',
              examples: [
                {
                  label: 'Example Crisp Gene Set',
                  input: {
                    type: 'Overlap',
                    geneset: 'UTP14A\nS100A6\nSCAND1\nRRP12\nCIAPIN1\nADH5\nMTERF3\nSPR\nCHMP4A\nUFM1\nVAT1\nHACD3\nRFC5\nCOTL1\nNPRL2\nTRIB3\nPCCB\nTLE1\nCD58\nBACE2\nKDM3A\nTARBP1\nRNH1\nCHAC1\nMBNL2\nVDAC1\nTES\nOXA1L\nNOP56\nHAT1\nCPNE3\nDNMT1\nARHGAP1\nVPS28\nEIF2S2\nBAG3\nCDCA4\nNPDC1\nRPS6KA1\nFIS1\nSYPL1\nSARS\nCDC45\nCANT1\nHERPUD1\nSORBS3\nMRPS2\nTOR1A\nTNIP1\nSLC25A46\nMAL\nEPCAM\nHDAC6\nCAPN1\nTNRC6B\nPKD1\nRRS1\nHP\nANO10\nCEP170B\nIDE\nDENND2D\nCAMK2B\nZNF358\nRPP38\nMRPL19\nNUCB2\nGNAI1\nLSR\nADGRE2\nPKMYT1\nCDK5R1\nABL1\nPILRB\nAXIN1\nFBXL8\nMCF2L\nDBNDD1\nIGHMBP2\nWIPF2\nWFS1\nOGFOD2\nMAPK1IP1L\nCOL11A1\nREG3A\nSERPINA1\nMYCBP2\nPIGK\nTCAP\nCRADD\nELK1\nDNAJB2\nZBTB16\nDAZAP1\nMAPKAPK2\nEDRF1\nCRIP1\nUCP3\nAGR2\nP4HA2',
                  },
                }
              ]
            },
            Rank: {
              active: true,
              switch: 'Up and Down Gene Sets',
              up_placeholder: 'Genes that are up-regulated in signature or overlap with gene set',
              down_placeholder: 'Genes that are down-regulated in signature or overlap with gene set',
              examples: [
                {
                  label: 'Example Up and Down Sets',
                  input: {
                    type: 'Rank',
                    up_geneset: 'UTP14A\nS100A6\nSCAND1\nRRP12\nCIAPIN1\nADH5\nMTERF3\nSPR\nCHMP4A\nUFM1\nVAT1\nHACD3\nRFC5\nCOTL1\nNPRL2\nTRIB3\nPCCB\nTLE1\nCD58\nBACE2\nKDM3A\nTARBP1\nRNH1\nCHAC1\nMBNL2\nVDAC1\nTES\nOXA1L\nNOP56\nHAT1\nCPNE3\nDNMT1\nARHGAP1\nVPS28\nEIF2S2\nBAG3\nCDCA4\nNPDC1\nRPS6KA1\nFIS1\nSYPL1\nSARS\nCDC45\nCANT1\nHERPUD1\nSORBS3\nMRPS2\nTOR1A\nTNIP1\nSLC25A46',
                    down_geneset: 'MAL\nEPCAM\nHDAC6\nCAPN1\nTNRC6B\nPKD1\nRRS1\nHP\nANO10\nCEP170B\nIDE\nDENND2D\nCAMK2B\nZNF358\nRPP38\nMRPL19\nNUCB2\nGNAI1\nLSR\nADGRE2\nPKMYT1\nCDK5R1\nABL1\nPILRB\nAXIN1\nFBXL8\nMCF2L\nDBNDD1\nIGHMBP2\nWIPF2\nWFS1\nOGFOD2\nMAPK1IP1L\nCOL11A1\nREG3A\nSERPINA1\nMYCBP2\nPIGK\nTCAP\nCRADD\nELK1\nDNAJB2\nZBTB16\nDAZAP1\nMAPKAPK2\nEDRF1\nCRIP1\nUCP3\nAGR2\nP4HA2',
                  }
                }
              ]
            }
          }
        }
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
    extraNav: [
      {
        type: "external",
        endpoint: "https://appyters.maayanlab.cloud/Drugmonizome_ML/",
        navName: "Drugmonizome ML",

      },
      {
        type: "iframe",
        endpoint: "/Tutorial",
        navName: "Tutorial",
        iframe: {
          "website-tutorial": {
            src: "https://nbviewer.jupyter.org/github/MaayanLab/Drugmonizome/blob/master/website-tutorial.ipynb",
            id: "website-tutorial",
            frameBorder: 0,
            height: 5500,
            name: "Website Tutorial"
          },
          "api-tutorial": {
            src: "https://nbviewer.jupyter.org/github/MaayanLab/Drugmonizome/blob/master/api-tutorial.ipynb",
            id: "api-tutorial",
            frameBorder: 0,
            height: 11000,
            name: "API Tutorial"
          }
        }
      }
    ],
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
    resource_order: {},
    about: "Improved methodologies for data collection has accelerated the generation of data in many fields. This shifted the challenge from data generation to ensuring that the data generated are Findable, Accessible, Interoperable, and Reusable (FAIR). Signature Commons (SigCom) is a cloud-agnostic open-source platform designed for storing a wide array of biomedical data. This versatility of SigCom when it comes to data is rooted from the strategy of storing metadata elements as serialized, semi-structured JSON entries that can be paired with unordered or ranked sets of entities such as genes, proteins, and drugs. Signature Commons is composed of a couple of microservices that communicate with each other to provide the users with a seamless experience. The metadata API provides fast full-text search and field comparison filtering of the metadata as well as metadata aggregations for statistical summaries. Furthermore, JSON-Schema validation is performed before ingestion to maintain the integrity of the database and ensure harmonizing the terms with existing ontologies. The data API, on the other hand, provides real-time set-, and two-sided ranked set-enrichment analysis. SigCom includes OpenAPI documentation for these two microservices. A companion web application uses these APIs to provide a data portal for querying, browsing, downloading, and visualizing data. Interactive visualizations include various charts and word clouds to gain insights into the database composition as well as running sum plots for ranked set enrichment. This user interface can be customized by uploading ui schemas to the database, making it easy to deploy portals with different look and feel. Signature Commons provides these microservices as Docker images for a seamless cloud deployment. Signature Commons has been active for over a year and its reusability and ease of deployment has enabled several projects to adopt the platform in building web portals of their own.",
  },
}

export const defaultTheme = {
  palette: {
    primary: {
      main: blue[500],
      contrastText: '#FFF',
    },
    secondary: {
      main: yellow[900],
    },
    error: {
      main: red[500],
    },
    default: {
      main: grey[200],
    },
    defaultCard: {
      main: grey[400],
      contrastText: "#FFF",
    },
    defaultButton: {
      disabled: grey[300],
      main: blue[500],
    },
    defaultChip: {
      main: grey[500],
      contrastText: "#FFF"
    },
    defaultChipLight: {
      main: grey[300],
    },

  },
  card: {
    bottomCard: {
      palette: {},
      overrides: {},
    },
    topCard: {
      palette: {},
      overrides: {},
    },
  },
  chipColors: {
    warning: { backgroundColor: amber[300], color: '#000' },
    alert: { backgroundColor: red[300], color: '#000' },
    healthy: { backgroundColor: green[300], color: '#000' },
  },
  overrides: {
    MUIDataTable: {
      responsiveScroll: {
        maxHeight: '500px',
        minHeight: '500px',
      },
    },
    MUIDataTableHeadCell: {
      root: {
        fontSize: 13,
      },
    },
    MuiChip: {
      root: {
        margin: '5px 10px 5px 0',
      },
    },
  },
}