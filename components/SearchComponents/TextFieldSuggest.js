import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types';
import { Set } from 'immutable'
import dynamic from 'next/dynamic'
import { makeStyles } from '@material-ui/core/styles';

const Chip = dynamic(()=>import('@material-ui/core/Chip'));
const Avatar = dynamic(()=>import('@material-ui/core/Avatar'));
const Typography = dynamic(()=>import('@material-ui/core/Typography'));
const Grid = dynamic(()=>import('@material-ui/core/Grid'));
const Link = dynamic(()=>import('@material-ui/core/Link'));
const Switch = dynamic(()=>import('@material-ui/core/Switch'));
const FormControlLabel = dynamic(()=>import('@material-ui/core/FormControlLabel'));
const ChipInput = dynamic(()=>import('./ChipInput'));

const useStyles = makeStyles((theme) => ({
    div: {
        background: "#f7f7f7",
        marginTop: 10,
        borderRadius: 25,
        overflow: "auto",
        // height: 350,
        flexFlow: 'column',
        height: 210,
        [theme.breakpoints.only('xl')]: {
            height: 250,
        }
    },
}));
  


export const default_colors_and_icon = {
    "valid": {
        default: "#e0e0e0",
        color: "#000",
        icon: "mdi-check-circle"
    },
    "suggestions": {
        background: "#ffe082",
        color: "#000",
        icon: "mdi-alert-decagram"
    },
    "invalid": {
        background: "#ef9a9a",
        color: "#000",
        icon: "mdi-close-box"
    },
    "loading": {
        default: "#e0e0e0",
        color: "#000",
        icon: "mdi-loading mdi-spin"
    },
    "disabled": {
        default: "#f5f5f5",
        color: "#757575",
        icon: "mdi-label-off"
    }
}

const chipRenderer = ({
    onDelete,
    onClick,
    onSuggestionClick,
    objectInput: input,
    toggleValidate,
    validate,
}) => {
    const children = input.map(value=>{
        const {background, color, icon} = default_colors_and_icon[value.type || "loading"]
        return(                
            <Grid item key={value.label}>
                <Chip
                    size="small"
                    avatar={<Avatar 
                                style={{
                                    background,
                                }}>
                                    <span className={`mdi ${icon} mdi-18px`} />
                            </Avatar>}
                    label={<span style={{fontSize: 10}}>{value.label}</span>}
                    style={{
                        background,
                        color,
                        maxWidth: 300,
                        marginTop: 2,
                    }}
                    onDelete={()=>onDelete(value.label)}
                    onClick={onClick}
                    />
                { value.type!=="suggestions" ? null:
                    <div style={{textAlign:"left"}}>
                        <Typography variant="overline">
                            Did you mean:
                        </Typography>
                        { value.suggestions.map(s=>(
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        onSuggestionClick(value, s)}
                                    }
                                    key={s.label}
                                    style={{display: 'block'}}
                                >
                                    {s.label}
                                </Link>
                        ))}
                    </div>
                }
            </Grid>
        )
    })
    return(
        <Grid
            container
            direction="column"
        >
            { input.length > 0 ?
                <Grid item xs={12}>
                    <FormControlLabel 
                        style={{marginTop: -10}}
                        control={<Switch checked={validate} onChange={toggleValidate} name="validate" color="primary" size="small"/>}
                        label={<Typography variant="subtitle2">Validate</Typography>}
                    />
                </Grid>
                : null}
            {validate ? children: null}
        </Grid>
    ) 
}

const TextFieldSuggest = (props) => {
    const {
        input,
        onSubmit,
        onAdd,
        onDelete,
        onSuggestionClick,
        colors_and_icon=default_colors_and_icon,
        chipInputProps={},
        endAdornment,
        placeholder="",
    } = props
    const [validate, setValidate] = useState(false)
    const [value, setValue] = useState("")

    const classes = useStyles()

    useEffect(()=>{
        if (validate) {
            setValue("")
        } else {
            setValue(input.map(i=>i.label).join("\n"))
        }
    },[validate])

    useEffect(()=>{
        if (!validate) {
            const val = Set(value.trim().split(/[\t\r\n;]+/))
            const input_val = Set(input.map(i=>i.label))
            
            if (val.intersect(input_val).size !== val.size) {
                setValue(input.map(i=>i.label).join("\n"))
            }
        }
    },[input])

    useEffect(()=>{
        if (!validate){
            const new_val = Set(value.trim().split(/[\t\r\n;]+/))
            const old_val = Set(input.map(i=>i.label))
            // For deletion
            if (!validate){
                const sub_values = old_val.subtract(new_val).toArray().join("\n")
                if (sub_values.trim() !== "") {
                    onDelete(sub_values)
                }
            }
            
            // for addition
            const add_values = new_val.subtract(old_val).toArray().join("\n")
            if (add_values.trim() !== "") {
            onSubmit(add_values)
            }
        }
    }, [value])

    // const values = input.map(i=>i.label)

    const textFieldSubmit = (val) => {
        if (validate) {
            onSubmit(val)
            setValue("")
        } else {
            setValue(val)
        }
    }
    const toggleValidate = () => {
        setValidate(!validate)
    }
    
    // input.map(i=>i.label).join("\n")
    return (
        <ChipInput 
            input={input.map(i=>i.label)}
            propsValue={value}
            setPropsValue={setValue}
            onSubmit={textFieldSubmit}
            onAdd={onAdd}
            onDelete={onDelete}
            chipRenderer={(props)=>chipRenderer({...props, objectInput: input, validate, toggleValidate})}
            onSuggestionClick={onSuggestionClick}
            colors_and_icon={colors_and_icon}
            unChipOnFocus={true}
            disableMagnify
            endAdornment={endAdornment}
            ChipInputProps={{
                inputProps: {
                    multiline: true,
                    fullWidth: true,
                    style: {
                        width:"100%",
                        background: "#f7f7f7",
                        padding: 20,
                        borderRadius: 25,
                        overflow: "visible",
                    },
                    placeholder: input.length === 0 ? placeholder: "",
                },
                divProps: {
                    className: classes.div,
                    style: {
                        flexFlow: 'column',
                    }
                }
            }}
            {...chipInputProps}
        />
  )
}

TextFieldSuggest.propTypes = {
    input: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        type: PropTypes.oneOf(["valid", "suggestions", "invalid", "loading", "disabled"]),
        id: PropTypes.arrayOf(PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
          ])),
        suggestions: PropTypes.arrayOf(PropTypes.shape({
            label: PropTypes.string.isRequired,
            type: PropTypes.oneOf(["valid", "suggestions", "invalid", "loading", "disabled"]),
            id: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
              ]),     
        })),
        endAdornment: PropTypes.node,
        gridColumnProps: PropTypes.object,
        gridRowProps: PropTypes.object,
        avatarProps: PropTypes.object,
        labelProps: PropTypes.object,
        chipProps: PropTypes.object,
        suggestionsProps: PropTypes.object,
    })).isRequired,
    onSubmit: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onClick: PropTypes.func,
    onSuggestionClick: PropTypes.func.isRequired,
    renderChip: PropTypes.func,
    colors_and_icon: PropTypes.shape({
        background: PropTypes.string,
        color: PropTypes.string,
        icon: PropTypes.string
    }),
    placeholder: PropTypes.string,
    gridColumnProps: PropTypes.object,
    gridRowProps: PropTypes.object,
    avatarProps: PropTypes.object,
    labelProps: PropTypes.object,
    chipProps: PropTypes.object,
    chipInputProps: PropTypes.object,
    formProps: PropTypes.object,
    suggestionsProps: PropTypes.object,
}

export default TextFieldSuggest