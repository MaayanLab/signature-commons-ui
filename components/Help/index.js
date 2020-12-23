import React from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IFrame from '../IFrame'

const prefix = process.env.PREFIX

export default class Help extends React.Component {
	render = () => {
		return (
			<Grid container spacing={3}>
				<Grid xs={12}>
					<Grid container>
						<Grid xs={12}>
							<Typography variant="h3" gutterBottom>
								Help
							</Typography>
						</Grid>
						<Grid xs={12}>
							<Typography variant="h4" gutterBottom>
								Basics
							</Typography>
						</Grid>
						<Grid xs={12} style={{marginTop: 20}}>
							<Typography variant="h5" gutterBottom>
								Searching Signature Commons by keyword
							</Typography>
						</Grid>
						<Grid xs={12} lg={6} md={7}>
							<img src={`${prefix}/static/tutorial/images/metadata-search.png`}
								alt="search" width={500}/> 
						</Grid>
						<Grid xs={12} lg={6}  md={5}>
							<Typography variant="body1">
								Users can query Signature Commons for key terms like drugs, diseases, cell lines, or assays. Furthermore, they can exclude a term from the search by prefixing a query with “-” or “!”. They can also perform OR searches by prefixing terms with “or” or “|”.<br/><br/>
								Clicking “search” without a term in the search box shows all signatures and datasets.
							</Typography>
						</Grid>
						<Grid xs={12} lg={6} md={7}>
							<img src={`${prefix}/static/tutorial/images/metadata-search-result.png`}
								alt="search" width={500}/> 
						</Grid>
						<Grid xs={12} lg={6}  md={5}>
							<Typography variant="body1">
								Upon performing metadata search, users are redirected to a search results page. Users can view results for signatures or datasets by clicking the respective tabs. They can further narrow down their results by (1) adding keywords on the search box, (2) checking boxes on the filters, (3) clicking on a chip on from the results.
							</Typography>
						</Grid>
						<Grid xs={12} lg={6} md={7}>
							<img src={`${prefix}/static/tutorial/images/options.png`}
								alt="search" width={500}/> 
						</Grid>
						<Grid xs={12} lg={6}  md={5}>
							<Typography variant="body1">
								Users can also download the signatures or perform enrichment analysis on the result by clicking at the triple dots at the upper right corner of each search result.
							</Typography>
						</Grid>
						<Grid xs={12} lg={6} md={7}>
							<img src={`${prefix}/static/tutorial/images/expand-meta.png`}
								alt="search" width={500}/> 
						</Grid>
						<Grid xs={12} lg={6}  md={5}>
							<Typography variant="body1">
								Clicking on the arrow button at the lower left corner expands the panel and displays the metadata.
							</Typography>
						</Grid>

						<Grid xs={12} style={{marginTop: 20}}>
							<Typography variant="h5" gutterBottom>
								Performing Signature Search
							</Typography>
						</Grid>
						<Grid xs={12} lg={6} md={7}>
							<img src={`${prefix}/static/tutorial/images/signature-search.png`}
								alt="search" width={500}/> 
						</Grid>
						<Grid xs={12} lg={6} md={5}>
							<Typography variant="body1">
								Users are given the option to do signature search with either (1) a gene set, or (2) up and down gene set. SigCom automatically checks the validity of a gene name and offers suggestions if a synonym exists.
							</Typography>
						</Grid>
						<Grid xs={12} lg={6} md={7}>
							<img src={`${prefix}/static/tutorial/images/sigsearch-results.png`}
								alt="search" width={500}/> 
						</Grid>
						<Grid xs={12} lg={6} md={5}>
							<Typography variant="body1">
								Users are redirected to the results page upon clicking search. Results are grouped by resource. Clicking on a resource shows the signature hits for that resource.
							</Typography>
						</Grid>

						<Grid xs={12} lg={6} md={7}>
							<img src={`${prefix}/static/tutorial/images/dataset-results.png`}
								alt="search" width={500}/> 
						</Grid>
						<Grid xs={12} lg={6} md={5}>
							<Typography variant="body1">
								Results are grouped per dataset and is presented as a table. Users can sort the table by clicking on the columns. Clicking on a row expands the metadata of the signature.
							</Typography>
						</Grid>

						<Grid xs={12} style={{marginTop: 20}}>
							<Typography variant="h5" gutterBottom>
								Browsing Resources
							</Typography>
						</Grid>
						<Grid xs={12} lg={6} md={7}>
						<img src={`${prefix}/static/tutorial/images/resources.png`}
								alt="search" width={500}/> 
						</Grid>
						<Grid xs={12} lg={6} md={5}>
							<Typography variant="body1">
								Signature Commons includes signatures taken from over 40 different resources. Clicking on “Resources” on the app bar will redirect the users to the resources page that shows an overview of all the included resources in Signature Commons. Clicking on an icon will open a page that gives more information about a specific resource, as well as the datasets included for that resource.
							</Typography>
						</Grid>
						
						<Grid xs={12} style={{marginTop: 20}}>
							<Typography variant="h4" gutterBottom>
								API
							</Typography>
						</Grid>
						<Grid xs={12} style={{marginBottom: 20}}>
							<IFrame src={"https://nbviewer.jupyter.org/github/MaayanLab/lymemind-commons-schema/blob/master/Tutorial/API%20Tutorial.ipynb"}
								height={1500}
								width={1500}
							/>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		)
	}
}