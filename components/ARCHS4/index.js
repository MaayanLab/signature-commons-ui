import {useState, useEffect} from 'react';
import PropTypes from 'prop-types'
import { withRouter } from "react-router";
import {enrich_gene_coexpression, get_gene_names} from './util'
import dynamic from 'next/dynamic'
import React from 'react';

const Grid = dynamic(()=>import('@material-ui/core/Grid'))
const Typography = dynamic(()=>import('@material-ui/core/Typography'))
const TextField = dynamic(()=>import('@material-ui/core/TextField'))
const Button = dynamic(()=>import('@material-ui/core/Button'))
const Autocomplete = dynamic(()=>import('@material-ui/lab/Autocomplete'))

export const GeneSearch = (props) => {
	const {
		resolver,
		schemas,
		history,
		location
	} = props

	const [gene, setGene] = useState(null)
	const [input_gene, setInputGene] = useState("")
	const [options, setOptions] = useState([])

	useEffect(()=>{
		const get_options = async () => {
			if (options.length===0){
				const genes = await get_gene_names()
				setOptions(genes)
			}
		}
		get_options()
	})
	
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
				<Autocomplete
					options={options}
					renderInput={(params) => (
						<React.Fragment>
							<TextField 
								{...params}
								label="Enter gene symbol"
								variant="outlined"
								value={input_gene}
								onKeyDown={keyPress}
								onChange={e=>setInputGene(e.target.value)}
								style={{ width: 300 }}
							/>
							<Button variant="contained"
								size="large"
								color="primary"
								disabled={input_gene === "" || gene !== null}
								onClick={()=>setGene(input_gene)}
								style={{height: 55, marginLeft: 5}}
							>
								{gene === null ? 'Search': 'Searching...'}
							</Button>
						</React.Fragment>
					)}
				/>			
			</Grid>
		</Grid>
	)
}

GeneSearch.propTypes = {
	gene: PropTypes.string,
	resolver: PropTypes.object,
}

export default withRouter(GeneSearch)