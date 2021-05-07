import {useState} from 'react'
import dynamic from 'next/dynamic'
const Grid = dynamic(()=> import('@material-ui/core/Grid'));
const Typography = dynamic(()=> import('@material-ui/core/Typography'));
const DownloadLinks = dynamic(()=> import('./DownloadLinks'));
const DownloadList = dynamic(()=> import('./DownloadList'));
const ResultsTab = dynamic(()=> import('../MetadataPage/ResultsTab'));

const DownloadsPage = ({
	resolver,
	download_tables,
	download_links,
	preferred_name,
	schemas,
} ) => {
	const [tab, changeTab] = useState(download_tables[0])
	return (
	<Grid container spacing={2} style={{margin: 10}}>
		<Grid item xs={12}>
		<Typography variant={"h4"}>
			Downloads
		</Typography>
		</Grid>
		<Grid item xs={12} md={10}>
			<DownloadLinks download_links={download_links}/>
		</Grid>
		{download_tables.length > 1 ?
			<Grid item xs={12} md={10} align="center">
				<ResultsTab 
					tabs={download_tables.map(value=>({value, label: preferred_name[value]}))}
					value={tab}
					handleChange={changeTab}
					tabsProps={{centered: true}}
				/>
			</Grid>:null
		}
		<Grid item xs={12} md={10}>
			<Typography variant={"h5"}>
				Download {preferred_name[tab]}
			</Typography>
		</Grid>
		<Grid item xs={12} md={10}>

			<DownloadList resolver={resolver} schemas={schemas} model={tab}/>
		</Grid>
	</Grid>
  )
}

export default DownloadsPage