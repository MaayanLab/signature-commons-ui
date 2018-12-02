import React from "react";

export class Footer extends React.Component {
  render() {
    return (
    <footer className="page-footer grey lighten-3 black-text">
      <div className="container">
        <div className="row">
          <div className="col m5 s12">
            <img src="https://amp.pharm.mssm.edu/enrichmentapi/images/mountsinai.png" alt="Icahn School of Medicine at Mount Sinai, Center for Bioinformatics" height="130" />
          </div>
          <div className="col m5 s12">
            <ul style={{paddingLeft: '30px', listStyle: 'none', textAlign: 'left'}}>
              <li className="fl"><a href="http://icahn.mssm.edu/research/labs/maayan-laboratory" target="_blank" rel="noopener noreferrer">The Ma'ayan Lab</a></li>
              <li className="fl"><a href="http://www.lincs-dcic.org/" target="_blank" rel="noopener noreferrer">BD2K-LINCS Data Coordination and Integration Center (DCIC)</a></li>
              <li className="fl"><a href="http://www.lincsproject.org/">NIH LINCS program</a></li>
              <li className="fl"><a href="https://commonfund.nih.gov/commons">NIH Data Commons Pilot Project Consortium (DCPPC)</a></li>
              <li className="fl"><a href="http://bd2k.nih.gov/" target="_blank" rel="noopener noreferrer">NIH Big Data to Knowledge (BD2K)</a></li>
              <li className="fl"><a href="https://commonfund.nih.gov/idg/index" target="_blank" rel="noopener noreferrer">NIH Illuminating the Druggable Genome (IDG) Program</a></li>
              <li className="fl"><a href="http://icahn.mssm.edu/" target="_blank" rel="noopener noreferrer">Icahn School of Medicine at Mount Sinai</a></li>
            </ul>
            <ul style={{paddingLeft: '30px', listStyle: 'none', textAlign: 'left'}}>
              <li className="fl"><a href="http://petstore.swagger.io/?url=http://amp.pharm.mssm.edu/signature-commons-metadata-api/openapi.json" target="_blank" rel="noopener noreferrer">Metadata API Documentation</a></li>
              {/* <li className="fl"><a href="http://petstore.swagger.io/?url=http://amp.pharm.mssm.edu/enrichmentapi/swagger.json" target="_blank" rel="noopener noreferrer">Data API Documentation</a></li> */}
            </ul>
          </div>
          <div className="col m2 s12">
            <img src="https://amp.pharm.mssm.edu/enrichmentapi/images/dcic.png" alt="BD2K-LINCS Data Coordination and Integration Center" height="130" /><br />
            © Ma'ayan Lab.
          </div>
        </div>
      </div>
    </footer>
    )
  }
}

