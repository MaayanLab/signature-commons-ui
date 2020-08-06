import React from 'react'
import {InfoCard, ExpandedMeta, ExpandButton} from '../src/index'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      expanded: false,
      data: {
        "original": {
          "$validator": "/dcic/signature-commons-schema/v5/core/signature.json",
          "id": "18f6296a-41f2-404a-bb5f-02ff389945fd",
          "library": {
            "$validator": "/dcic/signature-commons-schema/v5/core/library.json",
            "id": "d64b43ce-2c8c-4866-806f-a1733366448b",
            "resource": "6a999311-9a21-426f-a356-be7648fcf9f1",
            "dataset": "lymemind",
            "dataset_type": "rank_matrix",
            "meta": {
              "Icon": "https://raw.githubusercontent.com/MaayanLab/signature-commons-ui/master/public/static/lyme/tufts.png",
              "Category": "Immunology and Molecular Biology",
              "$validator": "/dcic/signature-commons-schema/v5/core/unknown.json",
              "Researchers": [
                {
                  "Name": "Linden Hu",
                  "Type": "Researcher",
                  "Website": "https://gsbs.tufts.edu/facultyResearch/faculty/hu-linden",
                  "Organization": "Tufts University"
                }
              ],
              "Data_description": "We identified genes that are critical for survival in the tick host by studying a transposon mutant library of B. burgdorferi. The library was introduced into larval ticks and then the survival of individual mutants was identified through the use of next generation sequencing technology. The results of these study were published (Phelan et al., PlosPathogens, 2019). The datasets that were generated as part of this study are now publically available as part of this publication. Briefly, we found that insertions into 46 genes resulted in a complete loss of recovery of mutants from larval Ixodes ticks. Insertions in an additional 56 genes resulted in a >90% decrease in fitness. The screen identified both previously known and new genes important for larval tick survival. Almost half of the genes required for survival in the tick encode proteins of unknown function, while a significant portion (over 20%) encode membrane- associated proteins or lipoproteins. We validated the results of the screen for five Tn mutants by performing individual competition assays using mutant and complemented strains. To better understand the role of one of these genes in tick survival, we conducted mechanistic studies of bb0017, a gene previously shown to be required for resistance against oxidative stress. We are currently pursuing another set of genes that were identified as part of this study that revealed a specific nutritional vulnerability of B. burgdorferi that is potentially exposed in the tick vector.  We are currently testing drugs designed to inhibit this target and hope to utilize identified compounds as potential drugs for interrupting the tick-mouse cycle of transmission.",
              "Cohen-funded_study_title": "Identification of Borrelia burgdorferi genes involved in adaptation to the tick host by massively parallel sequencing",
              "Brief_research_project_summary": "This project was to develop a new approach to identifying virulence determinants of Borrelia burgdorferi for survival in its tick host.  Understanding of genes critical for survival in the tick is very limited.  We sought to develop a high through-put method for identification of critical genes by pairing a transposon mutant library of B. burgdorferi with next-generation sequencing technology.  If successful, the identified genes could serve as targets for screens of non-toxic compound libraries that could be used to narrowly affect interactions between the bacteria and the tick host that affect the ability to successfully act as a host for the organism (vector competence).  Finding compounds that narrowly affect vector competence by affecting interactions of specific proteins of the tick and bacteria are less likely to have unintended environmental consequences if used to try and control rates of infected ticks.",
              "Data_generation_complete_or_ongoing": "Ongoing"
            }
          },
          "meta": {
            "doi": "10.1371/journal.ppat.1007644",
            "url": "https://api.figshare.com/v2/articles/8125247",
            "size": 8190585,
            "tags": [
              "transposon insertion sequencing",
              "vivo screening",
              "Genome-wide screen",
              "56 genes",
              "Tn mutants",
              "encode proteins",
              "Ixodes ticks",
              "burgdorferi survival",
              "host pathogen interaction",
              "novel genes",
              "biphasic life cycle",
              "competition assays",
              "Lyme disease",
              "Borrelia burgdorferi survival",
              "BB 0017",
              "oxidative stress",
              "enzootic cycle",
              "bb 0017",
              "46 genes",
              "borrelial virulence determinants",
              "vector Borrelia burgdorferi"
            ],
            "assay": {
              "Name": "transposon insertion sequencing"
            },
            "files": [
              {
                "id": 15145289,
                "name": "ppat.1007644.s001.docx",
                "size": 125422,
                "computed_md5": "28ffbb94e5232bb5bebfc22afaf540b8",
                "download_url": "https://ndownloader.figshare.com/files/15145289",
                "supplied_md5": "28ffbb94e5232bb5bebfc22afaf540b8"
              },
              {
                "id": 15145292,
                "name": "ppat.1007644.s002.docx",
                "size": 158716,
                "computed_md5": "e31e5c9cb15b228b96b8bfe9f2c2ad35",
                "download_url": "https://ndownloader.figshare.com/files/15145292",
                "supplied_md5": "e31e5c9cb15b228b96b8bfe9f2c2ad35"
              },
              {
                "id": 15145295,
                "name": "ppat.1007644.s003.tif",
                "size": 2033016,
                "computed_md5": "4d5c653b2956c1f5f6f48aac1876f4fd",
                "download_url": "https://ndownloader.figshare.com/files/15145295",
                "supplied_md5": "4d5c653b2956c1f5f6f48aac1876f4fd"
              },
              {
                "id": 15145298,
                "name": "ppat.1007644.s004.tif",
                "size": 470460,
                "computed_md5": "03a8d0435a112c10f8f35572cb61e90c",
                "download_url": "https://ndownloader.figshare.com/files/15145298",
                "supplied_md5": "03a8d0435a112c10f8f35572cb61e90c"
              },
              {
                "id": 15145301,
                "name": "ppat.1007644.s005.tif",
                "size": 61050,
                "computed_md5": "34a9a30b6fb838e88c8f52a6b2208773",
                "download_url": "https://ndownloader.figshare.com/files/15145301",
                "supplied_md5": "34a9a30b6fb838e88c8f52a6b2208773"
              },
              {
                "id": 15145304,
                "name": "ppat.1007644.s006.xlsx",
                "size": 350236,
                "computed_md5": "54b2185750048aba7e5e2944422da62d",
                "download_url": "https://ndownloader.figshare.com/files/15145304",
                "supplied_md5": "54b2185750048aba7e5e2944422da62d"
              },
              {
                "id": 15145307,
                "name": "ppat.1007644.s007.gbk",
                "size": 3449786,
                "computed_md5": "868e01a258bcfc9f1937aa3ccb68fc0c",
                "download_url": "https://ndownloader.figshare.com/files/15145307",
                "supplied_md5": "868e01a258bcfc9f1937aa3ccb68fc0c"
              },
              {
                "id": 15145310,
                "name": "ppat.1007644.s008.fa",
                "size": 1541899,
                "computed_md5": "38e6bf1c102e09bac9de3fbe9cb3e19a",
                "download_url": "https://ndownloader.figshare.com/files/15145310",
                "supplied_md5": "38e6bf1c102e09bac9de3fbe9cb3e19a"
              }
            ],
            "thumb": "https://s3-eu-west-1.amazonaws.com/ppreviews-plos-725668748/15145298/thumb.png",
            "title": "Genome-wide screen identifies novel genes required for Borrelia burgdorferi survival in its Ixodes tick vector",
            "status": "public",
            "authors": [
              "James P. Phelan",
              "Aurelie Kern",
              "Meghan E. Ramsey",
              "Maureen E. Lundt",
              "Bijaya Sharma",
              "Tao Lin",
              "Lihui Gao",
              "Steven J. Norris",
              "Jenny A. Hyde",
              "Jon T. Skare",
              "Linden T. Hu"
            ],
            "license": {
              "url": "https://creativecommons.org/licenses/by/4.0/",
              "name": "CC BY 4.0",
              "value": 1
            },
            "version": 1,
            "category": "Immunology and Molecular Biology",
            "citation": "Phelan, James P.; Kern, Aurelie; Ramsey, Meghan E.; Lundt, Maureen E.; Sharma, Bijaya; Lin, Tao; et al. (2019): Genome-wide screen identifies novel genes required for <i>Borrelia burgdorferi</i> survival in its <i>Ixodes</i> tick vector. PLOS Pathogens. Dataset. https://doi.org/10.1371/journal.ppat.1007644",
            "group_id": 113,
            "organism": [
              "Ixodes ticks"
            ],
            "timeline": {
              "posted": "2019-05-14T17:28:42",
              "revision": "2019-05-14T17:28:46",
              "firstOnline": "2019-05-14T17:28:42"
            },
            "is_public": true,
            "$validator": "/dcic/signature-commons-schema/v5/core/unknown.json",
            "access_url": "https://figshare.com/articles/Genome-wide_screen_identifies_novel_genes_required_for_i_Borrelia_burgdorferi_i_survival_in_its_i_Ixodes_i_tick_vector/8125247",
            "categories": [
              {
                "id": 8,
                "title": "Microbiology",
                "parent_id": 48
              },
              {
                "id": 13,
                "title": "Genetics",
                "parent_id": 48
              },
              {
                "id": 272,
                "title": "Environmental Sciences not elsewhere classified",
                "parent_id": 33
              },
              {
                "id": 39,
                "title": "Ecology",
                "parent_id": 33
              },
              {
                "id": 46,
                "title": "Immunology",
                "parent_id": 48
              },
              {
                "id": 734,
                "title": "Biological Sciences not elsewhere classified",
                "parent_id": 48
              },
              {
                "id": 132,
                "title": "Infectious Diseases",
                "parent_id": 48
              }
            ],
            "identifier": 8125247,
            "description": "<div><p><i>Borrelia burgdorferi</i>, the causative agent of Lyme disease in humans, is maintained in a complex biphasic life cycle, which alternates between tick and vertebrate hosts. To successfully survive and complete its enzootic cycle, <i>B</i>. <i>burgdorferi</i> adapts to diverse hosts by regulating genes required for survival in specific environments. Here we describe the first ever use of transposon insertion sequencing (Tn-seq) to identify genes required for <i>B</i>. <i>burgdorferi</i> survival in its tick host. We found that insertions into 46 genes resulted in a complete loss of recovery of mutants from larval <i>Ixodes</i> ticks. Insertions in an additional 56 genes resulted in a >90% decrease in fitness. The screen identified both previously known and new genes important for larval tick survival. Almost half of the genes required for survival in the tick encode proteins of unknown function, while a significant portion (over 20%) encode membrane-associated proteins or lipoproteins. We validated the results of the screen for five Tn mutants by performing individual competition assays using mutant and complemented strains. To better understand the role of one of these genes in tick survival, we conducted mechanistic studies of <i>bb0017</i>, a gene previously shown to be required for resistance against oxidative stress. In this study we show that BB0017 affects the regulation of key borrelial virulence determinants. The application of Tn-seq to <i>in vivo</i> screening of <i>B</i>. <i>burgdorferi</i> in its natural vector is a powerful tool that can be used to address many different aspects of the host pathogen interaction.</p></div>",
            "created_date": {
              "day": "14",
              "year": "2019",
              "month": "05"
            },
            "defined_type": 3,
            "resource_doi": "10.1371/journal.ppat.1007644",
            "modified_date": {
              "day": "14",
              "year": "2019",
              "month": "05"
            },
            "published_date": {
              "day": "14",
              "year": "2019",
              "month": "05"
            },
            "brief_description": "Sequences (GenBank and Fasta files) of transposon insertions that could help survival of tick.",
            "defined_type_name": "dataset"
          }
        },
        "processed": {
          "id": "18f6296a-41f2-404a-bb5f-02ff389945fd",
          "display": {},
          "name": {
            "text": "Genome-wide screen identifies novel genes required for Borrelia burgdorferi survival in its Ixodes tick vector",
            "label": "Image",
            "alt": "Genome-wide screen identifies novel genes required for Borrelia burgdorferi survival in its Ixodes tick vector",
            "src": "static/lyme/tufts.png",
            "hyperlink": "https://figshare.com/articles/Genome-wide_screen_identifies_novel_genes_required_for_i_Borrelia_burgdorferi_i_survival_in_its_i_Ixodes_i_tick_vector/8125247"
          },
          "icon": {
            "label": "Image",
            "alt": "Genome-wide screen identifies novel genes required for Borrelia burgdorferi survival in its Ixodes tick vector",
            "src": "https://raw.githubusercontent.com/MaayanLab/signature-commons-ui/master/public/static/lyme/tufts.png",
            "text": "Genome-wide screen identifies novel genes required for Borrelia burgdorferi survival in its Ixodes tick vector",
            "hyperlink": "https://figshare.com/articles/Genome-wide_screen_identifies_novel_genes_required_for_i_Borrelia_burgdorferi_i_survival_in_its_i_Ixodes_i_tick_vector/8125247"
          },
          "subtitle": {
            "text": "Sequences (GenBank and Fasta files) of transposon insertions that could help survival of tick.",
            "label": "Brief Description"
          },
          "tags": [
            {
              "text": "transposon insertion sequencing",
              "label": "Assay",
              "icon": "mdi-flask-outline",
              "priority": 3
            },
            {
              "text": "Immunology and Molecular Biology",
              "label": "Category",
              "icon": "mdi-crosshairs-question",
              "priority": 3
            },
            {
              "text": "Ixodes ticks",
              "label": "Organism",
              "icon": "mdi-bug",
              "priority": 3
            }
          ],
          "download": [],
          "keywords": {
            "Authors": {
              "label": "Authors",
              "value": [
                "James P. Phelan",
                "Aurelie Kern",
                "Meghan E. Ramsey",
                "Maureen E. Lundt",
                "Bijaya Sharma",
                "Tao Lin",
                "Lihui Gao",
                "Steven J. Norris",
                "Jenny A. Hyde",
                "Jon T. Skare",
                "Linden T. Hu"
              ],
              "icon": "mdi-account-search"
            }
          }
        }
      }
    }
  }

  handleClick = () => {
    this.setState({
      expanded: !this.state.expanded
    })
  }

  render = () => {
    const LeftComponents = [ {
      component: (props) => (<ExpandButton {...props}/>),
      props: {
        expanded: this.state.expanded,
        ButtonProps: {
          onClick: this.handleClick,
          style:{ minWidth: 5,
                  marginTop: 70,
                  paddingBottom: 0 }
        }
      }
    }
    ]
    const BottomComponents = [
      {
        component: (props) => (
          <ExpandedMeta {...props}/>
        ),
        props: {
          expanded: this.state.expanded,
          data: this.state.data.original,
          search: []
        }
      },
    ]
    return (
      <div>
        <InfoCard info={this.state.data.processed}
                  LeftComponents={LeftComponents}
                  BottomComponents={BottomComponents}
                  highlight={["GenBank", "Fasta", "tick"]}
        />
      </div>
    )
  }
}
