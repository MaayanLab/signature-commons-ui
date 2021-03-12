import blue from '@material-ui/core/colors/blue'
import red from '@material-ui/core/colors/red'
import amber from '@material-ui/core/colors/amber'
import grey from '@material-ui/core/colors/grey'
import green from '@material-ui/core/colors/green'
import yellow from '@material-ui/core/colors/yellow'

export const defaultUIValues = {
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
          model_tabs: ["resources", "libraries", "signatures", "entities"],
          entry_model: "signatures",
          placeholder: 'Search for any term, i.e. drug, side effects, or a disease',
          examples: {
            entities: [
              "ACE2", "STAT3"
            ],
            libraries: ['L1000', 'text mining', 'RNA-seq'],
            resources: ['CMAP', 'Gene Ontology', 'Metabolomics', 'Transcription Factors'],
            signatures: ['MCF10A', 'Imatinib', 'ZNF830', 'STAT3', 'Neuropathy']
          }
        }
      },
      SignatureSearch: {
        active: true,
        endpoint: '/SignatureSearch',
        navName: "Signature Search",
        props: {
          types: {
            Overlap: {
              active: true,
              placeholder: 'Genes that are regulated in signature or overlap with gene set',
              switch: 'Gene Sets',
              icon: 'mdi-set-merge',
              examples: [
                {
                  label: 'Example Crisp Gene Set',
                  input: {
                    entities: 'UTP14A\nS100A6\nSCAND1\nRRP12\nCIAPIN1\nADH5\nMTERF3\nSPR\nCHMP4A\nUFM1\nVAT1\nHACD3\nRFC5\nCOTL1\nNPRL2\nTRIB3\nPCCB\nTLE1\nCD58\nBACE2\nKDM3A\nTARBP1\nRNH1\nCHAC1\nMBNL2\nVDAC1\nTES\nOXA1L\nNOP56\nHAT1\nCPNE3\nDNMT1\nARHGAP1\nVPS28\nEIF2S2\nBAG3\nCDCA4\nNPDC1\nRPS6KA1\nFIS1\nSYPL1\nSARS\nCDC45\nCANT1\nHERPUD1\nSORBS3\nMRPS2\nTOR1A\nTNIP1\nSLC25A46\nMAL\nEPCAM\nHDAC6\nCAPN1\nTNRC6B\nPKD1\nRRS1\nHP\nANO10\nCEP170B\nIDE\nDENND2D\nCAMK2B\nZNF358\nRPP38\nMRPL19\nNUCB2\nGNAI1\nLSR\nADGRE2\nPKMYT1\nCDK5R1\nABL1\nPILRB\nAXIN1\nFBXL8\nMCF2L\nDBNDD1\nIGHMBP2\nWIPF2\nWFS1\nOGFOD2\nMAPK1IP1L\nCOL11A1\nREG3A\nSERPINA1\nMYCBP2\nPIGK\nTCAP\nCRADD\nELK1\nDNAJB2\nZBTB16\nDAZAP1\nMAPKAPK2\nEDRF1\nCRIP1\nUCP3\nAGR2\nP4HA2',
                  },
                }
              ]
            },
            Rank: {
              active: true,
              switch: 'Up and Down Gene Sets',
              up_placeholder: 'Up-regulated genes',
              down_placeholder: 'Down-regulated genes',
              icon: 'mdi-menu-swap',
              examples: [
                {
                  label: 'Example Up and Down Sets',
                  input: {
                    up_entities: 'UTP14A\nS100A6\nSCAND1\nRRP12\nCIAPIN1\nADH5\nMTERF3\nSPR\nCHMP4A\nUFM1\nVAT1\nHACD3\nRFC5\nCOTL1\nNPRL2\nTRIB3\nPCCB\nTLE1\nCD58\nBACE2\nKDM3A\nTARBP1\nRNH1\nCHAC1\nMBNL2\nVDAC1\nTES\nOXA1L\nNOP56\nHAT1\nCPNE3\nDNMT1\nARHGAP1\nVPS28\nEIF2S2\nBAG3\nCDCA4\nNPDC1\nRPS6KA1\nFIS1\nSYPL1\nSARS\nCDC45\nCANT1\nHERPUD1\nSORBS3\nMRPS2\nTOR1A\nTNIP1\nSLC25A46',
                    down_entities: 'MAL\nEPCAM\nHDAC6\nCAPN1\nTNRC6B\nPKD1\nRRS1\nHP\nANO10\nCEP170B\nIDE\nDENND2D\nCAMK2B\nZNF358\nRPP38\nMRPL19\nNUCB2\nGNAI1\nLSR\nADGRE2\nPKMYT1\nCDK5R1\nABL1\nPILRB\nAXIN1\nFBXL8\nMCF2L\nDBNDD1\nIGHMBP2\nWIPF2\nWFS1\nOGFOD2\nMAPK1IP1L\nCOL11A1\nREG3A\nSERPINA1\nMYCBP2\nPIGK\nTCAP\nCRADD\nELK1\nDNAJB2\nZBTB16\nDAZAP1\nMAPKAPK2\nEDRF1\nCRIP1\nUCP3\nAGR2\nP4HA2',
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
    extraNav: [],
    // extraNav: [
    //   {
    //     type: "external",
    //     endpoint: "https://appyters.maayanlab.cloud/Drugmonizome_ML/",
    //     navName: "Drugmonizome ML",

    //   },
    //   {
    //     type: "iframe",
    //     endpoint: "/Tutorial",
    //     navName: "Tutorial",
    //     iframe: {
    //       "website-tutorial": {
    //         src: "https://nbviewer.jupyter.org/github/MaayanLab/Drugmonizome/blob/master/website-tutorial.ipynb",
    //         id: "website-tutorial",
    //         frameBorder: 0,
    //         height: 5500,
    //         name: "Website Tutorial"
    //       },
    //       "api-tutorial": {
    //         src: "https://nbviewer.jupyter.org/github/MaayanLab/Drugmonizome/blob/master/api-tutorial.ipynb",
    //         id: "api-tutorial",
    //         frameBorder: 0,
    //         height: 11000,
    //         name: "API Tutorial"
    //       }
    //     }
    //   }
    // ],
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
    about: "./static/about.md",
    pie_chart_style: {
      Pie: {
        fill: "#0063ff"
      }
    }
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