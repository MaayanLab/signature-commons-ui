import {useState} from 'react'
import dynamic from 'next/dynamic'
const Grid = dynamic(()=> import('@material-ui/core/Grid'));
const Typography = dynamic(()=> import('@material-ui/core/Typography'));
const DownloadLinks = dynamic(()=> import('./DownloadLinks'));
const DownloadList = dynamic(()=> import('./DownloadList'));
const ResultsTab = dynamic(()=> import('../SearchComponents/ResultsTab'));

const DownloadsPage = ({
	resolver,
	download_list,
	download_links,
	preferred_name,
	schemas,
} ) => {
	
	return (
	<Grid container spacing={2} style={{margin: 10}}>
		<Grid item xs={11}>
			<DownloadLinks download_links={download_links}/>
		</Grid>
		{download_list.length > 0 ?
			<Grid item xs={12}>
				<Typography variant={"h5"}>
					Other Data Packages
				</Typography>
			</Grid>: null
		}

		{download_list.length > 0 ?
			<Grid item xs={12}>
				<DownloadList resolver={resolver}
					schemas={schemas}
					download_list={download_list}
					preferred_name={preferred_name} />
			</Grid>: null
		}
	</Grid>
  )
}

export default DownloadsPage