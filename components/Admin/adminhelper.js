import React from 'react'
import { Filter,
  ReferenceInput,
  SelectInput,
  TextInput } from 'react-admin'
import { withStyles } from '@material-ui/core/styles'
import Avatar from '@material-ui/core/Avatar'
import Chip from '@material-ui/core/Chip'
import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'

const styles = {
  avatar: {
    margin: 5,
    width: 25,
    height: 25,
  },
  library: {
    width: 200,
  },
  LongString: {
    width: 300,
  },
  icon: {
    width: 15,
    height: 15,
  },
}

export const SignaturePostFilter = (props) => (
  <Filter {...props}>
    <ReferenceInput label="Library"
      source="library"
      reference="libraries"
      perPage={props.librarynumber}
      sort={{ field: `meta.${props.library_name}`, order: 'ASC' }}
      allowEmpty={false}
      alwaysOn
    >
      <SelectInput optionText={`meta.${props.library_name}`}/>
    </ReferenceInput>
    <TextInput label="Search" source="meta.fullTextSearch" alwaysOn />
  </Filter>
)

export const FullTextFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="meta.fullTextSearch" alwaysOn />
  </Filter>
)

const ImageAvatar = withStyles(styles)(({ classes, ...props }) => (
  <Avatar alt={props.record.meta[props.library_name]} src={`${process.env.PREFIX}/${props.record.meta.Icon}`} className={classes.avatar} mx="auto"/>
))

export const LibraryAvatar = withStyles(styles)(({ classes, record = {}, ...props }) => (
  <Chip
    avatar={
      <Avatar>
        <ImageAvatar record={record} library_name={props.library_name}/>
      </Avatar>
    }
    label={record.meta[props.library_name]}
    className={classes.chip}
  />
))
LibraryAvatar.defaultProps = { label: 'Library' }


export const Description = withStyles(styles)(({ classes, record = {}, ...props }) => (
  <p className={classes.LongString}>{record.meta.Description}</p>
))
Description.defaultProps = { label: 'Description' }

function Chips(classes, record, props) {
  const chips = record.meta[props.field].split(';').map((val) => (
    <Chip
      key={val}
      label={val}
      className={classes.chip}
    />
  ))
  return chips
}

export const SplitChip = withStyles(styles)(({ classes, record = {}, ...props }) => (
  Chips(classes, record, props)
))


export const TagsField = withStyles(styles)(function({ classes, record = {}, ...props }) {
  const chips = props.field in record.meta ? record.meta[props.field].map((val) => (
    <Chip
      key={val}
      label={val}
      className={classes.chip}
    />
  )) : null
  return chips
})
TagsField.defaultProps = { addLabel: true }

export const NameAccField = withStyles(styles)(function({ classes, record = {}, ...props }) {
  const name = record.meta[props.field].Name
  const acc = record.meta[props.field].Accession
  const val = `${acc} (${name})`
  return (
    <Chip
      key={val}
      label={val}
      className={classes.chip}
    />
  )
})
NameAccField.defaultProps = { addLabel: true }

export const BooleanField = withStyles(styles)(function({ classes, record = {}, ...props }) {
  if (record.meta[props.field] === props.TrueValue) {
    return (<CheckIcon className={classes.icon}/>)
  } else {
    return (<CloseIcon className={classes.icon}/>)
  }
})

function checkURL(url) {
  const url_regex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)? (\/|\/([\w#!:.?+=&%@!\-\/]))?/
  return url_regex.test(url)
}

const RecursiveDisplay = withStyles(styles)(({ classes, value, field, ...props }) => {
  if (typeof value[field] === 'string') {
    if (checkURL(value[field])) {
      return (
        <a href={value[field]}>{value[field]}</a>
      )
    } else if (value[field].length > 50) { // Long string
      return (
        <div>
          <p className={classes.LongString}>{value[field]}</p>
        </div>
      )
    } else {
      return (
        <div>
          <span>{value[field]}</span>
        </div>
      )
    }
  } else if (typeof value[field] === 'number') {
    return (
      <span>{value[field]}</span>
    )
  } else if (typeof value[field] === 'boolean') {
    if (value[field] === true) {
      return (<CheckIcon className={classes.icon}/>)
    } else {
      return (<CloseIcon className={classes.icon}/>)
    }
  } else if (Array.isArray(value[field])) {
    return (
      <div>
        {value[field].map((item) => (
          <RecursiveDisplay
            key={item}
            value={{ [field]: item }}
            field={field}
            {...props}
          />
        ))}
      </div>
    )
  } else if (typeof value[field] === 'object') {
    return (
      <div>
        {Object.keys(value[field]).map((key) => (
          <div key={`${key}`}>
            <RecursiveDisplay
              value={{ label: `${key}: ` }}
              field={'label'}
              {...props}
            />
            <RecursiveDisplay
              value={value[field]}
              field={key}
              {...props}
            />
          </div>
        ))}
      </div>
    )
  } else {
    return null
  }
})

export const DisplayField = withStyles(styles)(({ classes, record = {}, ...props }) => {
  const { field } = props
  return (<RecursiveDisplay
    value={record.meta}
    field={field}
    {...props}
  />)
})
