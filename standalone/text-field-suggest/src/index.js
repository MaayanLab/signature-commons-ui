import React from 'react'
import PropTypes from 'prop-types';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import ChipInput from 'material-ui-chip-input'
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

export default class TextFieldSuggest extends React.Component {

    defaultChipRenderer = (props, key) => {
        const {
            value,
            isDisabled,
            className,
            handleDelete,
            handleClick
          } = props
        const {
            gridColumnProps,
            gridRowProps,
            avatarProps,
            labelProps,
            chipProps,
            suggestionsProps,
            onSuggestionClick,
        } = this.props
        const colors_and_icon = this.props.colors_and_icon || default_colors_and_icon
        const {background, color, icon} = colors_and_icon[value.type || "loading"]
        return(
            <Grid
                container
                direction="column"
                justify="flex-start"
                alignItems="flex-start"
                key={key}
                {...gridColumnProps}
                {...value.gridColumnProps}
            >
                <Grid item xs={12}
                    {...gridRowProps}
                    {...value.gridRowProps}
                >
                    <Chip
                        avatar={<Avatar className={`mdi ${icon} mdi-24px`}
                                        style={{
                                            background,
                                        }}
                                        {...avatarProps}
                                        {...value.avatarProps}/>}
                        label={<span {...labelProps} {...value.labelProps}>{value.label}</span>}
                        style={{
                            background,
                            color,
                            pointerEvents: isDisabled ? 'none' : undefined,
                        }}
                        onDelete={handleDelete}
                        onClick={handleClick}
                        className={className}
                        {...chipProps}
                        {...value.chipProps}
                        />
                    { value.type!=="suggestions" ? null:
                        <React.Fragment>
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
                                        {...suggestionsProps}
                                        {...value.suggestionsProps}
                                    >
                                        {s.label}
                                    </Link>
                            ))}
                        </React.Fragment>
                    }
                </Grid>
            </Grid>
        )
    }

    render = () => {
        const {
            onAdd,
            onDelete,
            onClick,
            onSubmit,
            formProps,
            chipInputProps,
            placeholder
        } = this.props
        return (
            <form onSubmit={onSubmit} {...formProps}>
                <ChipInput defaultValue={['foo', 'bar']}
                  style={{width:200,
                    height:300,
                    overflow: 'scroll',
                    background: "#f7f7f7",
                    padding: 10,
                  }}
                  value={this.props.input || []}
                  onAdd={onAdd}
                  onDelete={onDelete}
                  onClick={onClick}
                  chipRenderer={this.props.chipRenderer || this.defaultChipRenderer}
                  disableUnderline
                  fullWidthInput
                  placeholder={placeholder}
                  InputProps={{
                    multiline: true
                  }}
                  {...chipInputProps}
                  />
            </form>
          )
    }
}

TextFieldSuggest.propTypes = {
    input: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        type: PropTypes.oneOf(["valid", "suggestions", "invalid", "loading", "disabled"]),
        id: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
          ]),
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
    onClick: PropTypes.func.isRequired,
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