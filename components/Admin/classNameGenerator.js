// Fix for jss minification problemscaused by a different version of material-ui used in react-admin
// Fix is copied from https://github.com/marmelab/react-admin/issues/1782

const escapeRegex = /([[\].#*$><+~=|^:(),"'`\s])/g;
let classCounter = 0;

// Heavily inspired of Material UI:
// @see https://github.com/mui-org/material-ui/blob/9cf73828e523451de456ba3dbf2ab15f87cf8504/src/styles/createGenerateClassName.js
// The issue with the MUI function is that is create a new index for each
// new `withStyles`, so we handle have to write our own counter
export const generateClassName = (rule, styleSheet) => {
    classCounter += 1;

    if (process.env.NODE_ENV === 'production') {
        return `c${classCounter}`;
    }

    if (styleSheet && styleSheet.options.classNamePrefix) {
        let prefix = styleSheet.options.classNamePrefix;
        // Sanitize the string as will be used to prefix the generated class name.
        prefix = prefix.replace(escapeRegex, '-');

        if (prefix.match(/^Mui/)) {
            return `${prefix}-${rule.key}`;
        }

        return `${prefix}-${rule.key}-${classCounter}`;
    }

    return `${rule.key}-${classCounter}`;
};