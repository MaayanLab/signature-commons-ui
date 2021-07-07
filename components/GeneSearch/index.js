import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types'
import { withRouter } from "react-router";
import {get_coexpressed_genes,
	resolve_genes,
	enrichment,
	get_gene_names,
	get_gene_id} from './util'
import dynamic from 'next/dynamic'
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme, makeStyles } from '@material-ui/core/styles';
import { VariableSizeList } from 'react-window';
import { useWidth } from '../../util/ui/useWidth'

const ListSubheader = dynamic(()=>import('@material-ui/core/ListSubheader'))
const Box = dynamic(()=>import('@material-ui/core/Box'))
const Grid = dynamic(()=>import('@material-ui/core/Grid'))
const Typography = dynamic(()=>import('@material-ui/core/Typography'))
const TextField = dynamic(()=>import('@material-ui/core/TextField'))
const Button = dynamic(()=>import('@material-ui/core/Button'))
const CircularProgress = dynamic(()=>import('@material-ui/core/CircularProgress'))
const Autocomplete = dynamic(()=>import('@material-ui/lab/Autocomplete'))
const RadioButtons = dynamic(async () => (await import('../RadioButtons')).RadioButtons);

const useStyles = makeStyles((theme) => ({
	input: {
		fontSize: 12,
		height: 40,
		width: 320,
		marginLeft: 10,
		marginLeft: 20
	},
	textfield: {
		width: 320,
		background: "#f7f7f7",
		borderRadius: 15,
	}
  }));

// From Material UI
const LISTBOX_PADDING = 8; // px

function renderRow(props) {
  const { data, index, style } = props;
  return React.cloneElement(data[index], {
    style: {
      ...style,
      top: style.top + LISTBOX_PADDING,
	  fontSize: 12
    },
  });
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data) {
  const ref = React.useRef(null);
  useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

// Adapter for react-window
const ListboxComponent = React.forwardRef(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData = React.Children.toArray(children.slice(0,200));
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true });
  const itemCount = itemData.length;
  const itemSize = smUp ? 36 : 48;

  const getChildSize = (child) => {
    if (React.isValidElement(child) && child.type === ListSubheader) {
      return 48;
    }

    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

ListboxComponent.propTypes = {
  children: PropTypes.node,
};

// End

export const GeneSearch = (props) => {
	const {
		resolver,
		schemas,
		history,
		location,
		ui_values,
	} = props

	const examples = ["STAT3", "MAPK1", "ZNF830"]
	const radio_values = [
		{
			label: "Gene Co-Expression Signature Search",
			sublabel: "Convert a single gene to an input signature based on co-expression correlations.",
			value: "coexpression"
		},
		{
			label: "Metadata Search",
			sublabel: "Find signatures where a single gene was perturbed.",
			value: "metadata"
		},
		{
			label: "Up or Down-Regulate My Gene",
			sublabel: "Find L1000 Signatures that maximally up or down-regulate the queried gene.",
			value: "regulate"
		},
	]

	const [gene, setGene] = useState(null)
	const [message, setMessage] = useState(null)
	const [radio, setRadio] = useState("coexpression")
	const [input_gene, setInputGene] = useState("")
	const [options, setOptions] = useState([])
	const classes = useStyles()
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
		const coexpression = async () => {
			setMessage("Fetching coexpressed genes...")
			const coexpressed_genes = await get_coexpressed_genes({gene})
			setMessage("Resolving gene names...")
			const {input, query} = await resolve_genes({coexpressed_genes, schemas, resolver})
			setMessage("Performing Enrichment Analysis...")
			const enrichment_id = await enrichment({resolver, input, query})
			history.push({
				pathname: `${location.pathname}/${enrichment_id}`
			})
		}
		const metadata_search = () => {
			const {nav, preferred_name} = ui_values
			const metadata_url = `${nav.MetadataSearch.endpoint}/${preferred_name.signatures}`
			history.push({
				pathname: metadata_url,
				search: `?query=${JSON.stringify({search: [gene]})}`,
			  })
		}
		const gene_page = async () => {
			const {nav, preferred_name} = ui_values
			const uid = await get_gene_id({gene, resolver, schemas})
			const metapage = `/${preferred_name.entities}/${uid}`
			if ((nav.MetadataSearch.props.metadata_page.entities || {}).query !== undefined) {
				history.push({
					pathname: metapage,
					search: nav.MetadataSearch.props.metadata_page.entities.query
				})
			} else {
				history.push({
					pathname: metapage
				})
			}
			
		}
		if (gene!==null){
			if (radio === "coexpression") coexpression()
			else if (radio === "metadata") metadata_search()
			else gene_page()
		}
	}, [gene])

	const keyPress = (e) => {
		if(e.keyCode == 13){
			setGene(e.target.value);
		   // put the login here
		}
	 }
	const width = useWidth()
	return (
		<Grid container spacing={2}>
			<Grid item xs={12} style={{marginTop: 10}} align="center">
				<Autocomplete
					open={input_gene !== "" && gene === null}
					options={options}
					ListboxComponent={ListboxComponent}
					inputValue={input_gene}
					onInputChange={(event, newInputValue) => {
						setInputGene(newInputValue);
					}}
					value={gene}
					onChange={(event, newValue)=>setGene(newValue)}
					size="small"
					popupIcon={null}
					noOptionsText={<Typography variant="caption">No results</Typography>}
					renderInput={(params) => (
						<Box align={width==="xl" ? "left": "center"}>
							<TextField 
								{...params}
								placeholder="Enter gene symbol"
								onKeyDown={keyPress}
								className={classes.textfield}
								size="small"
								InputProps={{
									...params.InputProps,
									disableUnderline: true,
									classes: {
										input: classes.input,
										// notchedOutline: textFieldStyles.notchedOutline
									},
									endAdornment: null,
									style: {
										fontSize: 12,
										height: 50,
										width: 350,
									}
								}}
								style={{
									width: 320,
									background: "#f7f7f7",
									borderRadius: 15,
								}}
							/>
							<Button variant="contained"
								size="large"
								color="primary"
								disabled={input_gene === "" || gene !== null}
								onClick={()=>setGene(input_gene)}
								style={{height: 50, marginLeft: 5, textTransform: "none"}}
							>
								{gene === null ? 'Search': 'Searching...'}
							</Button>
							<Typography align="center" style={{height:30, width: 320}}>
								{examples.map((v,i)=>(
									<React.Fragment>
										<Button variant="text" color="primary" style={{textTransform: "none"}} onClick={()=>{
											setGene(v)
										}}>
											<Typography variant="subtitle2">{v}</Typography>
										</Button>
										{i === examples.length - 1 ? null: "/"}
									</React.Fragment>
								))}
							</Typography>
						</Box>
					)}
				/>			
			</Grid>
			<Grid item xs={12} style={{height: 25}} align="left">
			{gene !== null && <Typography variant="subtitles2"><CircularProgress size={16}/> {message}</Typography>}
			</Grid>
			<Grid item xs={12} align="left">
				<RadioButtons
					value={radio}
					values={radio_values}
					handleChange={e=>setRadio(e.target.value)}
					FormProps={{
						style: {
							marginBottom: 15,
						}
					}}
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