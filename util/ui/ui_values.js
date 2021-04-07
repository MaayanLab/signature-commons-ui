import blue from '@material-ui/core/colors/blue'
import red from '@material-ui/core/colors/red'
import amber from '@material-ui/core/colors/amber'
import grey from '@material-ui/core/colors/grey'
import green from '@material-ui/core/colors/green'

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
        landing: true,
        endpoint: '/TermSearch',
        navName: "Term Search",
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
        landing: false,
        endpoint: '/EnrichmentAnalysis',
        navName: "Enrichment Analysis",
        props: {
          types: {
            Overlap: {
              active: true,
              placeholder: 'Genes that are regulated in signature or overlap with gene set',
              switch: 'Gene Set Enrichment',
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
              switch: 'Up-Down Enrichment',
              up_placeholder: 'Up-regulated genes',
              down_placeholder: 'Down-regulated genes',
              icon: 'mdi-menu-swap',
              examples: [
                {
                  label: 'Example Up and Down Sets',
                  input: {
                    up_entities: 'TAAR9\nEBF2\nWDR78\nRRAGA\nSPATA18\nSPINT2\nMRGPRD\nCD9\nRBP1\nCYB5RL\nMXRA8\nPM20D1\nITIH5\nEPAS1\nAHCYL2\nPANK2\nPON2\nLRP5\nSLC5A3\nNSL1\nCLDN2\nLRP8\nAQP1\nCLDN1\nTMEM72\nGNG4\nNHLH2\nS100A13\nLY6G6C\nPOF1B\nWLS\nFZD4\nCOG7\nFZD6\nFOXF1\nFZD7\nERLIN2\nTYSND1\nACADSB\nOR51I2\nPARP12\nPPFIBP2\nATP4A\nALDH7A1\nTCN2\nSLCO5A1\nSFXN4\nPRR15\nMOXD1\nCAPSL',
                    down_entities: 'GBP7\nOR8H1\nACOT8\nARL14\nGPR37L1\nPPP2R1A\nMED6\nCDC20\nNEIL3\nDDX39B\nLAP3\nKATNAL2\nZSCAN20\nUQCRC2\nRBCK1\nTMCC3\nRNF2\nCMAS\nTESK2\nZFYVE1\nIL27RA\nKIAA1328\nFRAT1\nSNRPD2\nHERC1\nVTI1B\nCHAC2\nNXNL1\nEXOSC2\nSAMD11\nSAMD5\nEPSTI1\nHABP2\nBATF3\nPLK4\nTSPYL1\nXRCC4\nRAB27A\nXRCC2\nBHLHA15\nVPS37C\nTUBG2\nDHFR\nFERMT1\nRNF144B\nBPIFB3\nSMU1\nRIPPLY3\nRNPS1\nSFXN2',
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
    homepage_text: "Search signatures, genes, or datasets.",
    carousel: {
      Rank: [
        {
          src: "./static/lincs/lincs-input.png",
          alt: "input form"
        },
        {
          src: "./static/lincs/lincs-results.png",
          alt: "input form"
        }
      ]
    },
    library_priority: {},
    results_title: null,
}

export const defaultTheme = {
  palette: {
    primary: {
      main: blue[500],
      contrastText: '#FFF',
    },
    secondary: {
      main: "#f50057",
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
      main: grey[300],
      contrastText: "#000"
    },
    errorChip: {
      main: red[200],
      contrastText: "#000"
    },
    warningChip: {
      main: amber[200],
      contrastText: "#000"
    },
    primaryVisualization: {
      main: blue[500],
      contrastText: "#FFF"
    },
    secondaryVisualization: {
      main: "#f50057",
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