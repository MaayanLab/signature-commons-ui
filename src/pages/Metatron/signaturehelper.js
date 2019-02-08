import React from "react";
import { Filter,
         List,
         ReferenceInput,
         SelectInput } from 'react-admin';

export const PostFilter = (props) => (
      <Filter {...props}>
        <ReferenceInput label="Library"
                        source="library"
                        reference="libraries"
                        onChange={props.filterhandler}
                        perPage={props.libnum}
                        sort={{ field: 'id', order: 'ASC' }}
                        allowEmpty={false}
                        alwaysOn
                        >
          <SelectInput optionText="meta.Library_name"/>
        </ReferenceInput>
      </Filter>
  )
