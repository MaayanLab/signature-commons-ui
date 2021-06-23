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
	const [tab, changeTab] = useState({...download_list[0]})
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
		
		{download_list.length > 1 ?
			<Grid item xs={12} align="center">
				<ResultsTab 
					tabs={download_list.map(value=>({...value, label: preferred_name[value.model]}))}
					value={tab.label}
					handleChange={changeTab}
					tabsProps={{centered: true}}
				/>
			</Grid>:null
		}

		{download_list.length > 0 ?
			<Grid item xs={12}>
				<DownloadList resolver={resolver} schemas={schemas} tab={tab} />
			</Grid>: null
		}
	</Grid>
  )
}

export default DownloadsPage