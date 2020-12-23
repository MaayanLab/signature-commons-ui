import React from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IFrame from '../IFrame'

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
								Search LymeMIND Commons by keyword
							</Typography>
						</Grid>
						<Grid xs={12} lg={6} md={7}>
							<img src="https://github.com/MaayanLab/lymemind-commons-schema/raw/master/Tutorial/images/search.png"
								alt="search" width={500}/> 
						</Grid>
						<Grid xs={12} lg={6}  md={5}>
							<Typography variant="body1">
							LymeMIND allows users to search for key terms including diseases, drug compounds, organism, or technology. You can exclude a term from your search by prefixing the excluded query with “-“ or “!”; combine search terms by prefixing the second term with “or” or “|”. Enter the term of inquiry within the textbox on the home page and hit “Search.” <br/><br/>
 							Clicking “search” without a term in the search box shows all datasets and projects. 
							</Typography>
						</Grid>
						
						
						<Grid xs={12} style={{marginTop: 20}}>
							<Typography variant="h5" gutterBottom>
								Browse LymeMIND Consortium members
							</Typography>
						</Grid>
						<Grid xs={12} lg={6} md={7}>
							<img src="https://github.com/MaayanLab/lymemind-commons-schema/raw/master/Tutorial/images/consortium.PNG"
								alt="consortium" width={500}/>
						</Grid>
						<Grid xs={12} lg={6} md={5}>
							<Typography variant="body1">
								LymeMIND Commons is powered by the innovation and research of consortium members from the Steven and Alexandra Cohen Foundation Lyme & Tickborne Disease Initiative. Users can view the list of members and explore their information.<br/><br/>
								From any page on the website, click the “Consortium” button on the top right of the page. The user is brought to a list of all active members of the LymeMIND consortium. Click on a lab or organization name to view their details and have direct access to information on their projects, including descriptions of the data and status of the project.
							</Typography>
						</Grid>

						<Grid xs={12} style={{marginTop: 20}}>
							<Typography variant="h5" gutterBottom>
								Finding and narrowing searches using filters
							</Typography>
						</Grid>
						<Grid xs={12} lg={6} md={7}>
							<img src="https://github.com/MaayanLab/lymemind-commons-schema/raw/master/Tutorial/images/filters.PNG"
								alt="filters" width={500}/>
						</Grid>
						<Grid xs={12} lg={6} md={5}>
							<Typography variant="body1">
								Multiple filters are present to allow you to narrow down your search results. Click a category from the dropdown on the left of the search results page. Check the box of any filter you wish to add, such as narrowing down the species or project type. You can add multiple filters to find the exact results you want. 
							</Typography>
						</Grid>

						<Grid xs={12} style={{marginTop: 20}}>
							<Typography variant="h5" gutterBottom>
								View and explore LymeMIND datasets
							</Typography>
						</Grid>
						<Grid xs={12} lg={6} md={7}>
							<img src="https://github.com/MaayanLab/lymemind-commons-schema/raw/master/Tutorial/images/dataset.PNG"
								alt="dataset" width={500}/>
						</Grid>
						<Grid xs={12} lg={6} md={5}>
							<Typography variant="body1">
								After searching and finding a dataset of interest, you can click the title name to be brought to the dataset’s download page on GEO, FigShare, or other hosts. The gray tags are clickable and launch a search of other datasets tagged with the selected term. Click the down-arrow to expand a menu detailing additional information about the dataset, including meta descriptions, data IDs, and citations. Not all datasets may contain the same information; it is dependent on the information provided by the data host or researcher.
							</Typography>
						</Grid>

						<Grid xs={12} style={{marginTop: 20}}>
							<Typography variant="h5" gutterBottom>
								View and explore LymeMIND projects
							</Typography>
						</Grid>
						<Grid xs={12} lg={6} md={7}>
							<img src="https://github.com/MaayanLab/lymemind-commons-schema/raw/master/Tutorial/images/project.PNG"
								alt="project" width={500}/>
						</Grid>
						<Grid xs={12} lg={6} md={5}>
							<Typography variant="body1">
								The default view after searching for a term is datasets; click the “Projects” tab at the top of the search results page to view projects matching your search. The gray tags are clickable and launch a search of other projects tagged with the selected term. Click the down-arrow to expand the project description page which includes information on the researchers, university or organization hosting the project, project category, a description about the project, a description about the data the project is generating, and whether the project is ongoing or complete.   
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