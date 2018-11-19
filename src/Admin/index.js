import React from "react";
import { Admin, Resource, ListGuesser } from 'react-admin';
import loopbackProvider from './loopback-provider'

const base_url = 'http://amp.pharm.mssm.edu/signature-commons-metadata-api';
const dataProvider = loopbackProvider(base_url);

const AdminView = () => (
  <Admin dataProvider={dataProvider}>
      <Resource name="libraries" list={ListGuesser} />
      <Resource name="signatures" list={ListGuesser} />
      <Resource name="entities" list={ListGuesser} />
  </Admin>
);

export default AdminView
