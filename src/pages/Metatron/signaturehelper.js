import React from "react";
import { Filter,
         List,
         ReferenceInput,
         SelectInput } from 'react-admin';
import { withStyles, spacing } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';

const styles = {
    avatar: {
      margin: 5,
      width: 25,
      height: 25,
    },
    library: {
      width: 200,
    },
    Description: {
      width: 300,
    },
    icon: {
      width: 15,
      height: 15,
    },
};

export const PostFilter = (props) => (
      <Filter {...props}>
        <ReferenceInput label="Library"
                        source="library"
                        reference="libraries"
                        perPage={props.libnum}
                        sort={{ field: 'id', order: 'ASC' }}
                        allowEmpty={false}
                        alwaysOn
                        >
          <SelectInput optionText="meta.Library_name"/>
        </ReferenceInput>
      </Filter>
  )

const ImageAvatar = withStyles(styles)(({ classes, ...props }) => (
    <Avatar alt={props.record.meta.Library_name} src={props.record.meta.Icon} className={classes.avatar} mx="auto"/>
));

export const LibraryAvatar = withStyles(styles)(({ classes, record={}, ...props }) => (
  <Chip
        avatar={
          <Avatar>
            <ImageAvatar record={record} />
          </Avatar>
        }
        label={record.meta.Library_name}
        className={classes.chip}
  />
))
LibraryAvatar.defaultProps = { label: 'Library' };

export const Description = withStyles(styles)(({ classes, record={}, ...props }) => (
  <p className={classes.Description}>{record.meta.Description}</p>
))
Description.defaultProps = { label: 'Description' };

function Chips(classes, record,  props){
  const chips = record.meta[props.field].split(";").map((val)=>(
    <Chip
        key={val}
        label={val}
        className={classes.chip}
    />
  ))
  return chips
}

export const SplitChip = withStyles(styles)(({ classes, record={}, ...props }) => (
  Chips(classes, record, props)
))

export const TagsField = withStyles(styles)(function({ classes, record={}, ...props }){
    const chips = props.field in record.meta ? record.meta[props.field].map((val)=>(
      <Chip
          key={val}
          label={val}
          className={classes.chip}
      />
    )) : null
    return chips
})
TagsField.defaultProps = { addLabel: true };

export const BooleanField = withStyles(styles)( function({ classes, record={}, ...props }){
  if(record.meta[props.field] === props.TrueValue){
    return(<CheckIcon className={classes.icon}/>)
  } else{
    return(<CloseIcon className={classes.icon}/>)
  }
})