import {useState, useEffect} from 'react';
import PropTypes from 'prop-types'
import { withRouter } from "react-router";
import {enrich_gene_coexpression} from './util'
import dynamic from 'next/dynamic'

const Grid = dynamic(()=>import('@material-ui/core/Grid'))
const Typography = dynamic(()=>import('@material-ui/core/Typography'))
const TextField = dynamic(()=>import('@material-ui/core/TextField'))
const Button = dynamic(()=>import('@material-ui/core/Button'))

export const GeneSearch = (props) => {
	const {
		resolver,
		schemas,
		history,
		endpoint,
		match,
		location
	} = props

	const [gene, setGene] = useState(null)
	const [input_gene, setInputGene] = useState("")

	useEffect(()=>{
		const enrichment = async () => {
			const enrichment_id = await enrich_gene_coexpression({resolver, schemas, gene})
			history.push({
				pathname: `${location.pathname}/${enrichment_id}`
			})
		}
		if (gene!==null){
			enrichment()
		}
	}, [gene])

	const keyPress = (e) => {
		if(e.keyCode == 13){
			setGene(e.target.value);
		   // put the login here
		}
	 }

	return (
		<Grid container align="left" spacing={2}>
			<Grid item xs={12}>
				<Typography variant="h5">
					ARCHS4 Coexpression
				</Typography>
				<Typography variant="body1">
					Perform signature search on a gene using it's top correlated and anti-correlated genes.
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<TextField label="Enter gene symbol"
					variant="outlined"
					value={input_gene}
					onKeyDown={keyPress}
					onChange={e=>setInputGene(e.target.value)}/>
				<Button variant="contained"
						size="large"
						color="primary"
						disabled={input_gene === "" || gene !== null}
						onClick={()=>setGene(input_gene)}
						style={{height: "100%", marginLeft: 5}}
				>
					{gene === null ? 'Search': 'Searching...'}
				</Button>
			</Grid>
		</Grid>
	)
}

GeneSearch.propTypes = {
	gene: PropTypes.string,
	resolver: PropTypes.object,
}

export default withRouter(GeneSearch)