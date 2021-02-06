import React from 'react'
import PropTypes from 'prop-types';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import {ChipInput} from './ChipInput'
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';
import grey from '@material-ui/core/colors/grey';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';

export const default_colors_and_icon = {
    "valid": {
        background: green[200],
        color: "#000",
        icon: "mdi-check-circle"
    },
    "suggestions": {
        background: amber[200],
        color: "#000",
        icon: "mdi-alert-decagram"
    },
    "invalid": {
        background: red[200],
        color: "#000",
        icon: "mdi-close-box"
    },
    "loading": {
        default: grey[300],
        color: "#000",
        icon: "mdi-loading mdi-spin"
    },
    "disabled": {
        default: grey[100],
        color: grey[600],
        icon: "mdi-label-off"
    }
}

export class TextFieldSuggest extends React.Component {

    defaultChipRenderer = (props) => {
        const {
            onSubmit,
            onAdd,
            onDelete,
            onClick,
            onSuggestionClick,
            colors_and_icon,
            input,
            field,
        } = props
        const children = input.map(value=>{
            const {background, color, icon} = colors_and_icon[value.type || "loading"]
            return(                
                <Grid item key={value.label}>
                    <Chip
                        avatar={<Avatar 
                                    style={{
                                        background,
                                    }}>
                                        <span className={`mdi ${icon} mdi-24px`} />
                                </Avatar>}
                        label={<span>{value.label}</span>}
                        style={{
                            background,
                            color,
                            maxWidth: 300,
                        }}
                        onDelete={()=>onDelete(value)}
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
                {children}
            </Grid>
        ) 
    }

    render = () => {
        const {
            input,
            onSubmit,
            onAdd,
            onDelete,
            onSuggestionClick,
            chipRenderer=this.defaultChipRenderer,
            colors_and_icon=default_colors_and_icon,
            chipInputProps={},
        } = this.props
        const rows = 15 - input.length
        return (
                <ChipInput 
							input={input}
							onSubmit={onSubmit}
                            onAdd={onAdd}
                            onDelete={onDelete}
                            chipRenderer={chipRenderer}
                            onSuggestionClick={onSuggestionClick}
                            colors_and_icon={colors_and_icon}
                            disableMagnify
                            ChipInputProps={{
								inputProps: {
                                    multiline: true,
                                    fullWidth: true,
                                    style: {
                                        width:"100%",
                                        background: "#f7f7f7",
                                        padding: 20,
										borderRadius: 25,
                                        overflow: "auto",
                                    },
                                    placeholder: input.length === 0 ? "Place your drug set here": "",
                                },
                                divProps: {
                                    style: {
										background: "#f7f7f7",
                                        marginTop: 10,
                                        borderRadius: 25,
                                        overflow: "auto",
                                        height: 350,
                                        flexFlow: 'column',
									}
                                }
                            }}
                            {...chipInputProps}
						/>
          )
    }
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