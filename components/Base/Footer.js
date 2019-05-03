import React from 'react'

export default function Footer(props) {
  return (
    <footer className="page-footer grey lighten-3 black-text">
      <div className="container">
        <div className="row">
          <div className="col l4 m6 s12">
            <a className="github-button" href="https://github.com/dcic/signature-commons-ui" data-size="large" aria-label="View Source Code dcic/signature-commons-ui on GitHub">View Source Code</a><br />
            <a className="github-button" href="https://github.com/dcic/signature-commons-ui/issues" data-size="large" aria-label="Submit Bug Report dcic/signature-commons-ui on GitHub">Submit Bug Report</a>
          </div>

          <div className="col offset-l6 l2 m6 s12">
            <img src={`${process.env.PREFIX}/static/images/dcic.png`} alt="BD2K-LINCS Data Coordination and Integration Center" height="130" /><br />
          </div>
        </div>
      </div>
    </footer>
  )
}
