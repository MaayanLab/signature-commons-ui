import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types'
import { withRouter } from "react-router";
import {enrich_gene_coexpression, get_gene_names} from './util'
import dynamic from 'next/dynamic'
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme, makeStyles } from '@material-ui/core/styles';
import { VariableSizeList } from 'react-window';

const ListSubheader = dynamic(()=>import('@material-ui/core/ListSubheader'))
const Grid = dynamic(()=>import('@material-ui/core/Grid'))
const Typography = dynamic(()=>import('@material-ui/core/Typography'))
const TextField = dynamic(()=>import('@material-ui/core/TextField'))
const Button = dynamic(()=>import('@material-ui/core/Button'))
const CircularProgress = dynamic(()=>import('@material-ui/core/CircularProgress'))
const Autocomplete = dynamic(()=>import('@material-ui/lab/Autocomplete'))

const useStyles = makeStyles((theme) => ({
	input: {
		fontSize: 12,
		height: 40,
		width: 300,
		marginLeft: 10,
	},
	textfield: {
		width: 300,
		background: "#f7f7f7",
		borderRadius: 15,
	},
	buttonProgress: {
	  position: 'absolute',
	  top: '50%',
	  left: '80%',
	  marginTop: -12,
	  marginLeft: -12,
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
		location
	} = props

	const [gene, setGene] = useState(null)
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
				<Typography variant="body2">
					Gene Co-Expression Signature Search
				</Typography>
				<Typography variant="caption">
					Convert a single gene to an input signature based on co-expression correlations.
				</Typography>
			</Grid>
			<Grid item xs={12}>
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
					renderInput={(params) => (
						<div
							style={{
								margin: "auto",
								position: 'relative',
							}}
						>
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
										width: 300,
										marginLeft: 10,
									}
								}}
								style={{
									width: 300,
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
							{gene !== null && <CircularProgress size={24} className={classes.buttonProgress} />}
						</div>
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