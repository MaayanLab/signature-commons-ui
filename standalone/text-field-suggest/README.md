# text-field-suggest
A standalone react component for text-field-sugges

PROPTYPES:
```
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
```