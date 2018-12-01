import React from "react";

export class Footer extends React.Component {
  render() {
    return (
    <footer className="page-footer grey lighten-5 black-text">
      <div className="container">
        <div className="row">
          <div className="col m5 s12">
            <img src="https://amp.pharm.mssm.edu/enrichmentapi/images/mountsinai.png" height="130" />
          </div>
          <div className="col m5 s12">
            <ul style={{paddingLeft: '30px', listStyle: 'none', textAlign: 'left'}}>
              <li class="fl"><a href="http://icahn.mssm.edu/research/labs/maayan-laboratory" target="_blank">The Ma'ayan Lab</a></li>
              <li class="fl"><a href="http://www.lincs-dcic.org/" target="_blank">BD2K-LINCS Data Coordination and Integration Center (DCIC)</a></li>
              <li class="fl"><a href="http://www.lincsproject.org/">NIH LINCS program</a></li>
              <li class="fl"><a href="https://commonfund.nih.gov/commons">NIH Data Commons Pilot Project Consortium (DCPPC)</a></li>
              <li class="fl"><a href="http://bd2k.nih.gov/" target="_blank">NIH Big Data to Knowledge (BD2K)</a></li>
              <li class="fl"><a href="https://commonfund.nih.gov/idg/index" target="_blank">NIH Illuminating the Druggable Genome (IDG) Program</a></li>
              <li class="fl"><a href="http://icahn.mssm.edu/" target="_blank">Icahn School of Medicine at Mount Sinai</a></li>
            </ul>
          </div>
          <div className="col m2 s12">
            <img src="https://amp.pharm.mssm.edu/enrichmentapi/images/dcic.png" height="130" /><br />
            © Ma'ayan Lab.
          </div>
        </div>
      </div>
    </footer>
    )
  }
}

